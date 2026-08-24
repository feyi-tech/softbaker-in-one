
import { INode, parse, stringify } from "svgson"

import "./polyfills/Image.ts"
import "./polyfills/DOMParser.ts"
import "./polyfills/File.ts"
import { 
    isVoid, nullOrEmpty, base64ToSvg, genId, base64ToFile, orderOptions, orderByName,
    mergeTemplateData, isUploadedFileUrl, isImageDataUrl, getImage, getImageMask, cleanFilename, 
    convertPngBase64ImagesToJpeg, convertPngBase64ImagesWithUPNG, buildImageSelectName, buildImageSelectNameReverse,
    breakName, showField, splitSvgElementId, useDataForRandSeed, valueOfParseValue, actionsStorageKey, fileFieldStorageKey,
    fileDocStorageKey, fileCollectionStorageKey, isBrowser, saveFileFieldFile, getFileFieldFile, moveFileFieldFile, 
    deleteFileFieldFile, deleteDataWithKeyPrefix, arrayToMap, isTheSameUrl, expandImagesMap, setR2Host,
    FileFieldsFiles
} from "./utils.ts"
import { 
    fetchImageForBase64, getUrlUpdatesCount,
    removeUpdateQueryString, compareBase64, removeQueryString, incrementUpdateQueryString, 
    mergeImages, generateWatermark
} from "./images-processor.ts"
import { 
    base64ToImage, analyzeImage
} from "./imagePassportUtils.ts"
import { 
    AnalyzeResult
} from "./imagePassportUtils.ts"
import FILTERS from "./filters.ts"
import { responsiveFontSize, responsivePathD, responsiveTransform, responsiveViewBox } from "./svgScaler.ts"
import { getResponsiveX, getResponsiveY } from "./toolsFunc.ts"
import { OBSCURE_PCT, obscureText, watermark } from "./watermaker.ts"
import { textGenCodeParser } from "./textGenCodeParser.ts"
import { getIdentifier, parseAndModifyCSS, parseValueUnit } from "./cssParser.ts"
import { 
    getFontFormat, getFontFamiliesFromSVG, generateFontMap, collectFontFamilies,
    extractFontFamiliesFromCSS, getFontId, createFontThumbnail 
} from "./font-utils.ts"

import { downloadSvgAsImage } from "./getSvg.ts"
import getDefaultFieldsValue from "./get-default-fields-value.ts"
import { 
    timestampToDate, dateToTimestamp, joinTimeSegments, secondsToTimeSegments, 
    parsePaymentWindow, timestampToGmt, gmtTimestampToLocal 
} from "./time.ts"

import {
    getImageColor, getImageDimension, imageToStamp, isBlankImage, cropImage, reduceBase64Image
} from "./imageHelper.ts"

import {
    Doc, FileMap, FileImage, FilterArgs, Filters, Declaration, CssDeclarations,
    CssAction, CssActions, Mask, Filter, TextSelectSettings, MaskMap, MapWithName, FieldsData, Fields, Field,
    Template, TemplateData, Templates, TemplatesResults, Font, FontsMap, ImageUploadMaskInfo
} from "./types.ts"
import { getImageDimensions, resizeBase64Image } from "./base64Image.ts"
/*
import { writeFileSync } from "fs"
import path from "path"
import { cwd } from "process"
*/

export {
    downloadSvgAsImage, 
    getDefaultFieldsValue,
    getFontFormat, getFontFamiliesFromSVG, generateFontMap,
    getIdentifier, parseValueUnit, parseAndModifyCSS,
    collectFontFamilies, extractFontFamiliesFromCSS, getFontId, createFontThumbnail,
    timestampToDate, dateToTimestamp, joinTimeSegments, secondsToTimeSegments, 
    parsePaymentWindow, timestampToGmt, gmtTimestampToLocal,
    arrayToMap, 
    FILTERS
}

export { 
    fetchImageForBase64, getUrlUpdatesCount,
    removeUpdateQueryString, compareBase64, removeQueryString, incrementUpdateQueryString, 
    mergeImages, generateWatermark
}

export {
    isVoid, nullOrEmpty, base64ToSvg, genId, base64ToFile, orderOptions, orderByName,
    mergeTemplateData, isUploadedFileUrl, isImageDataUrl, getImage, getImageMask, cleanFilename, 
    convertPngBase64ImagesToJpeg, convertPngBase64ImagesWithUPNG, buildImageSelectName, buildImageSelectNameReverse,
    breakName, showField, splitSvgElementId, useDataForRandSeed, valueOfParseValue, actionsStorageKey, fileFieldStorageKey,
    fileDocStorageKey, fileCollectionStorageKey, isBrowser, saveFileFieldFile, getFileFieldFile, moveFileFieldFile, 
    deleteFileFieldFile, deleteDataWithKeyPrefix
}

export {
    getImageColor, getImageDimension, imageToStamp, isBlankImage, cropImage, reduceBase64Image
}

export { 
    base64ToImage, analyzeImage, isTheSameUrl, expandImagesMap, setR2Host
}

export type {
    Doc, FileMap, FileImage, FilterArgs, Filters, Declaration, CssDeclarations,
    CssAction, CssActions, Mask, Filter, TextSelectSettings, MaskMap, MapWithName, FieldsData, Fields, Field,
    Template, TemplateData, Templates, TemplatesResults, Font, FontsMap, ImageUploadMaskInfo, AnalyzeResult
}

const getFieldId = (id: string) => {
  const [ name, ext ] = id.split(".")
  return `${name}.${(ext || "").split("_")[0].trim()}`.trim()
}

const applyFiltersRecursively = async (base64Image: string, filters: (Mask | null)[], excludedFilters?: string[]) => {
  ////console.log("transformImageByTemplate:0", filters[0])
  const result = !filters[0] || (excludedFilters && excludedFilters.includes(filters[0].filter_id))? base64Image : await FILTERS[filters[0].filter_id].filter(base64Image, filters[0].args)
  filters.shift()
  if(filters.length == 0) {
      return result;

  } else {
      return applyFiltersRecursively(result, filters, excludedFilters)
  }
}

