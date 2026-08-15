import { ImageWrapper } from './polyfills/Image.ts';

const isNode = typeof window === 'undefined';

export function cropImage(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = function () {
          const canvas = getCanvas(img.width, img.height)
          const ctx = canvas.getContext("2d") as any;
          if (!ctx) return reject(new Error("Failed to get canvas context"));

          canvas.width = img.width;
          canvas.height = img.height;
          const realImage = ((img as any) as ImageWrapper).realImage? ((img as any) as ImageWrapper).realImage : img
          ctx.drawImage(realImage, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          let minX = canvas.width;
          let minY = canvas.height;
          let maxX = 0;
          let maxY = 0;

          for (let y = 0; y < canvas.height; y++) {
              for (let x = 0; x < canvas.width; x++) {
                  const index = (y * canvas.width + x) * 4;
                  if (data[index + 3] > 0) {
                      minX = Math.min(minX, x);
                      minY = Math.min(minY, y);
                      maxX = Math.max(maxX, x);
                      maxY = Math.max(maxY, y);
                  }
              }
          }

          const cropWidth = maxX - minX;
          const cropHeight = maxY - minY;
          const croppedCanvas = getCanvas(cropWidth, cropHeight);
          const croppedCtx = croppedCanvas.getContext("2d") as any;
          if (!croppedCtx) return reject(new Error("Failed to get canvas context"));

          croppedCanvas.width = cropWidth;
          croppedCanvas.height = cropHeight;
          croppedCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

          resolve(croppedCanvas.toDataURL("image/png"));
      };

      img.onerror = () => reject(new Error('Error loading image'));
      img.src = imageUrl;
  });
}

export function isBlankImage(imageUrl: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function () {
            const canvas = getCanvas(img.width, img.height);
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d") as any;
            if (!ctx) return reject(new Error("Failed to get canvas context"));
            const realImage = ((img as any) as ImageWrapper).realImage? ((img as any) as ImageWrapper).realImage : img
            ctx.drawImage(realImage, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            resolve(imageData.every((value: any) => value === 0));
        };

        img.onerror = () => reject(new Error('Error loading image'));
        img.src = imageUrl;
    });
}

export function getImageDimension(imageUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Error loading image'));
      img.src = imageUrl;
  });
}

