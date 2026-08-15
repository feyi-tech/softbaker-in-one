export function cropImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = function () {
            // Create a canvas to draw the image
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Set canvas dimensions to match the image dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Determine the bounding box of the signature
            let minX = canvas.width;
            let minY = canvas.height;
            let maxX = 0;
            let maxY = 0;

            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const index = (y * canvas.width + x) * 4; // RGBA values

                    // Check if the pixel is part of the signature (adjust threshold as needed)
                    if (data[index + 3] > 0) {
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                    // const isBlank = imageData.every((value, index) => index % 4 === 3 && value === 0);
                }
            }

            // Crop the signature based on the bounding box
            const croppedCanvas = document.createElement("canvas");
            const croppedCtx = croppedCanvas.getContext("2d");

            const cropWidth = (maxX - minX);
            const cropHeight = (maxY - minY);
            
            croppedCanvas.width = cropWidth;
            croppedCanvas.height = cropHeight;

            croppedCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

            // Convert the cropped canvas to a base64 image URL
            const croppedImageUrl = croppedCanvas.toDataURL("image/png");
            // Invoke the callback with the cropped image URL
            resolve(croppedImageUrl);
        };

        // Event handler for when the Image fails to load
        img.onerror = function (e) {
            // Call the callback with an error
            //console.log("ImageLoadError:3 ", e)
            reject(new Error('Error loading image'));
        };

        // Set the source of the image
        img.src = imageUrl;
    })
}

export function isBlankImage(imageUrl) {
    return new Promise((resolve, reject) => {
        // Create an Image object
        const img = new Image();

        // Event handler for when the Image is loaded
        img.onload = function () {
            // Create a Canvas element
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            // Get the 2D context of the Canvas
            const ctx = canvas.getContext('2d');

            // Draw the Image onto the Canvas
            ctx.drawImage(img, 0, 0);

            // Get the image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            
            // Check if all pixels are transparent
            const isBlank = imageData.every((value) => value === 0);

            // Call the callback with the result
            resolve(isBlank);
        };

        // Event handler for when the Image fails to load
        img.onerror = function (e) {
            //console.log("ImageLoadError:4 ", e)
            // Call the callback with an error
            reject(new Error('Error loading image'));
        };

        // Set the source of the Image
        img.src = imageUrl;
    })
}

export function getImageDimension(imageUrl) {
    return new Promise((resolve, reject) => {
        // Create an Image object
        const img = new Image();

        // Event handler for when the Image is loaded
        img.onload = function () {
            resolve({
                width: img.width,
                height: img.height
            })
        };

        // Event handler for when the Image fails to load
        img.onerror = function (e) {
            //console.log("ImageLoadError:5 ", e)
            // Call the callback with an error
            reject(new Error('Error loading image'));
        };

        // Set the source of the Image
        img.src = imageUrl;
    })
}

export function imageToStamp(base64Image, color, holePct) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = function () {
      // Create a canvas to draw the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas dimensions to match the image dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Calculate the number of pixels to make transparent
      const numTransparentPixels = Math.floor((holePct / 100) * (canvas.width * canvas.height));

      // Make random pixels transparent
      for (let i = 0; i < numTransparentPixels; i++) {
        const x = Math.floor(Math.random() * canvas.width);
        const y = Math.floor(Math.random() * canvas.height);

        const index = (y * canvas.width + x) * 4; // RGBA values
        data[index + 3] = 0; // Set alpha channel to 0 (transparent)
      }

      const whiteThreshold = 220
      // Loop through the image data to make white pixels transparent and set other pixels to the specified color
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Check if the pixel is white
        if (r > whiteThreshold && g > whiteThreshold && b > whiteThreshold && a > whiteThreshold) {
          // Make white pixels transparent
          data[i + 3] = 0; // Set alpha channel to 0 (transparent)
        } else if (a > 0) {
          // Set other non-transparent pixels to the specified color
          data[i] = color[0];   // Set red channel
          data[i + 1] = color[1]; // Set green channel
          data[i + 2] = color[2]; // Set blue channel
          // Leave alpha channel unchanged for colored pixels
        }
      }

      // Put the modified image data back onto the canvas
      ctx.putImageData(imageData, 0, 0);

      // Convert the canvas to a base64 image URL
      const modifiedImageUrl = canvas.toDataURL("image/png");

      // Resolve the promise with the modified image URL
      resolve(modifiedImageUrl);
    };

    // Event handler for when the image fails to load
    img.onerror = function (e) {
        //console.log("ImageLoadError:6 ", e);
        // Reject the promise with an error
        reject(new Error('Error loading image'));
    };

    // Set the source of the image
    if (base64Image) {
      img.src = base64Image;
    } else {
      resolve(null);
    }
  });
}