const applyFilters = (base64Image: string, filters: (Mask | null)[], excludedFilters?: string[]): Promise<string> => {
  return new Promise(async (resolve, reject) => {
      try {
        
        //console.log("applyFilters.1", base64Image.substring(0, 10))
        const base64 = await applyFiltersRecursively(base64Image, filters, excludedFilters)
        
        //console.log("applyFilters.2", base64.substring(0, 10))
        resolve(base64)

      } catch(e: any) {
        //console.log("applyFilters.error", e?.message)
        reject(e)
      }
  })
}

const imagesToBase64 = async (
    storageHost: string,
    images: FileMap,
    data: FieldsData,
    templateData: TemplateData,
    deviceWidth?: number | null,
    maxRetries: number = 5, 
    fileFieldTypesDefaultFiles?: FileFieldsFiles
  ): Promise<FileMap> => {
    const entries = Object.entries(images);
    const successful: FileMap = {};
    let remaining = entries;
  
    for (let attempt = 1; attempt <= maxRetries && remaining.length > 0; attempt++) {
      console.log(`🌀 Attempt ${attempt} - ${remaining.length} image(s) remaining`);
  
      const failed: typeof remaining = [];
  
      const promises = remaining.map(async ([id, url]) => {
        try {
          const fieldId = getFieldId(id);
          let base64: string | null = null;
  
          if (["image_upload", "faceshot", "sign"].includes(templateData.fields[fieldId]?.type)) {
            const img = data[fieldId] && isImageDataUrl(data[fieldId])
              ? data[fieldId]
              : getFileFieldFile("other_tools_data", data.id, fieldId, fileFieldTypesDefaultFiles);
            base64 = img;
          } else if (!id.endsWith("_thumbnail")) {
            const base64Url = getImage(id, images, deviceWidth ? `_${deviceWidth}` : null);
            if (base64Url) {
              base64 = await fetchImageForBase64(storageHost, base64Url);
            }
          }

          if(base64 && isImageDataUrl(base64) && base64.startsWith('data:img/')) {
            base64 = `data:image/${base64.substring('data:img/'.length)}`
          }
  
          if (base64 && isImageDataUrl(base64) && templateData.masks) {
            const maskId = templateData.fields[fieldId]?.type === "image_select" ? fieldId : id;
            const mask = templateData.masks[maskId];
            if (mask) {
              const filters = Object.values(mask);
              if (["sign", "image_upload"].includes(templateData.fields[fieldId]?.type)) {
                base64 = await applyFilters(base64, filters, ["ImageTransform"]);
              } else {
                base64 = await applyFilters(base64, filters);
              }
            }
          }
  
          successful[id] = base64 || "";
          return;
        } catch (err: any) {
          console.warn(`⚠️ Failed to fetch image for "${id}" on attempt ${attempt}:`, err.message);
          failed.push([id, url]);
        }
      });
  
      await Promise.all(promises);
      remaining = failed;
    }
  
    if (remaining.length > 0) {
      throw new Error(`❌ Failed to fetch ${remaining.length} image(s) after ${maxRetries} attempts.`);
    }
  
    return successful;
};  

export function rotateTransformValue(degree: number, x: number, y: number, width: number, height: number) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  return `rotate(${degree} ${cx} ${cy})`;
}

const FRACTION_DIGITS = 3
const scaleSvg = (
  child: INode, 
  preferedWidth: number, 
  preferedHeight: number, 
  templateWidth: number, 
  templateHeight: number,
  textContent?: string | null, 
  maxTextBeforeScaleDown?: number | number
) => {

  if(child.attributes.width) {
      child.attributes.width = `${getResponsiveX(Number(child.attributes.width), preferedWidth, templateWidth, FRACTION_DIGITS)}`
  }
  if(child.attributes.height) {
      child.attributes.height = `${getResponsiveY(Number(child.attributes.height), preferedHeight, templateHeight, FRACTION_DIGITS)}`
  }

  if(child.attributes.x) {
      child.attributes.x = `${getResponsiveX(Number(child.attributes.x), preferedWidth, templateWidth, FRACTION_DIGITS)}`
  }
  if(child.attributes.y) {
      child.attributes.y = `${getResponsiveY(Number(child.attributes.y), preferedHeight, templateHeight, FRACTION_DIGITS)}`
  }

  if(child.attributes.transform) {
      child.attributes.transform = responsiveTransform(
          child.attributes.transform,
          (v) => getResponsiveX(v, preferedWidth, templateWidth, FRACTION_DIGITS), 
          (v) => getResponsiveY(v, preferedHeight, templateHeight, FRACTION_DIGITS), 
          textContent, maxTextBeforeScaleDown
      )
  }

  if(child.name == "path" && child.attributes.d) {
      child.attributes.d = responsivePathD(
          child.attributes.d, 
          (v) => getResponsiveX(v, preferedWidth, templateWidth, FRACTION_DIGITS), 
          (v) => getResponsiveY(v, preferedHeight, templateHeight, FRACTION_DIGITS)
      )
  }

  if(child.attributes.dy) {
      child.attributes.dy = `${getResponsiveY(Number(child.attributes.dy), preferedHeight, templateHeight, FRACTION_DIGITS)}`
  }
  
  if(child.children.length > 0) {
      for(var i = 0; i < child.children.length; i++) {
          scaleSvg(child.children[i], preferedWidth, preferedHeight, templateWidth, templateHeight, textContent, maxTextBeforeScaleDown)
      }
  }
}

