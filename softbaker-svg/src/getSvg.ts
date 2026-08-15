import jsPDF from "jspdf"
import { getCanvas, getImageDimension, loadImageWithTimeout } from "./imageHelper.ts"
import { ImageWrapper } from "./polyfills/Image.ts";

const pngToPdf = async (image: string, filename: string, resolve: (result: string) => void, reject: (result: Error) => void) => {
  // Create a new jsPDF instance
  const size = await getImageDimension(image)
  const pdfDoc = new jsPDF({
    unit: 'px',
    format: [size.width, size.height], // Set PDF dimensions to match the image
  });

  // Add the image to the PDF
  pdfDoc.addImage(image, 'PNG', 0, 0, size.width, size.height);

  pdfDoc.save(filename);
  resolve(image)
}

export function entitiesToCharacters(text: string) {
  // Define a mapping of HTML entities to their corresponding characters
  const entityToCharMap: { [x: string]: string } = {
      "&apos;": "'",
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
      "&#039;": "'",
      "&#x22;": '"',
      "&#x27;": "'",
      "&#60;": "<",
      "&#62;": ">",
      "&#x3C;": "<",
      "&#x3E;": ">",
      "&#x2F;": "/",
      "&#x5C;": "\\",
      "&#x60;": "`",
      "&#x25;": "%",
      "&#x3A;": ":",
      "&#x3B;": ";",
      "&#x5F;": "_",
      "&#x40;": "@"
  };

  // Use a regular expression to match and replace all entities
  return text.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
      return entityToCharMap[match] || match; // Replace with corresponding character or keep unchanged
  });
}

function charactersToEntities(text: string) {
  // Define a mapping of characters to their corresponding HTML entities
  const charToEntityMap: { [x: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "`": "&#x60;",
      "/": "&#x2F;",
      "\\": "&#x5C;",
      "%": "&#x25;",
      ":": "&#x3A;",
      ";": "&#x3B;",
      "_": "&#x5F;",
      "@": "&#x40;"
  };

  // Use a regular expression to match and replace all characters
  return text.replace(/[&<>"'`\/%:;_@]/g, (match) => {
      return charToEntityMap[match] || match; // Replace with corresponding entity or keep unchanged
  });
}

export const escapeHtmlEntities = (input?: string | null) => {
  if(!input) return ""
  return charactersToEntities(input)/*
  const entities: {[x: string]: string} = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#47;', // Some scenarios might require this, but usually, it’s not necessary for XML contexts
  };

  return `${input}`.replace(/[&<>"'\/]/g, function(match) {
    return entities[match];
  });*/
}

const isNode = typeof window === 'undefined';

const getNodeImageDimensionAttr = (img: any, attr: string) => {
  try {
    return parseFloat(img.getAttribute(attr) || "0")

  } catch(e) {
    return 0
  }
}

async function processBase64Image(base64Image: string, side?: "front" | "back" | "front_hr" | "back_hr", format: 'png' | 'jpeg' | 'pdf' | string = 'png'): Promise<string> {
  return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
          const canvas = getCanvas(img.width, img.height);
          const ctx = canvas.getContext("2d") as any;
          if (!ctx) return reject("Canvas context not supported");
          
          let sx = 0, sy = 0, sw = img.width, sh = img.height;

          switch (side) {
              case "front":
                  sw = img.width / 2; // Left half
                  break;
              case "back":
                  sx = img.width / 2; // Right half
                  sw = img.width / 2;
                  break;
              case "front_hr":
                  sh = img.height / 2; // Top half
                  break;
              case "back_hr":
                  sy = img.height / 2; // Bottom half
                  sh = img.height / 2;
                  break;
              default:
                  return resolve(base64Image); // Return original if side is undefined
          }

          canvas.width = sw;
          canvas.height = sh;
          const realImage = ((img as any) as ImageWrapper).realImage? ((img as any) as ImageWrapper).realImage : img
          ctx.drawImage(realImage, sx, sy, sw, sh, 0, 0, sw, sh);
          resolve(canvas.toDataURL(`image/${format === 'pdf' ? 'png' : format}`));
      };
      img.onerror = () => reject("Image loading error");
      img.src = base64Image;
  });
}