export function imageToStamp(base64Image: string, color: [number, number, number], holePct: number): Promise<string | null> {
  return new Promise((resolve, reject) => {
      if (!base64Image) return resolve(null);
      const img = new Image();
      img.onload = function () {
          const canvas = getCanvas(img.width, img.height);
          const ctx = canvas.getContext("2d") as any;
          if (!ctx) return reject(new Error("Failed to get canvas context"));

          canvas.width = img.width;
          canvas.height = img.height;
          const realImage = ((img as any) as ImageWrapper).realImage? ((img as any) as ImageWrapper).realImage : img
          ctx.drawImage(realImage, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          const numTransparentPixels = Math.floor((holePct / 100) * (canvas.width * canvas.height));

          for (let i = 0; i < numTransparentPixels; i++) {
              const x = Math.floor(Math.random() * canvas.width);
              const y = Math.floor(Math.random() * canvas.height);
              const index = (y * canvas.width + x) * 4;
              data[index + 3] = 0;
          }

          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => reject(new Error('Error loading image'));
      img.src = base64Image;
  });
}

export function getImageColor(base64ImageUrl: string, useDominantColor = true): Promise<[number, number, number] | null> {
  return new Promise((resolve, reject) => {
      if (!base64ImageUrl) return resolve(null);
      const img = new Image();
      img.onload = function () {
          const canvas = getCanvas(img.width, img.height);
          const ctx = canvas.getContext("2d") as any;
          if (!ctx) return reject(new Error("Failed to get canvas context"));

          canvas.width = img.width;
          canvas.height = img.height;
          const realImage = ((img as any) as ImageWrapper).realImage? ((img as any) as ImageWrapper).realImage : img
          ctx.drawImage(realImage, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          let totalRed = 0, totalGreen = 0, totalBlue = 0, totalPixels = 0;
          const colorCount: Record<string, number> = {};

          for (let i = 0; i < data.length; i += 4) {
              const red = data[i], green = data[i + 1], blue = data[i + 2];
              totalRed += red;
              totalGreen += green;
              totalBlue += blue;
              totalPixels++;
              const colorKey = `${red},${green},${blue}`;
              colorCount[colorKey] = (colorCount[colorKey] || 0) + 1;
          }

          const averageColor: [number, number, number] = [
              Math.round(totalRed / totalPixels),
              Math.round(totalGreen / totalPixels),
              Math.round(totalBlue / totalPixels)
          ];

          if (useDominantColor) {
              let dominantColor: [number, number, number] = averageColor;
              let maxCount = 0;
              for (const colorKey in colorCount) {
                  if (colorCount[colorKey] > maxCount) {
                      dominantColor = colorKey.split(",").map(Number) as [number, number, number];
                      maxCount = colorCount[colorKey];
                  }
              }
              resolve(dominantColor);
          } else {
              resolve(averageColor);
          }
      };

      img.onerror = () => reject(new Error('Error loading image'));
      img.src = base64ImageUrl;
  });
}

export function reduceBase64Image(base64: string, targetWidth: number, quality=1) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const { width: originalWidth, height: originalHeight } = img;
  
        // If the target width is greater than original, return original
        if (targetWidth > originalWidth) {
          return resolve(base64);
        }
  
        const aspectRatio = originalHeight / originalWidth;
        let targetHeight = targetWidth * aspectRatio;
        if(targetWidth == 0 || targetWidth == originalWidth) {
            targetWidth = originalWidth
            targetHeight = originalHeight;
        }
  
        const canvas = getCanvas(targetWidth, targetHeight);
        //const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
  
        const ctx = canvas.getContext('2d') as any;
        const realImage = ((img as any) as ImageWrapper).realImage? ((img as any) as ImageWrapper).realImage : img

        if(targetWidth == 0 || targetHeight == 0 || !realImage) {
            console.log("invimg:2", targetWidth, targetHeight, realImage)
        }

        ctx.drawImage(realImage, 0, 0, targetWidth, targetHeight);
  
        const matches = base64.match(/^data:(.+);base64,(.+)$/);
        let resizedBase64
        if (matches) {
            const mimeType = matches[1]; // Extract MIME type
            resizedBase64 = canvas.toDataURL(mimeType, quality); // default is image/png

        } else {
            resizedBase64 = canvas.toDataURL(); // default is image/png
        }

        
        resolve(resizedBase64);
      };
      img.onerror = (err) => reject(err);
      img.src = base64;
    });
}

// Helper to load images with a timeout
export const loadImageWithTimeoutFallback = (src: string, timeout = 5000): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (isNode) {
        const { loadImage } = require('canvas');
        if (src.startsWith('data:image/') || src.startsWith('data:img/')) {
            const buffer = Buffer.from(src.split(',')[1], 'base64');
            loadImage(buffer).then(resolve).catch(reject);

        } else {
            loadImage(src).then(resolve).catch(reject);
        }

      } else {
        const img = new Image();
        const timer = setTimeout(() => {
          reject(new Error(`Image load timeout: ${src}`));
        }, timeout);

        img.onload = () => {
          clearTimeout(timer);
          const realImage = ((img as any) as ImageWrapper).realImage? ((img as any) as ImageWrapper).realImage : img
          resolve(realImage);
        };

        img.onerror = (error: any) => {
          clearTimeout(timer);
          reject(new Error(`Error loading image: ${src.substring(0, 30)}`, error));
        };

        img.src = src;
      }
    });
};

export const loadImageWithTimeout = (src: string, timeout = 5000): Promise<any> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const timer = setTimeout(() => {
          reject(new Error(`Image load timeout: ${src}`));
        }, timeout);

        img.onload = () => {
          clearTimeout(timer);
          const realImage = ((img as any) as ImageWrapper).realImage? ((img as any) as ImageWrapper).realImage : img
          resolve(realImage);
        };

        img.onerror = (error: any) => {
          clearTimeout(timer);
          reject(new Error(`Error loading image: ${src.substring(0, 30)}`, error));
        };

        img.src = src;
    });
};

export const getCanvas = (width: number, height: number) => {
  if(isNode) {
    const { createCanvas } = require('canvas');
    return createCanvas(width, height)

  } else {
    return document.createElement('canvas')
  }
}