export const getTextAreaMaxLength = (
  textAreaNode: INode,
  textInput?: string,
  tag?: string,
  maxCharsPerLine?: number,
  showWatermark?: boolean | null
): {
  maxLines: number,
  defaultInputLines: string[]
} => {
  let maxLines = 0;
  const textInputLines = textInput ? textInput.split("\n") : [];
  const totalTextInputLines = textInputLines.length;
  const defaultInputLines = [];

  const breakLineSafely = (line: string, maxLength: number): string[] => {
      const result = [];
      let currentLine = "";

      for (const word of line.split(" ")) {
          if ((currentLine + word).length > maxLength) {
              if (currentLine.length > 0) {
                  result.push(currentLine.trim());
              }
              currentLine = word + " ";
          } else {
              currentLine += word + " ";
          }
      }

      if (currentLine.trim().length > 0) {
          result.push(currentLine.trim());
      }

      return result;
  };

  for (let i = 0; i < textAreaNode.children.length; i++) {
      if (textAreaNode.children[i].value.length > 0) {
          maxLines++;
          defaultInputLines.push(textAreaNode.children[i].value);

          if (textInputLines.length > 0) {
              let modifiedText = textInputLines[0];

              if (maxCharsPerLine && modifiedText.length > maxCharsPerLine) {
                  const brokenLines = breakLineSafely(modifiedText, maxCharsPerLine);
                  modifiedText = brokenLines.shift() || "";
                  textInputLines[0] = brokenLines.join("\n");
              } else {
                  textInputLines.shift();
              }

              // Apply text obfuscation before setting the value
              if(showWatermark) {
                  textAreaNode.children[i].value = obscureText(modifiedText, OBSCURE_PCT);

              } else {
                  textAreaNode.children[i].value = modifiedText
              }
          } else if (totalTextInputLines > 0) {
              textAreaNode.children[i].value = "";
          }
      }

      if (textAreaNode.children[i].children.length > 0) {
          for (let j = 0; j < textAreaNode.children[i].children.length; j++) {
              if (textAreaNode.children[i].children[j].value.length > 0) {
                  maxLines++;
                  defaultInputLines.push(textAreaNode.children[i].children[j].value);

                  if (textInputLines.length > 0) {
                      let modifiedText = textInputLines[0];

                      if (maxCharsPerLine && modifiedText.length > maxCharsPerLine) {
                          const brokenLines = breakLineSafely(modifiedText, maxCharsPerLine);
                          modifiedText = brokenLines.shift() || "";
                          textInputLines[0] = brokenLines.join("\n");
                      } else {
                          textInputLines.shift();
                      }

                      // Apply text obfuscation before setting the value
                      if(showWatermark) {
                          textAreaNode.children[i].children[j].value = obscureText(modifiedText, OBSCURE_PCT);
      
                      } else {
                          textAreaNode.children[i].children[j].value = modifiedText
                      }
                  } else if (totalTextInputLines > 0) {
                      textAreaNode.children[i].children[j].value = "";
                  }
              }
          }
      }
  }

  return {
      maxLines,
      defaultInputLines
  };
};

const mutateParsedSvg = (
  fields: Fields,
  parsedSvg: INode, id: string, childIndex: number, field: Field, 
  images: FileMap, data: FieldsData, 
  templateWidth?: number | null, templateHeight?: number | null, width?: number | null,
  showWatermark?: boolean | null,
  mask?: Filter | null
): void => {

  if(!showField(field, fields, data)) {
      parsedSvg.children[childIndex].attributes["class"] = "hide"
      return
  }

  if(parsedSvg.children[childIndex].name == "image" && !field?.type) {
      

      ////console.log("parsedSvg.mutateParsedSvg ", width, templateWidth, templateHeight, " _SUFFIX_ ", width? `_${width}` : null)
      
      const img = getImage(id, images, width? `_${width}` : null)
      parsedSvg.children[childIndex].attributes["xlink:href"] = img
  }

  
  const addFilter = () => {
      ////console.log("addFilter:", mask, mask?.ImageTransform?.filter_id, mask?.ImageTransform?.args)
      if(mask && mask?.ImageTransform?.filter_id && mask?.ImageTransform?.args) {
          const node = parsedSvg.children[childIndex]
          const x = parseFloat(node.attributes["x"]);
          const y = parseFloat(node.attributes["y"]);
          const width = parseFloat(node.attributes["width"]);
          const height = parseFloat(node.attributes["height"]);

          parsedSvg.children[childIndex].attributes['transform'] = rotateTransformValue(
              mask?.ImageTransform.args?.rotationAngle,
              x, y, width, height
          )
      }
  }

  
  if(parsedSvg.children[childIndex].name != "defs") {
      parsedSvg.children[childIndex].attributes["data-svg-id"] = parsedSvg.children[childIndex].attributes["id"]
  }

  if(field?.type == "image_select") {
      if(data[field.id]) {
        const imageIndex = data[field.id]
        const img = getImage(imageIndex, images, width? `_${width}` : null)
        parsedSvg.children[childIndex].attributes["xlink:href"] = img
        //console.log("parsedSvg.image_select ", field.type, width, templateWidth, templateHeight, " _WITH_SUFFIX_ ", width? `${id}_${width}` : null, !img? "no_image" : img.substring(0, 10))
      }

  } else if(["image_upload", "sign", "faceshot"].includes(field?.type)) {
      if(images[id]) {
          parsedSvg.children[childIndex].attributes["xlink:href"] = images[id]
          if(field?.type == "sign") {
              //addFilter()
              ////console.log("parsedSvg.image_upload/sign", id, mask?.ImageTransform)

          } else if(field?.type == "faceshot") {
              ////console.log("parsedSvg.image_upload/faceshot", id, mask?.ImageTransform)

          }
      }

  } else if(field?.type == "checkbox") {
      if(images[id] && data[field.id]) {
          if(parsedSvg.children[childIndex].name == "image") {
              parsedSvg.children[childIndex].attributes["xlink:href"] = getImage(id, images, width? `_${width}` : null)
          }
      }

  } else if(field?.type == "qrcode") {
      if(images[id]) {
          if(parsedSvg.children[childIndex].name == "image") {
              parsedSvg.children[childIndex].attributes["xlink:href"] = getImage(id, images, width? `_${width}` : null)
          }
      }

  } else if(["text", "defgen"].includes(field?.type)) {
      var child = parsedSvg.children[childIndex].children[0]
      var prevChild = null
      while (child.children && child.children.length > 0) {
          prevChild = child
          child = child.children[0]
      }
      //child.value = data[field.id] || `No ${field.name} entered`
      if(data[field.id]) {
          if(showWatermark) {
              child.value = obscureText(data[field.id], OBSCURE_PCT);//escapeHtmlEntities(data[field.id])//

          } else {
              child.value = data[field.id];//escapeHtmlEntities(data[field.id])//
          }
      }

  } else if(["textarea"].includes(field?.type)) {
      getTextAreaMaxLength(parsedSvg.children[childIndex], data[field.id], field.id, field?.maxCharsPerLine, showWatermark)

  } else if(["gen", "date"].includes(field?.type)) {
      var child = parsedSvg.children[childIndex].children[0]
      var prevChild = null
      while (child.children && child.children.length > 0) {
          prevChild = child
          child = child.children[0]
      }
      ////console.log("textGenCodeParser.1", data, field)
      child.value = textGenCodeParser(field.code, data, useDataForRandSeed, (dataKey, dataAsKey) => {
          ////console.log("textGenCodeParser.2", data?.id, dataKey)
          if(fields[dataKey]?.type == "text_select") {
              return ((fields[dataKey].selections || {})[dataAsKey]?.value || "").trim()
          }
          return dataAsKey
      })

  } else if(["text_select"].includes(field?.type)) {
      var child = parsedSvg.children[childIndex].children[0]
      var prevChild = null
      while (child.children && child.children.length > 0) {
          prevChild = child
          child = child.children[0]
      }
      if(data[field.id]) {
          child.value = ((field.selections || {})[data[field.id]]?.value || "").trim()

      }

  }
}

