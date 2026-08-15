export const resizeImage = async (file: File, maxFileSizeInBytes: number, format?: string | null, quality?: number | null) => {
  return new Promise<{ base64: string, file: File }>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Determine the number of channels in the image data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const bytesPerPixel = imageData.data.length / (canvas.width * canvas.height);

        // Calculate the total number of pixels allowed based on the file size
        const totalPixelsAllowed = maxFileSizeInBytes / bytesPerPixel;
        const idealImageLength = Math.sqrt(totalPixelsAllowed); // Calculate the ideal side length of the square image

        // Resize the image accordingly while maintaining its aspect ratio
        let newWidth, newHeight;
        if (img.width >= img.height) {
          newWidth = idealImageLength;
          newHeight = img.height * (idealImageLength / img.width);
        } else {
          newHeight = idealImageLength;
          newWidth = img.width * (idealImageLength / img.height);
        }

        // Create a canvas to draw the resized image
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert canvas to Blob and create File object
        canvas.toBlob((blob) => {
          if (blob) {
            format = format? `${!format.startsWith("image/")? "image/" : ""}${format}` : file.type;
            const resizedFile = new File([blob], file.name, { type: file.type });
            resolve({ base64: canvas.toDataURL(format, quality || 1), file: resizedFile });
          }
        }, file.type);
      };
    };
    reader.onerror = error => reject(error);
  });
};

export function getZRotationDegree(base64Image: string) {
  return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
          
          // Set canvas dimensions to match the image
          canvas.width = image.width;
          canvas.height = image.height;
          
          // Draw the image on the canvas
          ctx.drawImage(image, 0, 0);

          // Extract pixel data from the canvas
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

          // Detect the green line
          const bottom30Percent = Math.floor(image.height * 0.3);
          let greenPixels = [];
          for (let y = image.height - bottom30Percent; y < image.height; y++) {
              for (let x = 0; x < image.width; x++) {
                  const index = (y * canvas.width + x) * 4;
                  const [r, g, b] = [imageData[index], imageData[index + 1], imageData[index + 2]];
                  if (r === 0 && g >= 128 && b === 0) { // Green color detection (tolerance for green)
                      greenPixels.push({ x, y });
                  }
              }
          }

          if (greenPixels.length < 2) {
              return resolve(0)
              //return reject('Green line not detected.');
          }

          // Calculate the angle of the line
          const firstPoint = greenPixels[0];
          const lastPoint = greenPixels[greenPixels.length - 1];
          const angleRad = Math.atan2(lastPoint.y - firstPoint.y, lastPoint.x - firstPoint.x);
          const angleDeg = angleRad * (180 / Math.PI);

          resolve(angleDeg + 180);
      };

      image.onerror = (error) => reject(error);

      image.src = base64Image;
  });
}