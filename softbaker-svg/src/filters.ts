import { FilterArgs, Filters } from "./types.ts";
import { AnalyzeResult, transformImageByTemplate } from "./imagePassportUtils.ts";
import { ImageWrapper } from './polyfills/Image.ts';
import { getCanvas } from "./imageHelper.ts";

const isNode = typeof window === 'undefined';
// Helper function to apply the filter
const applyFilter = (base64ImageString: string, filter: (data: ImageData, args?: FilterArgs | null) => void, args?: FilterArgs | null): Promise<string> => {
    //alert(`Filter will apply`)
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {

            const canvas = getCanvas(img.width, img.width);
            //const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d') as any;
            if (!ctx) {
                return reject(new Error("Canvas not supported"));
            }

            canvas.width = img.width;
            canvas.height = img.height;
            const realImage = ((img as any) as ImageWrapper).realImage? ((img as any) as ImageWrapper).realImage : img
            ctx.drawImage(realImage, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            filter(imageData, args);
            ctx.putImageData(imageData, 0, 0);

            resolve(canvas.toDataURL());
        };

        img.src = base64ImageString;

        img.onerror = reject;
    });
};

const BLUR_RADII = ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7",/* "0.8", "0.9", "1"*/]
// Define the FILTERS object with filter functions and corresponding React components
const FILTERS: Filters = {
    Whitescale: {
        id: "Whitescale",
        filter: (base64ImageString) => applyFilter(base64ImageString, (data) => {
            const pixels = data.data;
            for (let i = 0; i < pixels.length; i += 4) {
                pixels[i] = 255;    // R
                pixels[i + 1] = 255; // G
                pixels[i + 2] = 255; // B
            }
        })
    },
    Blackscale: {
        id: "Blackscale",
        filter: (base64ImageString) => applyFilter(base64ImageString, (data) => {
            const pixels = data.data;
            for (let i = 0; i < pixels.length; i += 4) {
                pixels[i] = 0;    // R
                pixels[i + 1] = 0; // G
                pixels[i + 2] = 0; // B
            }
        })
    },
    Greyscale: {
        id: "Greyscale",
        filter: (base64ImageString) => applyFilter(base64ImageString, (data) => {
            const pixels = data.data;
            for (let i = 0; i < pixels.length; i += 4) {
                const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
                pixels[i] = avg;    // R
                pixels[i + 1] = avg; // G
                pixels[i + 2] = avg; // B
            }
        })
    },
    Redscale: {
        id: "Redscale",
        filter: (base64ImageString) => applyFilter(base64ImageString, (data) => {
            const pixels = data.data;
            for (let i = 0; i < pixels.length; i += 4) {
                pixels[i + 1] = 0; // G
                pixels[i + 2] = 0; // B
            }
        })
    },
    Greenscale: {
        id: "Greenscale",
        filter: (base64ImageString) => applyFilter(base64ImageString, (data) => {
            const pixels = data.data;
            for (let i = 0; i < pixels.length; i += 4) {
                pixels[i] = 0;    // R
                pixels[i + 2] = 0; // B
            }
        })
    },
    Bluescale: {
        id: "Bluescale",
        filter: (base64ImageString) => applyFilter(base64ImageString, (data) => {
            const pixels = data.data;
            for (let i = 0; i < pixels.length; i += 4) {
                pixels[i] = 0;    // R
                pixels[i + 1] = 0; // G
            }
        })
    },
    Sepia: {
        id: "Sepia",
        filter: (base64ImageString, args) => applyFilter(base64ImageString, (data) => {
            // Set default values for sepia transformation or use provided args
            const rMult = args?.rMult ?? 0.393;
            const gMult = args?.gMult ?? 0.769;
            const bMult = args?.bMult ?? 0.189;
            const rAdd = args?.rAdd ?? 0.349;
            const gAdd = args?.gAdd ?? 0.686;
            const bAdd = args?.bAdd ?? 0.272;
    
            const pixels = data.data;
            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];     // Red
                const g = pixels[i + 1]; // Green
                const b = pixels[i + 2]; // Blue
    
                // Apply customizable sepia transformation
                const tr = rMult * r + gMult * g + bMult * b;
                const tg = rAdd * r + gAdd * g + bAdd * b;
                const tb = bAdd * r + bAdd * g + bAdd * b;
    
                pixels[i] = tr > 255 ? 255 : tr;       // Red
                pixels[i + 1] = tg > 255 ? 255 : tg;   // Green
                pixels[i + 2] = tb > 255 ? 255 : tb;   // Blue
            }
        })
    },
    Guassianblur: {
        id: "Guassianblur",
        filter: (base64ImageString, args) => applyFilter(base64ImageString, (data, args) => {
            const minRadius = Number(BLUR_RADII[0])
            const maxRadius = Number(BLUR_RADII[BLUR_RADII.length - 1])
            var radius = args?.radius && !isNaN(args.radius) ? Number(args.radius) : minRadius;// Default radius
            if(radius > maxRadius) radius = minRadius;
            radius *= 10;
            
            const pixels = data.data;
            const width = data.width;
            const height = data.height;

            // Create a copy of the original pixel data
            const copyData = new Uint8ClampedArray(pixels);

            // Apply separable Gaussian blur: first horizontal, then vertical
            // Horizontal pass
            function blurHorizontal() {
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        let r = 0, g = 0, b = 0, a = 0, count = 0;

                        for (let dx = -radius; dx <= radius; dx++) {
                            const nx = x + dx;

                            if (nx >= 0 && nx < width) {
                                const i = (y * width + nx) * 4;
                                r += copyData[i];
                                g += copyData[i + 1];
                                b += copyData[i + 2];
                                a += copyData[i + 3];
                                count++;
                            }
                        }

                        const idx = (y * width + x) * 4;
                        pixels[idx] = r / count;
                        pixels[idx + 1] = g / count;
                        pixels[idx + 2] = b / count;
                        pixels[idx + 3] = a / count;
                    }
                }
            }

            // Vertical pass
            function blurVertical() {
                for (let x = 0; x < width; x++) {
                    for (let y = 0; y < height; y++) {
                        let r = 0, g = 0, b = 0, a = 0, count = 0;

                        for (let dy = -radius; dy <= radius; dy++) {
                            const ny = y + dy;

                            if (ny >= 0 && ny < height) {
                                const i = (ny * width + x) * 4;
                                r += copyData[i];
                                g += copyData[i + 1];
                                b += copyData[i + 2];
                                a += copyData[i + 3];
                                count++;
                            }
                        }

                        const idx = (y * width + x) * 4;
                        pixels[idx] = r / count;
                        pixels[idx + 1] = g / count;
                        pixels[idx + 2] = b / count;
                        pixels[idx + 3] = a / count;
                    }
                }
            }

            // Apply the separable blur
            blurHorizontal();  // First pass
            blurVertical();    // Second pass
        }, args)
    },/*
    Rotate: {
        id: "Rotate",
        filter: (base64ImageString, args) => new Promise((resolve, reject) => {
            resolve(base64ImageString)
        }),
        render: null
    },*/
    ImageTransform: {
        id: "ImageTransform",
        filter: (base64ImageString, args) => transformImageByTemplate(args as AnalyzeResult, base64ImageString, 2)
    },
}

export default FILTERS