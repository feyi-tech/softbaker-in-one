import { ImageWrapper } from "./polyfills/Image.ts";

const isNode = typeof window === 'undefined';
  
  /**
 * Gets the dimensions (width and height) of an image from a base64 string.
 * 
 * @param base64Image - The base64 string of the image.
 * @returns A Promise that resolves to an object containing the base64 string, width, and height of the image.
 */
  export function getImageDimensions(base64Image: string): Promise<{ width: number, height: number }> {
    return new Promise<{ width: number, height: number }>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = (error) => {
        reject(new Error(`Failed to load image: ${error}`));
      };

      img.src = base64Image;
    });
  }

/**
 * Resizes a base64 image string to the given width while maintaining the aspect ratio.
 * 
 * @param base64Image - The base64 string of the image.
 * @param targetWidth - The desired width for the resized image.
 * @returns A Promise that resolves to the resized image as a base64 string.
 */
export async function resizeBase64Image(base64Image: string, targetWidth: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();

    // Set up the onload handler to resize the image once it's loaded
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const targetHeight = targetWidth / aspectRatio;

      // Create a canvas and draw the resized image on it
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d') as any;

      if (ctx) {
        const realImage = ((img as any) as ImageWrapper).realImage? ((img as any) as ImageWrapper).realImage : img
        ctx.drawImage(realImage, 0, 0, targetWidth, targetHeight);

        // Convert the canvas to a base64 string and resolve the promise
        const resizedBase64Image = canvas.toDataURL('image/png');
        resolve(resizedBase64Image);
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    // Set up the onerror handler to reject the promise if the image fails to load
    img.onerror = (error) => {
      reject(new Error(`Failed to load image: ${error}`));
    };

    // Set the src attribute to the base64 image string to start loading the image
    img.src = base64Image;
  });
}

export function base64UrlToFile(base64Url: string, fileName?: string, fileType?: string): File {
  // Extract base64 data and the MIME type from the header
  const [header, base64Data] = base64Url.split(',');

  // Infer the file type from the header if not provided
  fileType = normalizeMimeType(fileType || header.match(/:(.*?);/)?.[1]);

  // If the fileName is not provided, generate a random one with an appropriate extension
  if (!fileName) {
    const extension = fileType?.split('/')[1] || 'bin'; // Default to 'bin' if no type is inferred
    fileName = `file_${Date.now()}.${extension}`;
  }

  // Decode the base64 string to a binary string
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create a Blob from the decoded data
  const blob = new Blob([bytes], { type: fileType });

  // Create and return a File from the Blob
  return new File([blob], fileName, { type: fileType });
}
import { normalizeMimeType } from "./mime.ts";