const CUSTOMER_CSS_VALUE_PROCESSORS: { [x: string]: (value: string) => string } = {
  "letter-spacing": (propertyValue: string) => {
      const { value, unit } = parseValueUnit(propertyValue)
      let updatedValue;
      if(unit == "psd") {
          //Convert psd value to em
          updatedValue = `${parseFloat(value) / 1000}em`

      } else {
          updatedValue = propertyValue
      }

      return updatedValue
  }
}
const updateCustomCssValues = (cssAction: CssAction) => {
  const updatedCssAction = { ...cssAction }
  for(const [key, value] of Object.entries(cssAction)) {
      const updatedDeclarations = [ ...value.declarations ]
      for(var i = 0; i < updatedDeclarations.length; i++) {
          const updatedValueFunc = CUSTOMER_CSS_VALUE_PROCESSORS[value.declarations[i].property]
          if(updatedValueFunc) {
              updatedDeclarations[i] = {
                  ...updatedDeclarations[i],
                  value: updatedValueFunc(value.declarations[i].value)
              }
          }
      }
      updatedCssAction[key].declarations = updatedDeclarations
  }
  
  return updatedCssAction;
}

const updateCustomCssPropertiesValuesToCssValues = (cssActions?: CssActions | null) => {
  if(!cssActions) return null
  const updatedCssActions = { ...cssActions }
  if(updatedCssActions.if_selector) {
      updatedCssActions.if_selector = updateCustomCssValues(updatedCssActions.if_selector)
  }

  if(updatedCssActions.if_property) {
      updatedCssActions.if_property = updateCustomCssValues(updatedCssActions.if_property)
  }

  if(updatedCssActions.if_property_and_value) {
      updatedCssActions.if_property_and_value = updateCustomCssValues(updatedCssActions.if_property_and_value)
  }

  return updatedCssActions
}

function getOcclusionId(a: Record<string, string>, b: Record<string, string>, tag?: string): string | null {
  // Calculate the boundaries of both objects
  const aLeft = Number(a.x);
  const aRight = aLeft + Number(a.width);
  const aTop = Number(a.y);
  const aBottom = aTop + Number(a.height);

  const pct = 5;

  var bLeft = Number(b.x);
  var bRight = bLeft + Number(b.width);
  var bTop = Number(b.y);
  var bBottom = bTop + Number(b.height);

  var bLeftPct = (bLeft * pct) / 100;
  var bRightPct = (bRight * pct) / 100;
  var bTopPct = (bTop * pct) / 100;
  var bBottomPct = (bBottom * pct) / 100;

  // Check if object 'b' is completely behind object 'a'
  const isOccluded = (
      bLeft + bLeftPct >= aLeft && bRight - bRightPct <= aRight &&  // 'b' horizontally inside 'a'
      bTop + bTopPct >= aTop && bBottom - bBottomPct <= aBottom     // 'b' vertically inside 'a'
  );

  /*
  //console.log("getOcclusionId5:", tag, `
      aLeft: ${aLeft} | aRight: ${aRight} | aTop: ${aTop} | aBottom: ${aBottom} | 
      bLeft: ${bLeft} | bRight: ${bRight} | bTop: ${bTop} | bBottom: ${bBottom} | 
  `)*/

  // If 'b' is occluded by 'a', return the id of 'b'. Otherwise, return false.
  return isOccluded ? b.id : null;
}

const calculateElementId = (element: INode, elementIndex: number, allElements: INode[]): string[] => {
  const occlusionIdList = [element.attributes.id]
  for(var i = allElements.length - 1; i >= 0; i--) {
      if(elementIndex != i && allElements[i].name == "image" && allElements[i].attributes) {
          const occlusionId = getOcclusionId(element.attributes, allElements[i].attributes, `${element.attributes.id}:${allElements[i].attributes.id}`)
          if(occlusionId) occlusionIdList.push(occlusionId)
      }
  }
  return occlusionIdList
}

