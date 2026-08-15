import { Declaration } from "./types.ts";


export const getIdentifier = (selectorOrProperty: string, propertyValue?: string) => {
  return `${selectorOrProperty.replace(/\s/g, "")}${propertyValue? `:${propertyValue.replace(/\s/g, "")}` : ""}`
}

export function parseValueUnit(input: string) {
  const match = input.match(/^([-+]?\d*\.?\d+)([a-zA-Z]+)$/);
  if (match) {
    return {
      value: match[1],
      unit: match[2]
    };
  } else {
    throw new Error(`Invalid input format: ${input}`);
  }
}

export function parseAndModifyCSS(cssString: string, callback: (selector: string, declarations: Declaration[]) => Declaration[]) {
    const cssObject: {[x: string]:  Declaration[]} = {};
  
    // Regular expression to match selectors and their declarations
    const regex = /([^{]+)\{([^}]+)\}/g;
    let match;
  
    // Parse the CSS content into an object
    while ((match = regex.exec(cssString)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2].trim().split(';').filter(Boolean).map(decl => {
        const [property, value] = decl.split(':').map(item => item.trim());
        return { property, value };
      });
  
      cssObject[selector] = declarations;
    }
  
    // Function to process each selector and its declarations using the callback
    Object.keys(cssObject).forEach(selector => {
      const declarations = cssObject[selector];
  
      // Call the callback, passing the selector and its declarations
      const updatedDeclarations = callback(selector, declarations);
  
      // Replace the original declarations with the returned value
      cssObject[selector] = updatedDeclarations;
    });
  
    // Convert the object back to a CSS string
    let newCssString = '';
    Object.keys(cssObject).forEach(selector => {
      const declarations = cssObject[selector]
        .map(({ property, value }) => `${property}: ${value};`)
        .join(' ');
      newCssString += `${selector} { ${declarations} }\n`;
    });
  
    return newCssString;
}