export const downloadSvgAsImage = (
  svgString: string,
  format: 'png' | 'jpeg' | 'pdf' | string = 'png',
  fileName: string = 'downloadedImage',
  downloadSide?: 'front' | 'back' | 'front_hr' | 'back_hr',
  skipBrowserDownload?: boolean | null
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      let svgUrl: string;

      if (isNode) {
        // Node.js: Convert SVG to base64 using Buffer
        const buffer = Buffer.from(svgString, 'utf-8');
        svgUrl = `data:image/svg+xml;base64,${buffer.toString('base64')}`;
        
      } else {
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
        svgUrl = URL.createObjectURL(svgBlob);
      }

      //console.error("downloadSvgAsImage.call", svgUrl? svgUrl.substring(0, 30) : "no svg url")

      const img = new Image();
      
      img.onload = async function () {
        //console.error("downloadSvgAsImage.onload", img.width, img.height)
        // Limit canvas size to avoid crashes
        const MAX_DIMENSION = 4096;
        const scaleFactor = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));

        // Create canvas
        const canvas = getCanvas(img.width * scaleFactor, img.height * scaleFactor);
        //const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as any;

        let canvasWidth = img.width * scaleFactor;
        let canvasHeight = img.height * scaleFactor;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const downloadImage = (dataUrl: string, sideLabel?: string) => {
          const fileFullname = sideLabel
            ? `${sideLabel.toUpperCase()}_${fileName}.${format}`
            : `${fileName}.${format}`;

          if (format === 'pdf') {
            pngToPdf(dataUrl, fileFullname, resolve, reject);
          } else {
            if(!isNode && !skipBrowserDownload) {
              const downloadLink = document.createElement('a');
              downloadLink.href = dataUrl;
              downloadLink.download = fileFullname;
              downloadLink.click();
            }
            resolve(dataUrl);
          }
        };

        const parser = new DOMParser();//isNode? new DOMParserWrapper() : new DOMParser();
        const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
        const images = svgDoc.getElementsByTagName('image');
        //console.log("svgDoc.images:", images, svgDoc)
        //console.error("downloadSvgAsImage.parser", images, images?.length)

        try {

          if (context) {
            //context.clearRect(0, 0, canvas.width, canvas.height);
            
            if (images.length > 0) {
              // Preload all images with timeout
              await Promise.all(
                Array.from(images).map((image: any) => {
                  return new Promise<void>(async (resolve) => {
                    const imageUrl = !isNode? image.getAttributeNS('http://www.w3.org/1999/xlink', 'href') : image.getAttribute("xlink:href") || image.getAttribute("href") || "";
                    //console.error("downloadSvgAsImage.images.imageUrl:", imageUrl)
                    if (!imageUrl) return resolve(); // Skip if no image URL

                    try {
                      const imageImg = await loadImageWithTimeout(imageUrl)
                      const x = image?.x?.baseVal?.value || getNodeImageDimensionAttr(image, "x") || 0;
                      const y = image?.y?.baseVal?.value || getNodeImageDimensionAttr(image, "y") || 0;
                      const width = Math.min(
                        image?.width?.baseVal?.value || getNodeImageDimensionAttr(image, "width") || canvas.width, 
                        canvas.width
                      );
                      const height = Math.min(
                        image?.height?.baseVal?.value || getNodeImageDimensionAttr(image, "height") || canvas.height, 
                        canvas.height
                      );
                      context?.drawImage(imageImg, x, y, width, height);
                      //console.error("downloadSvgAsImage.loadImageWithTimeout", isNode, imageImg, x, y, width, height)
                      try {
                        //console.error("downloadSvgAsImage.image.stringify", JSON.stringify(image))

                      } catch(e) {}
                      resolve();

                    } catch(err: any) {
                      //console.error("downloadSvgAsImage.loadImageWithTimeout.error", err.message); // Log the error but continue
                      resolve();
                    }
                  });
                })
              );
            }
            
            const realImage = ((img as any) as ImageWrapper).realImage? ((img as any) as ImageWrapper).realImage : img

            context.drawImage(realImage, 0, 0, canvas.width, canvas.height);

            // Convert canvas to Data URL and download
            if(!downloadSide) {
              var dataUrl = canvas.toDataURL(`image/${format === 'pdf' ? 'png' : format}`);

            } else {
              var dataUrl = canvas.toDataURL(`image/png`);
              dataUrl = await processBase64Image(dataUrl, downloadSide, format)
            }
            downloadImage(dataUrl, downloadSide);
          } else {
            reject(new Error('Unsupported Browser. Please try to download from another browser.'));
          }
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = function () {
        reject(new Error('Error loading the SVG.'));
      };

      img.src = svgUrl;
    } catch(error: any) {
      //console.error("downloadSvgAsImage.call.catch", error)
      reject(error)
    }
  });
};