const parseSvgLength = (value?: string | number | null): number | null => {
    if(value === null || value === undefined) return null
    const text = `${value}`.trim()
    if(text.endsWith("%")) return null
    const parsed = parseFloat(text)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const parseSvgViewBoxSize = (viewBox?: string | null): { width: number, height: number } | null => {
    if(!viewBox) return null
    const values = viewBox.trim().split(/[\s,]+/).map(value => parseFloat(value))
    if(values.length !== 4 || values.some(value => !Number.isFinite(value))) return null

    const width = values[2]
    const height = values[3]
    return width > 0 && height > 0 ? { width, height } : null
}

const getTemplateSvgSize = (attributes: Record<string, string>): { width: number, height: number } | null => {
    const width = parseSvgLength(attributes.width)
    const height = parseSvgLength(attributes.height)
    const viewBoxSize = parseSvgViewBoxSize(attributes.viewBox)

    if(width && height) return { width, height }

    if(viewBoxSize) {
        if(width) return { width, height: (width / viewBoxSize.width) * viewBoxSize.height }
        if(height) return { width: (height / viewBoxSize.height) * viewBoxSize.width, height }
        return viewBoxSize
    }

    return null
}

export const getSvg = (
    storageHost: string,
    data: FieldsData, templateData: TemplateData, fonts?: FontsMap | null, showWatermark?: boolean | null, 
    width?: number | "max" | null, 
    tempMask?: MaskMap | null, 
    fileFieldTypesDefaultFiles?: FileFieldsFiles
): Promise<string> => {
  ////console.log("formatDate:3.w", width)

  return new Promise(async (resolve, reject) => {

      parse(templateData.svg)
      .then(async parsedSvg => {
            const fieldsKeys = Object.keys(templateData.fields)
            const templateSize = getTemplateSvgSize(parsedSvg.attributes)
            if(!templateSize) {
                throw new Error("Invalid SVG template dimensions.")
            }

            const templateWidth = templateSize.width
            const templateHeight = templateSize.height

            const parsedPreferedWidth = !width || width == "max"? templateWidth : parseSvgLength(width)
            if(!parsedPreferedWidth) {
                throw new Error("Invalid SVG render width.")
            }
            const preferedWidth: number = parsedPreferedWidth
            //if(preferedWidth && preferedWidth > 728 && !isHighQuality) preferedWidth = 728

            const preferedHeight = ((preferedWidth / templateWidth) * templateHeight)
            let images = await imagesToBase64(storageHost, templateData.images, data, templateData, preferedWidth, 5, fileFieldTypesDefaultFiles)
            //writeFileSync(path.join(cwd(), "./images.json"), JSON.stringify(images, null, "\t"))
            //console.log("parsedSvg.images", images)
            //resolve(stringify(parsedSvg))/*

            let maskImageWidth = 0, maskImageHeight = 0, maskImageX = 0, maskImageY = 0;
            var defIndex = -1

            //Scale down the SVG
            parsedSvg.attributes.width = `${preferedWidth}`
            parsedSvg.attributes.height = `${preferedHeight}`

            if(parsedSvg.attributes.viewBox) {
                parsedSvg.attributes.viewBox = responsiveViewBox(
                    parsedSvg.attributes.viewBox, 
                    (v) => getResponsiveX(v, preferedWidth, templateWidth, FRACTION_DIGITS), 
                    (v) => getResponsiveY(v, preferedHeight, templateHeight, FRACTION_DIGITS)
                )
            }

            for(var i = parsedSvg.children.length - 1; i >= 0; i--) {
                const child = parsedSvg.children[i]

                const { name, type, selectIndex, typeAndSelectIndex } = splitSvgElementId(child.attributes.id)
                const key = `${name}.${type}`

                //Scale down the SVG child
                const field = templateData.fields[key]
                if(child.attributes.id == "Company_Name.text") {
                    ////console.log("valueArray:1", key, child.attributes.id, field?.id, field, data[field?.id || ""], data)
                }
                scaleSvg(child, preferedWidth, preferedHeight, templateWidth, templateHeight, data[field?.id || ""], field?.maxTextBeforeScaleDown)

                //console.info("parsedSvg.otherz.0", key, child.attributes.x, child.attributes.y)
                if(child.name == "defs") {
                    defIndex = i

                } else if(fieldsKeys.includes(key) || child.name == "image") {
                    
                    var fieldId = getFieldId(child.attributes.id)//id.split("_")[0]
                    const imageId = type == "image_select"? fieldId : child.attributes.id

                    mutateParsedSvg(templateData.fields,
                        parsedSvg, child.attributes.id, i, templateData.fields[key], images, data, 
                        templateWidth, templateHeight, preferedWidth, showWatermark, 
                        (tempMask || {})[imageId] || (templateData?.masks || {})[imageId]
                    )
                    
                    ////console.log("parsedSvg.otherz!!", imageId, tempMask, (tempMask || {})[imageId], ((tempMask || {})[imageId] || {}).ImageTransform)
                    if(((tempMask || {})[imageId] || {}).ImageTransform) {
                        ////console.log("parsedSvg.otherz!", key, child.attributes.x, child.attributes.y)
                        maskImageWidth = parseFloat(child.attributes.width)
                        maskImageHeight = parseFloat(child.attributes.height)
                        maskImageX = parseFloat(child.attributes.x)
                        maskImageY = parseFloat(child.attributes.y)
                        ////console.log("parsedSvg.otherz!.2", key, maskImageX, maskImageY, tempMask)
                    }
                }
            }

            var calulatedIdList: string[] = []
            for(var i = parsedSvg.children.length - 1; i >= 0; i--) {
                const child = parsedSvg.children[i]
                if(child.name == "image") {
                    // Add a custom data attribute to identify the clickable element
                    const calculatedId = calculateElementId(child, i, parsedSvg.children).filter(id => !calulatedIdList.includes(id));
                    calulatedIdList = calulatedIdList.concat(calculatedId)
                    parsedSvg.children[i].attributes['data-click-element-id'] = 
                    calculatedId.length == 0? 
                    parsedSvg.children[i].attributes.id : calculatedId.join();
                }
            }

            //Add fonts and widgets styles
            if(defIndex == -1) {
                //defIndex = 0
            }
                
            if(defIndex > -1) {
                const el = parsedSvg.children[defIndex]
                ////console.log("parsedSvg:defs", el)
                // Check for <defs> and <style> elements
                if (el.children) {
                    el.children.forEach(child => {
                        if (child.name === 'style' && child.children && child.children.length > 0) {
                            const cssContent = child.children[0].value;

                            const updatedCssContent = parseAndModifyCSS(cssContent, (selector, declarations) => {

                                const css = updateCustomCssPropertiesValuesToCssValues(templateData.cssActions)
                                const ifSelector = css?.if_selector || {}
                                const ifProperty = css?.if_property || {}
                                const ifpropertyAndValue = css?.if_property_and_value || {}

                                var updatedDeclarations = [ ...declarations ]

                                //Update the selector actions first, then the property action, then the property and value.
                                //This will allow property and value action to have precedence over the property action, and the 
                                //property action over the selector action

                                const ifSelectorActionAll = ifSelector["*"]
                                const ifSelectorAction = ifSelector[getIdentifier(selector)]

                                if( ifSelectorActionAll ) {
                                    if(ifSelectorActionAll.shouldReplace) {
                                        updatedDeclarations = ifSelectorActionAll.declarations

                                    } else {
                                        updatedDeclarations = [ ...updatedDeclarations, ...ifSelectorActionAll.declarations ]
                                    }
                                }

                                if( ifSelectorAction ) {
                                    if(ifSelectorAction.shouldReplace) {
                                        updatedDeclarations = ifSelectorAction.declarations

                                    } else {
                                        updatedDeclarations = [ ...updatedDeclarations, ...ifSelectorAction.declarations ]
                                    }
                                }
                                
                                for(var i = 0; i < declarations.length; i++) {
                                    const decl = declarations[i]
                                    const ifPropertyActionAll = ifProperty["*"]
                                    const ifPropertyAction = ifProperty[getIdentifier(decl.property)]

                                    const ifPropertyAndValueActionAll = ifpropertyAndValue["*"]
                                    const ifPropertyAndValueAction = ifpropertyAndValue[getIdentifier(decl.property, decl.value)]

                                    if( ifPropertyActionAll ) {
                                        if(ifPropertyActionAll.shouldReplace) {
                                            updatedDeclarations = ifPropertyActionAll.declarations

                                        } else {
                                            updatedDeclarations = [ ...updatedDeclarations, ...ifPropertyActionAll.declarations ]
                                        }
                                    }

                                    if( ifPropertyAction ) {
                                        if(ifPropertyAction.shouldReplace) {
                                            updatedDeclarations = ifPropertyAction.declarations

                                        } else {
                                            updatedDeclarations = [ ...updatedDeclarations, ...ifPropertyAction.declarations ]
                                        }
                                    }

                                    if( ifPropertyAndValueActionAll ) {
                                        if(ifPropertyAndValueActionAll.shouldReplace) {
                                            updatedDeclarations = ifPropertyAndValueActionAll.declarations

                                        } else {
                                            updatedDeclarations = [ ...updatedDeclarations, ...ifPropertyAndValueActionAll.declarations ]
                                        }
                                    }

                                    if( ifPropertyAndValueAction ) {
                                        if(ifPropertyAndValueAction.shouldReplace) {
                                            updatedDeclarations = ifPropertyAndValueAction.declarations

                                        } else {
                                            updatedDeclarations = [ ...updatedDeclarations, ...ifPropertyAndValueAction.declarations ]
                                        }
                                    }
                                    
                                    if (decl.property === 'font-size') {
                                        updatedDeclarations.push(
                                            { 
                                                property: 'font-size', 
                                                value: responsiveFontSize(
                                                    decl.value, 
                                                    templateWidth,
                                                    templateHeight,
                                                    preferedWidth,
                                                    preferedHeight
                                                ) 
                                            }
                                        )
                                    }
                                }
                                
                                return updatedDeclarations;
                            })
                            child.children[0].value = updatedCssContent;
                            ////console.log("parsedSvg:defs.css.init ", cssContent)
                            ////console.log("parsedSvg:defs.css.final ", updatedCssContent)
                        }
                    });
                }

                //Sets styles
                const styles = []
                //Sets style for hiding elements
                styles.push({
                    "name": "style",
                    "type": "element",
                    "value": "",
                    "attributes": {},
                    "children": [
                        {
                            "name": "",
                            "type": "text",
                            "value": `.hide { opacity: 0 !important;}`,
                            "attributes": {},
                            "children": []
                        }
                    ]
                } as INode)
                //Sets styles for filter widgets
                styles.push({
                    "name": "style",
                    "type": "element",
                    "value": "",
                    "attributes": {},
                    "children": [
                        {
                            "name": "",
                            "type": "text",
                            "value": `#softbaker-slider-handle, #softbaker-button-background, #softbaker-button-text, #softbaker-cancel-background, #softbaker-cancel-text, #softbaker-slider-track { cursor: pointer !important;}`,
                            "attributes": {},
                            "children": []
                        }
                    ]
                } as INode)
                parsedSvg.children[defIndex].children = styles.concat(parsedSvg.children[defIndex].children)
                
                if(fonts) {
                    //Add fonts
                    const fontsElements = []
                    
                    for(const font of Object.values(fonts)) {
                        if(font.dataUrl && font.ext) {
                            fontsElements.push({
                                "name": "style",
                                "type": "element",
                                "value": "",
                                "attributes": {},
                                "children": [
                                    {
                                        "name": "",
                                        "type": "text",
                                        "value": `\n      @font-face {\n        font-family: "${font.name}";\n        src: url(${font.dataUrl}) format(${getFontFormat(font.ext)});\n      }`,
                                        "attributes": {},
                                        "children": []
                                    }
                                ]
                            } as INode)
                        }
                    }
                    if(fontsElements.length > 0) {
                        parsedSvg.children[defIndex].children = fontsElements.concat(parsedSvg.children[defIndex].children)
                    }
                }

            }

            //Add Rotate widgets
            if(tempMask) {
                
                const maskKey = Object.keys(tempMask)[0]
                const maskValue = ((tempMask || {})[maskKey] || {}).ImageTransform

                ////console.log("parsedSvg.otherz.tempMask", tempMask, "maskValue:", maskValue, maskImageX, maskImageY, maskImageWidth, maskImageHeight)

                const colorAccent = "#dd6b20"
                //Rect for slider
                const rect = {
                    "name": "rect",
                    "type": "element",
                    "value": "",
                    "attributes": {
                        "id": "softbaker-slider-track",
                        "x": maskImageX + "",
                        "y": maskImageY + maskImageHeight + 10 + "",
                        "width": maskImageWidth + "",
                        "height": "10",
                        "fill": "#2a2a2a"
                    },
                    "children": []
                }

                //Circle for slider
                const degree = maskValue?.args?.rotationAngle || 0//(newX / rect.width) * 360;
                const cx = (degree * parseFloat(rect.attributes.width)) / 360
                const circle = {
                    "name": "circle",
                    "type": "element",
                    "value": "",
                    "attributes": {
                        "id": "softbaker-slider-handle",
                        "cx": maskImageX + cx + "",
                        "cy": parseFloat(rect.attributes.y) + (parseFloat(rect.attributes.height) / 2) + "",
                        "r": parseFloat(rect.attributes.height) + "",
                        "fill": colorAccent
                    },
                    "children": []
                }
                
                //Background for submit
                const bg = {
                    "name": "rect",
                    "type": "element",
                    "value": "",
                    "attributes": {
                        "id": "softbaker-button-background",
                        "x": maskImageX + "",
                        "y": parseFloat(rect.attributes.y) + parseFloat(rect.attributes.height) + 10 + "",
                        "width": "40",
                        "height": "20",
                        "rx": "10",
                        "ry": "10",
                        "fill": colorAccent
                    },
                    "children": []
                }

                //Text for submit
                const text = {
                    "name": "text",
                    "type": "element",
                    "value": "",
                    "attributes": {
                        "id": "softbaker-button-text",
                        "x": maskImageX + (parseFloat(bg.attributes.width) / 2) + "",
                        "y": parseFloat(bg.attributes.y) + (parseFloat(bg.attributes.height) / 2) + 5 + "",
                        "font-size": "14",
                        "text-anchor": "middle",
                        "fill": "#FFFFFF"
                    },
                    "children": [
                        {
                            "name": "",
                            "type": "text",
                            "value": "✔",
                            "parent": null,
                            "attributes": {},
                            "children": []
                        }
                    ]
                }

                //Background for cancel
                const submitCancelSpace = 50
                const cancelBg = {
                    "name": "rect",
                    "type": "element",
                    "value": "",
                    "attributes": {
                        "id": "softbaker-cancel-background",
                        "x": maskImageX + submitCancelSpace + "",
                        "y": parseFloat(rect.attributes.y) + parseFloat(rect.attributes.height) + 10 + "",
                        "width": "40",
                        "height": "20",
                        "rx": "10",
                        "ry": "10",
                        "stroke": colorAccent
                    },
                    "children": []
                }

                //Text for cancel
                const cancelText = {
                    "name": "text",
                    "type": "element",
                    "value": "",
                    "attributes": {
                        "id": "softbaker-cancel-text",
                        "x": maskImageX + submitCancelSpace + (parseFloat(bg.attributes.width) / 2) + "",
                        "y": parseFloat(bg.attributes.y) + (parseFloat(bg.attributes.height) / 2) + 5 + "",
                        "font-size": "14",
                        "text-anchor": "middle",
                        "fill": "#FFFFFF"
                    },
                    "children": [
                        {
                            "name": "",
                            "type": "text",
                            "value": "❌",
                            "parent": null,
                            "attributes": {},
                            "children": []
                        }
                    ]
                }

                parsedSvg.children = parsedSvg.children.concat(
                    [rect, circle, bg, text, cancelBg, cancelText]
                )
            }

            //if(width == 1024) //console.log("formatDate:3.1", parsedSvg)
            //if(width == 1024) //console.log("formatDate:3.2", stringify(parsedSvg))
            //Add watermark
            ////console.log("DataIsFreemium:", data.is_freemium)
            if(showWatermark) {
                watermark(stringify(parsedSvg), templateWidth, templateHeight)
                .then(watermark => {
                    parsedSvg.children.push({
                        "name": "image",
                        "type": "element",
                        "value": "",
                        "attributes": {
                            "id": "watermark-" + genId(8),
                            "width": templateWidth + "",
                            "height": templateHeight + "",
                            "xlink:href": watermark
                        },
                        "children": []
                    })
                    //if(width == 1024) //console.log("formatDate:3.3", stringify(parsedSvg))
                    resolve(stringify(parsedSvg))
                })
                .catch((e) => {
                    //if(width == 1024) //console.log("formatDate:3.e", e.message)
                    reject(e)
                })

            } else {
                //if(width == 1024) //console.log("formatDate:3.4", stringify(parsedSvg))
                resolve(stringify(parsedSvg))
            }//*/
            
        })
        .catch(e => {
            //if(width == 1024) //console.log("formatDate:4", e.message)
            reject(e)
        })
    })
}

// Utility function to remove underscore(_) at the ends of an id which is the photoshop version of white spaces at the ends
export const trimId = (name: string) => {
    return name.replace(/^_+|_+$/g, '');
}

export const splitElementNameWithDirective = (nameWithDirective: string) => {
    const [ name, directive ] = nameWithDirective.split("@")

    return { name, directive }
}

const getPlaceholder = (element: INode) => {
    var child = element.children[0]
    var prevChild = null
    while (child.children && child.children.length > 0) {
        prevChild = child
        child = child.children[0]
    }
    const placeholder = child.value
    return nullOrEmpty(placeholder)? null : placeholder
}
const updateFields = (fields: Fields, id: string, element: INode) => {
    const elementName = element.name
    const { name, type, selectIndex, typeAndSelectIndex } = splitSvgElementId(id)

    if(!typeAndSelectIndex || !type) return { field: null, updatedFields: fields }

    const field: Field = { } as Field
    switch (type) {
        case "select"://Covers image select, text select, textarea select,...
            field.id = `${name}.${type}`
            field.name = breakName(name)
            field.type = `${elementName}_${type}`
            if(elementName == "image") {
                const option = {
                    name: `${breakName(name)} ${selectIndex}`,
                    id: id,
                    index: selectIndex || 0,
                    type: elementName
                }
                field.options = orderOptions({...(fields[field.id]?.options || {}), [option.id]: option})
            }
            break;
        case "upload":
            field.id = `${name}.${type}`
            field.name = breakName(name)
            field.type = `${elementName}_${type}`
            break;
        case "faceshot":
            field.id = `${name}.${type}`
            field.name = breakName(name)
            field.type = type
            break;
        case "text":
        case "gen":
        case "defgen":
        case "date":
            field.id = `${name}.${type}`
            field.name = breakName(name)
            field.type = type
            field.placeholder = getPlaceholder(element) || field.name
            break;
        case "textarea":
            field.id = `${name}.${type}`
            field.name = breakName(name)
            field.type = type
            field.placeholder = getTextAreaMaxLength(element).defaultInputLines.join("\n")
            break;
        default://Covers text, textarea, and others
            field.id = `${name}.${type}`
            field.name = breakName(name)
            field.type = type
            break;
    }
    if(Object.keys(field).length > 0) fields[field.id] = field

    return {
        field,
        updatedFields: fields
    }
}

// Function to convert PSD to SVG and placeholders
export const buildTemplateDataFromSvg = (base64?: string | null): Promise<TemplateData | null> => {
    return new Promise(async (resolve, reject) => {
        try {

            if(base64) {
                parse(base64ToSvg(base64))
                .then(async parsedSvg => {
                    const annotationErrors: string[] = []
                    const images: FileMap = { }
                    var imagesArray: string[] = []
                    var imagesIdArray: string[] = []
                    const idListOfImagesWithThumbnails: string[] = []
                    var fields: Fields = { }
                    const children = []
                    const processedChoiceFields: string[] = []
                    const masks: MaskMap = {}
                    //Used to check if the title and description directives are declared
                    var title, desc
                    const imageAnalysisPromises: (Promise<ImageUploadMaskInfo>)[] = []
                    for(const el of parsedSvg.children) {
                        const id = trimId(el.attributes["data-name"] || el.attributes.id || genId(8))
                        el.attributes.id = id
                        const { field, updatedFields } = updateFields(fields, id, el)
                        fields = updatedFields
                        //console.log("parsedSvg2:ID", el.attributes["data-name"], id, field?.type)

                        if(el.name == "image") {
                            if(!field?.type || !["image_upload", "sign", "faceshot"].includes((field?.type || ""))) {
                                //If the image is a copy of an image already added,
                                if(imagesArray.includes(el.attributes["xlink:href"])) {
                                    //set the image as a reference to the already added copy
                                    const imageIndex = imagesArray.indexOf(el.attributes["xlink:href"])
                                    images[id] = imagesIdArray[imageIndex]

                                } else {
                                    //add the image
                                    images[id] = el.attributes["xlink:href"]
                                    imagesArray.push(el.attributes["xlink:href"])
                                    imagesIdArray.push(id)
                                }

                            } else {
                                //Since the user will be the one to provide it, then no need to upload the placeholder image
                                //Just asign an empty value so the image can be detected has an image to be processed
                                //especially during the application of filter on the image.
                                /*
                                const zRotation = await getZRotationDegree(el.attributes["xlink:href"])
                                if(zRotation != 0) {
                                    masks[id] = {filter_id: "Rotate", args: { degree: zRotation }}
                                }*/

                                imageAnalysisPromises.push(new Promise(async (resolve, reject) => {
                                    const imageEl = await base64ToImage(el.attributes["xlink:href"]);
                                    try {
                                        const analysisResult = await analyzeImage(imageEl, true);
                                        //rotationAngle is way off on analysis done on signatures, and most signature angles are close to 0
                                        //if(field?.type == "sign") analysisResult.rotationAngle = 0
                                        resolve({
                                            imageId: id,
                                            filterId: "ImageTransform",
                                            mask: {filter_id: "ImageTransform", args: analysisResult }
                                        })

                                    } catch(e: any) {
                                        //console.log("annotationErrors:e", e.message)
                                        annotationErrors.push(`${el.attributes["id"]} has image annotation error: ${e.message}`)
                                        reject(e)
                                    }
                                }))
                                images[id] = ""
                            }
                            
                            el.attributes["xlink:href"] = ""
                            if(field && field.type == "image_select") {
                                idListOfImagesWithThumbnails.push(id)
                            }
                        }

                        if(field) {
                            if(["image_select", "text_select", "textarea_select"].includes(field?.type)) {
                                el.attributes.id = field.id
                                if(!processedChoiceFields.includes(el.attributes.id)) {
                                    children.push(el)
                                    processedChoiceFields.push(el.attributes.id)
                                }

                            } else {
                                const { name } = splitSvgElementId(id)
                                const { directive } = splitElementNameWithDirective(name)
                                if(directive && directive == "name") {
                                    title = id

                                } else if(directive && directive == "desc") {
                                    desc = id

                                }
                                children.push(el)
                                //processedChoiceFields.push(field.type)
                            }

                        } else {
                            children.push(el)
                        }

                    }

                    let imageAnalysisPromisesError
                    if(imageAnalysisPromises.length > 0) {
                        try {
                            const all = await Promise.all(imageAnalysisPromises)
                            for(const analysisResult of all) {
                                masks[analysisResult.imageId] = {
                                    [analysisResult.filterId]: analysisResult.mask
                                }
                            }

                        } catch(e) {
                            imageAnalysisPromisesError = e
                        }
                    }

                    if(annotationErrors.length > 0) {
                        return reject(new Error(annotationErrors.join(" ")))
                    }

                    if(imageAnalysisPromisesError) return (imageAnalysisPromisesError)
                    
                    if(!title || !desc) {
                        let error
                        if(!title && !desc) {
                            error = "Make sure that at least @name and @desc is declared on some text fields. @small is optional."

                        } else if(!title) {
                            error = "Make sure that at least @name is declared on a text field. @small is optional."

                        } else {
                            error = "Make sure that at least @desc is declared on a text field. @small is optional."

                        }
                        return reject(new Error(error))
                    }

                    imagesArray = []
                    imagesIdArray = []
                    parsedSvg.children = children

                    //console.info("parsedSvg: ", parsedSvg)
                    //console.info("parsedSvg.fields ", fields)
                    //console.info("parsedSvg:images ", "images")
                    // Resolve with SVG content and placeholders description
                    
                    const expandedImages = await expandImagesMap(images, async (id, image) => {
                        const { width } = await getImageDimensions(image)
                        var returnMap: FileMap = { }
                        //console.info("parsedSvg:baseWidth2: ", width)
                        returnMap = {
                            [`${id}`]: image
                        }

                        if(width >= 728) {
                            returnMap = {
                                ...returnMap,
                                [`${id}`]: image,
                                [`${id}_512`]: await resizeBase64Image(image, 512)
                            }
                        }

                        if(width >= 1024) {
                            returnMap = {
                                ...returnMap,
                                [`${id}`]: image,
                                [`${id}_728`]: await resizeBase64Image(image, 728)
                            }
                        }

                        if(width >= 2047) {
                            returnMap = {
                                ...returnMap,
                                [`${id}`]: image,
                                [`${id}_1024`]: await resizeBase64Image(image, 1024)
                            }
                        }
                        
                        if(idListOfImagesWithThumbnails.includes(id)) {
                            returnMap[`${id}_thumbnail`] = await resizeBase64Image(image, 70)
                        }
                        if(Object.keys(returnMap).length > 0) {
                            return returnMap
                        }
                        
                        return null
                    })

                    //console.log("parsedSvg2:expandedImages ", expandedImages)

                    resolve({
                        svg: stringify(parsedSvg),
                        fields: fields,
                        images,//: await convertPngBase64ImagesWithUPNG(images),
                        masks,
                        cssActions: {
                            if_selector: {
                                "*": {
                                    declarations: [{
                                        property: "white-space", value: "pre"
                                    }],
                                }
                            }
                        }
                    });
                })
                .catch(e => {
                    reject(e)
                })

            } else {
                resolve(null)
            }
        } catch (e) {
            reject(e);
        }
    });
};