export function getImageColor(base64ImageUrl, useDominantColor = true) {
  return new Promise((resolve, reject) => {
      const img = new Image();
      // img.crossOrigin = "Anonymous"; // Enable cross-origin image access

      img.onload = function () {
          // Create a canvas to draw the image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set canvas dimensions to match the image dimensions
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the image on the canvas
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Variables to hold color sums for averaging
          let totalRed = 0;
          let totalGreen = 0;
          let totalBlue = 0;
          let totalPixels = 0;
          let whitePixelCount = 0;

          // Variables for counting color occurrences for dominant color
          const colorCount = {};
          const whiteThreshold = 240; // Define what constitutes "white"
          const whitePixelReductionFactor = 0.3; // Use 30% of white pixels

          for (let i = 0; i < data.length; i += 4) {
              const red = data[i];
              const green = data[i + 1];
              const blue = data[i + 2];

              // Check if the pixel is considered white
              const isWhite = red >= whiteThreshold && green >= whiteThreshold && blue >= whiteThreshold;

              // For average color: Include white pixels based on the reduction factor
              if (!isWhite || Math.random() < whitePixelReductionFactor) {
                  totalRed += red;
                  totalGreen += green;
                  totalBlue += blue;
                  totalPixels++;
              }

              // Count occurrences of each color for dominant color
              const colorKey = `${red},${green},${blue}`;
              colorCount[colorKey] = (colorCount[colorKey] || 0) + 1;

              // Track number of white pixels
              if (isWhite) {
                  whitePixelCount++;
              }
          }

          // Calculate average color
          const averageRed = Math.round(totalRed / totalPixels);
          const averageGreen = Math.round(totalGreen / totalPixels);
          const averageBlue = Math.round(totalBlue / totalPixels);
          const averageColor = [averageRed, averageGreen, averageBlue];

          if (useDominantColor) {
              // Find dominant color from the colorCount
              let dominantColor = averageColor;
              let maxCount = 0;

              for (const colorKey in colorCount) {
                  if (colorCount[colorKey] > maxCount) {
                      const [red, green, blue] = colorKey.split(",").map(Number);
                      dominantColor = [red, green, blue];
                      maxCount = colorCount[colorKey];
                  }
              }

              resolve(dominantColor);
          } else {
              resolve(averageColor);
          }
      };

      // Event handler for when the image fails to load
      img.onerror = function (e) {
          // Call the callback with an error
          //console.log("imageError", base64ImageUrl);
          //console.log("ImageLoadError:7 ", e)
          reject(new Error('Error loading image'));
      };

      // Set the source of the image
      if (base64ImageUrl) {
          img.src = base64ImageUrl;
      } else {
          resolve(null);
      }
  });
}

export function penNibbleEffect(inputBase64) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Adjust the pen nibble effect parameters
      const nibbleSize = 0.1; // Increase or decrease to control the effect size

      for (let y = 0; y < canvas.height; y += nibbleSize) {
        for (let x = 0; x < canvas.width; x += nibbleSize) {
          const index = (y * canvas.width + x) * 4;

          // Modify pixel color based on the pen nibble effect
          data[index] = data[index] * 0.8; // Red channel
          data[index + 1] = data[index + 1] * 0.8; // Green channel
          data[index + 2] = data[index + 2] * 0.8; // Blue channel
        }
      }

      // Put the modified image data back onto the canvas
      ctx.putImageData(imageData, 0, 0);

      // Convert the canvas to a base64 image URL
      const modifiedImageUrl = canvas.toDataURL("image/png");

      resolve(modifiedImageUrl);
    };

    img.onerror = function (e) {
      //console.log("ImageLoadError:8 ", e)
      reject(new Error('Error loading image'));
    };

    img.src = inputBase64;
  });
}