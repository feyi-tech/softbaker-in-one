
const scaleDownFont = (scaleH: number, scaleV: number, maxChars: number, chars: number) => {
  // If the number of characters is within the maximum allowed,
  // return the original scales.
  if (chars <= maxChars) {
    return { scaleH, scaleV };
  }
  
  // Calculate the reduction factor.
  const factor = maxChars / chars;
  
  // Apply the reduction factor to both horizontal and vertical scales.
  return {
    scaleH: scaleH * factor,
    scaleV: scaleV * factor
  };
}

export function responsiveTransform(
  transform: string, 
  widthScaler: (value: number) => number, 
  heightScaler: (value: number) => number,
  textContent?: string | null, 
  maxTextBeforeScaleDown?: number | number
) {
  // Regex pattern to match different types of transforms, including matrix
  const transformRegex = /(translate|rotate|scale|matrix|skewX|skewY)\(([^)]+)\)/g;

  let newTransform = transform.replace(transformRegex, (match, type, values) => {
    // Split the values inside the parentheses by space or comma
    let valueArray = values.split(/[ ,]+/).map(Number);

    // Adjust the values depending on the type of transform
    if (type === 'translate') {
      // Apply the widthScaler to the x value and the heightScaler to the y value
      valueArray[0] = widthScaler(valueArray[0]);  // X
      valueArray[1] = heightScaler(valueArray[1]); // Y

    } else if (type === 'scale') {
      // Apply the widthScaler to the first value and the heightScaler to the second if available
      //No need to scale since we're already scaling the font-size
      valueArray[0] = valueArray[0]//widthScaler(valueArray[0]);  // X scaling
      if (valueArray.length > 1) {
        //No need to scale since where's already scaling the font-size
        valueArray[1] = valueArray[1]//heightScaler(valueArray[1]); // Y scaling
      } else {
        // If there is only one scale value, assume uniform scaling
        valueArray[1] = valueArray[0];
      }

      if(maxTextBeforeScaleDown) {
        const { scaleH, scaleV } = scaleDownFont(valueArray[0], valueArray[1], maxTextBeforeScaleDown, (textContent || "").length)
        if([1.499].includes(valueArray[1])) {
          //console.log("valueArray:", valueArray, scaleH, scaleV, maxTextBeforeScaleDown, textContent)
        }
        valueArray[0] = scaleH
        valueArray[1] = scaleV
      }

    } else if (type === 'matrix') {
      // Apply the widthScaler and heightScaler to the matrix values
      //valueArray[0] = valueArray[0];  // a (x-scale)
      //valueArray[1] = valueArray[1]; // b (y-skew)
      //valueArray[2] = valueArray[2];  // c (x-skew)
      //valueArray[3] = valueArray[3]; // d (y-scale)
      valueArray[4] = widthScaler(valueArray[4]);  // e (x-translation)
      valueArray[5] = heightScaler(valueArray[5]); // f (y-translation)

    } else if (type === 'rotate') {
      // No scaling needed for rotate values
      // Just return the rotate transform unchanged
      return `${type}(${values})`;

    } else if (type === 'skewX') {
      // No scaling needed for rotate values
      // Just return the rotate transform unchanged
      return `${type}(${widthScaler(Number(values.trim()))})`;

    } else if (type === 'skewY') {
      // No scaling needed for rotate values
      // Just return the rotate transform unchanged
      return `${type}(${heightScaler(Number(values.trim()))})`;
    }

    // Return the transformed string for this particular transform
    return `${type}(${valueArray.join(' ')})`;
  });

  return newTransform;
}

export function responsivePathD(d: string, widthScaler: (value: number) => number, heightScaler: (value: number) => number) {
    // Regex pattern to match path commands and their values
    const commandRegex = /([MLHVCSQTZ])([^MLHVCSQTZ]*)/gi;
  
    let newD = d.replace(commandRegex, (match, command, values) => {
      // Split the values by commas or spaces but retain commas in the result
      let valueArray = values.trim().split(/([, ])/).map((v: string) => v.trim());
  
      // Process numeric values only
      for (let i = 0; i < valueArray.length; i++) {
        // Parse numeric values and apply scaling; leave commas and spaces unchanged
        if (!isNaN(parseFloat(valueArray[i]))) {
          if (command.toUpperCase() === 'H') {
            valueArray[i] = widthScaler(parseFloat(valueArray[i])); // scale x for H
          } else if (command.toUpperCase() === 'V') {
            valueArray[i] = heightScaler(parseFloat(valueArray[i])); // scale y for V
          } else {
            // Scale both x and y for M, L, C, etc.
            if (i % 2 === 0) {
              valueArray[i] = widthScaler(parseFloat(valueArray[i])); // x values
            } else {
              valueArray[i] = heightScaler(parseFloat(valueArray[i])); // y values
            }
          }
        }
      }
  
      // Rejoin the values, preserving commas
      return `${command}${valueArray.join('')}`;
    });
  
    return newD;
}

export function responsiveViewBox(viewBox: string, widthScaler: (value: number) => number, heightScaler: (value: number) => number) {
    // Split the viewBox values (min-x, min-y, width, height) by spaces
    let viewBoxValues = viewBox.trim().split(/[\s,]+/).map((v: string) => parseFloat(v));
  
    if (viewBoxValues.length !== 4 || viewBoxValues.some(value => !Number.isFinite(value))) {
      throw new Error("Invalid viewBox format. Expected format: 'min-x min-y width height'");
    }
  
    // Scale the values
    viewBoxValues[0] = widthScaler(viewBoxValues[0]);  // min-x
    viewBoxValues[1] = heightScaler(viewBoxValues[1]); // min-y
    viewBoxValues[2] = widthScaler(viewBoxValues[2]);  // width
    viewBoxValues[3] = heightScaler(viewBoxValues[3]); // height
  
    // Return the transformed viewBox as a string
    return viewBoxValues.join(' ');
}

export function responsiveFontSize(fontSize: string, originalWidth: number, originalHeight: number, targetWidth: number, targetHeight: number) {
    // Calculate the scaling factor using either width or height
    const widthScaleFactor = targetWidth / originalWidth;
    const heightScaleFactor = targetHeight / originalHeight;
    
    // You can choose one scaling method, e.g., height or width, or use the average of both
    const scalingFactor = Math.min(widthScaleFactor, heightScaleFactor); // Use whichever is smaller for better readability
  
    // Regex to extract numeric part and unit (if any)
    const fontSizeRegex = /^(\d+(\.\d+)?)([a-z%]*)$/i;
    const match = fontSize.match(fontSizeRegex);
  
    if (!match) {
      throw new Error("Invalid font size format");
    }
  
    const numericValue = parseFloat(match[1]);   // The numeric part
    const unit = match[3] || "";                 // The unit (e.g., px), default to empty if no unit
  
    // Scale the numeric part
    const scaledValue = numericValue * scalingFactor;
  
    // Return the scaled font size with the original unit
    return `${scaledValue}${unit}`;
}

//matrix(-0.08, -0.997, 0.998, -0.08, 4559.744, 2798.756)

//matrix(-0.028 -0.354 0.355 -0.028 1620.963 994.942)

//matrix(a, b, c, d, e, f)
//matrix(a, skewX, skewY, d, translateX, translateY)

//matrix(-0.028 -0.354 0.355 -0.028 1620.963 994.942)

//matrix(-0.08, -0.997, 0.998, -0.08, 1620.963 994.942)
