import { parse, INode } from 'svgson';
import { Font, FontsMap } from './types.ts';
import { cleanFilename, isBrowser } from './utils.ts';
import { getCanvas } from './imageHelper.ts';
import axios from 'axios';

const isNode = typeof window === 'undefined';

// Function to recursively traverse the parsed SVG and collect font-family values
export function collectFontFamilies(node: INode, fontFamilies: Set<string> = new Set()): Set<string> {
// Check for direct font-family attribute
if (node.attributes && node.attributes['font-family']) {
fontFamilies.add(node.attributes['font-family']);
}

// Check for <defs> and <style> elements
if (node.name === 'defs' && node.children) {
node.children.forEach(child => {
  if (child.name === 'style' && child.children && child.children.length > 0) {
    const cssContent = child.children[0].value;
    extractFontFamiliesFromCSS(cssContent, fontFamilies);
  }
});
}

// Recurse into children
if (node.children && node.children.length > 0) {
node.children.forEach(child => collectFontFamilies(child, fontFamilies));
}

return fontFamilies;
}

// Function to extract font-family values from CSS content
export function extractFontFamiliesFromCSS(cssContent: string, fontFamilies: Set<string>) {
const fontFamilyRegex = /font-family:\s*([^;]+);/g;
let match;
while ((match = fontFamilyRegex.exec(cssContent)) !== null) {
fontFamilies.add(match[1].trim());
}
}

// Main export function to parse the SVG and return a list of font-family values
export async function getFontFamiliesFromSVG(svgString: string): Promise<string[]> {
const parsedSVG = await parse(svgString);
const fontFamilies = collectFontFamilies(parsedSVG as INode);
return Array.from(fontFamilies);
}


async function fetchFontDataAsDataUrl(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer", // Fetch raw bytes
    });

    const buffer = Buffer.from(response.data); // works in both browser & Node.js
    const mimeType =
      response.headers["content-type"] || "application/octet-stream";
    const base64String = buffer.toString("base64");

    return `data:${mimeType};base64,${base64String}`;
  } catch (error: any) {
    throw new Error(`Failed to fetch font data from ${url}: ${error.message}`);
  }
};


export function getFontId(fontName: string): string {
    // Convert to lowercase
    let fontId = fontName.toLowerCase();
    fontId = fontId.replace(/["']/g, "")
  
    // Replace spaces and special characters with hyphens
    fontId = fontId.replace(/[\s]+/g, '-');
  
    // Remove any characters that are not alphanumeric or hyphens
    fontId = fontId.replace(/[^a-z0-9-]+/g, '');
  
    // Ensure no multiple consecutive hyphens
    fontId = fontId.replace(/-+/g, '-');
  
    // Trim hyphens from start and end
    fontId = fontId.replace(/^-|-$/g, '');
  
    return fontId;
}
  
export function generateFontMap(
    fontsLocationDomain: string,
    fontNames: string[],
    fontExtensions = ["ttf", "otf", "woff", "woff2", "eot", "svg"]
  ): Promise<FontsMap> {
    return new Promise(async (resolve, reject) => {
      const fontMap: FontsMap = {};
  
      for (const fontName of fontNames) {
        const fontInfo: Font = {
          name: fontName.replace(/["']/g, ""),
          id: getFontId(fontName)
        };
    
        let fontFound = false;
    
        for (const ext of fontExtensions) {
          const url = `https://${fontsLocationDomain}/fonts/${cleanFilename(fontInfo.id)}.${ext}?v=1`;
          try {
            const dataUrl = await fetchFontDataAsDataUrl(url);
            fontInfo.url = url;
            fontInfo.dataUrl = dataUrl;
            fontInfo.ext = ext;
            fontFound = true;
            break;
          } catch (error: any) {
            fontInfo.readError = error.message;
          }
        }
    
        if (!fontFound) {
          fontInfo.readError = `No valid font found for ${fontName} with extensions: ${fontExtensions.join(
            ', '
          )}`;
        }
    
        fontMap[fontInfo.id] = fontInfo;
      }
    
      resolve(fontMap)
    })
}
  
export function getFontFormat(extension: string) {
    const formatMap: {[x: string]: string} = {
        'ttf': 'truetype',
        'otf': 'opentype',
        'woff': 'woff',
        'woff2': 'woff2',
        'eot': 'embedded-opentype',
        'svg': 'svg'
    };

    return formatMap[extension.toLowerCase()] || 'unknown';
}

export function createFontThumbnail(fontBase64: string, fontFormat: string): Promise<string> {
    const mimeTypeMap: {[x: string]: string} = {
        'ttf': 'font/ttf',
        'otf': 'font/otf',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'eot': 'font/eot',
        'svg': 'svg'
    };

    const mimeType = mimeTypeMap[fontFormat.toLowerCase()];
    if (!mimeType) {
        return Promise.reject(new Error('Unsupported font format'));
    }

    return new Promise((resolve, reject) => {
        //return resolve("")
        //const fontFace = new FontFace('CustomFont', `url(data:${mimeType};base64,${fontBase64})`);

        if(!isBrowser() || !document?.fonts) return resolve("")
        const fontFace = new FontFace('CustomFont', `url(${fontBase64})`);

        fontFace.load().then((loadedFontFace) => {
            (document.fonts as any).add(loadedFontFace);

            const canvas = getCanvas(100, 100);
            //const canvas = document.createElement('canvas');
            canvas.width = 100; // Set canvas width
            canvas.height = 100; // Set canvas height

            const ctx = canvas.getContext('2d') as any;
            if(!ctx) return
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FFFFFF'; // Set background color
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000000'; // Set text color
            ctx.font = '50px CustomFont'; // Use the loaded font
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Aa', canvas.width / 2, canvas.height / 2); // Draw the text

            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
        }).catch(error => {
            reject(error);
        });
    });
}
