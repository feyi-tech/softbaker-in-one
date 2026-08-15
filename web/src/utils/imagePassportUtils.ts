interface Point {
    x: number;
    y: number;
}

interface PointVariants {
    x: number[],
    y: number[]
}
interface Quadrilateral {
    topLeft: Point;
    topRight: Point;
    bottomRight: Point;
    bottomLeft: Point;
}

export interface AnalyzeResult {
    rotationAngle: number;
    scaleX: number;
    scaleY: number;
    shearX: number;
    shearY: number;
    center: Point;
    width: number;
    height: number;
    corners: Quadrilateral;
}

interface DebugColors {
    border?: string;
}

const COLOR_THRESH = 10
const COLOR_THRESH_LOW = 4

const COLOR_MAIN_MARGIN = 16
const COLOR_OTHERS_DIFF = 1

const isValidPixel = (targetChannel: number, secondPixel: number, thirdPixel: number): boolean => {
    //return targetChannel > COLOR_THRESH && secondPixel < targetChannel && thirdPixel < targetChannel
    //return targetChannel > COLOR_THRESH && secondPixel < COLOR_THRESH_LOW && thirdPixel < COLOR_THRESH_LOW
    const max = Math.max(secondPixel, thirdPixel)
    return targetChannel > max && Math.abs(targetChannel - max) >= COLOR_MAIN_MARGIN && Math.abs(secondPixel - thirdPixel) <= COLOR_OTHERS_DIFF
}

export function base64ToImage(base64: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        //img.crossOrigin='anonymous'
        img.src = base64;
    });
}

function imageToBase64(image: HTMLCanvasElement): string {
    return image.toDataURL();
}

/*
function resizeImage(image: HTMLImageElement, targetWidth: number, targetHeight: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'
        const aspectRatio = image.naturalWidth / image.naturalHeight;
        const newWidth = targetWidth;
        const newHeight = targetWidth / aspectRatio;
    
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        if(targetHeight > newHeight){
            ctx.drawImage(
                image,
                0, 0,
                image.width, image.height,
                0, targetHeight - newHeight,
                newWidth, newHeight
            );

        } else {
            ctx.drawImage(
                image,
                0, 0,
                image.width, image.height,
                0, 0,
                newWidth, newHeight
            );
        }
    }
    return canvas;
}*/

function resizeImage(
    image: HTMLImageElement, 
    targetWidth: number, 
    targetHeight: number,
    widthCropSizePctFallback: number = 30
): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'
        const aspectRatio = image.naturalWidth / image.naturalHeight;
        var newWidth = targetWidth;
        var newHeight = targetWidth / aspectRatio;
    
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        if(targetHeight > newHeight) {
            // Calculate how much width should be cropped off (fall off) based on fallOffPercentage
            const heightDiff = targetHeight - newHeight
            const widthCropSizePctCalc = (heightDiff * 100) / targetHeight
            const widthCropSizePct = Math.min(widthCropSizePctFallback, widthCropSizePctCalc)
            const widthCropSize = (widthCropSizePct / 100) * image.naturalWidth;

            //console.log("resizeImage::", widthCropSizePctCalc, widthCropSizePctFallback)

            const widthCropSizeHalf = widthCropSize / 2;

            newHeight += (widthCropSizePct / 100) * newHeight;

            ctx.drawImage(
                image,

                widthCropSizeHalf, // start the cropping at this position
                0, // No vertical cropping

                // Reduce the source image width by cropWidth * 2 so we can evenly crop from left(cropWidth) and(+) right(cropWidth)
                image.naturalWidth - widthCropSize, 
                image.naturalHeight, // Full height

                0, 
                targetHeight - newHeight, // Draw at the top-left corner of the canvas

                newWidth, // Fit to the target width
                newHeight// Fit to the target height
            );
            
            /*
            ctx.drawImage(
                image,

                0, 
                0,

                image.width, 
                image.height,

                0, 
                targetHeight - newHeight,

                newWidth, 
                newHeight
            );*/

        } else {
            ctx.drawImage(
                image,
                0, 0,
                image.width, image.height,
                0, 0,
                newWidth, newHeight
            );
        }
    }
    return canvas;
}

function calculateAngleBetweenPoints(center: Point, p1: Point, p2: Point): number {
    const { x: x0, y: y0 } = center;
    const { x: x1, y: y1 } = p1;
    const { x: x2, y: y2 } = p2;

    function getAngle(x: number, y: number): number {
        return Math.atan2(y - y0, x - x0);
    }

    function radiansToDegrees(radians: number): number {
        return radians * (180 / Math.PI);
    }

    const theta1 = getAngle(x1, y1);
    const theta2 = getAngle(x2, y2);

    let deltaTheta = theta2 - theta1;

    if (deltaTheta < 0) {
        deltaTheta += 2 * Math.PI;
    }

    const antiClockwiseAngle = radiansToDegrees(deltaTheta);
    const clockwiseAngle = 360 - antiClockwiseAngle;

    //console.log("annnnnngssss: ", clockwiseAngle, antiClockwiseAngle);
    return antiClockwiseAngle;
}

function calculateDistance(pointA: Point, pointB: Point): number {
    return Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
}

function calculateMidpoint(pointA: Point, pointB: Point): Point {
    return {
        x: Math.round((pointA.x + pointB.x) / 2),
        y: Math.round((pointA.y + pointB.y) / 2)
    };
}

function ensureTopSpace(image: HTMLImageElement, space: number): Promise<HTMLCanvasElement | HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Could not get canvas context"));
        ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'

        ctx.drawImage(image, 0, 0);

        const imgData = ctx.getImageData(0, 0, image.width, image.height);
        const pixels = imgData.data;

        const isRowTransparent = (row: number): boolean => {
            for (let col = 0; col < image.width; col++) {
                const index = (row * image.width + col) * 4;
                const alpha = pixels[index + 3];
                if (alpha !== 0) return false;
            }
            return true;
        };

        let transparentRowsAtTop = 0;
        for (let row = 0; row < image.height; row++) {
            if (isRowTransparent(row)) {
                transparentRowsAtTop++;
            } else {
                break;
            }
        }

        if (transparentRowsAtTop >= space) {
            return resolve(image);
        }

        const rowsToAdd = space - transparentRowsAtTop;

        const newCanvas = document.createElement('canvas');
        newCanvas.width = image.width;
        newCanvas.height = image.height;
        const newCtx = newCanvas.getContext('2d');
        if (!newCtx) return reject(new Error("Could not get canvas context"));

        newCtx.clearRect(0, 0, newCanvas.width, newCanvas.height);

        newCtx.drawImage(
            image,
            0, 0,
            image.width, image.height - rowsToAdd,
            0, rowsToAdd,
            image.width, image.height - rowsToAdd
        );

        resolve(newCanvas);
    });
}

function findBlueQuadrilateralCorners(imageA: HTMLImageElement): Promise<Quadrilateral | null> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = imageA.naturalWidth;
        canvas.height = imageA.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Could not get canvas context"));
        ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'

        ctx.drawImage(imageA, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const cornerPoints: Point[] = [];

        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                const index = (y * imageData.width + x) * 4;

                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];

                if (isValidPixel(b, r, g)) {
                    cornerPoints.push({ x, y });
                }
            }
        }

        if (cornerPoints.length === 0) {
            return resolve(null);
        }

        const topLeft: Point = { x: Infinity, y: Infinity };
        const topRight: Point = { x: -Infinity, y: Infinity };
        const bottomLeft: Point = { x: Infinity, y: -Infinity };
        const bottomRight: Point = { x: -Infinity, y: -Infinity };

        cornerPoints.forEach(point => {
            if (point.x + point.y < topLeft.x + topLeft.y) {
                topLeft.x = point.x;
                topLeft.y = point.y;
            }
            if (point.x - point.y > topRight.x - topRight.y) {
                topRight.x = point.x;
                topRight.y = point.y;
            }
            if (point.x - point.y < bottomLeft.x - bottomLeft.y) {
                bottomLeft.x = point.x;
                bottomLeft.y = point.y;
            }
            if (point.x + point.y > bottomRight.x + bottomRight.y) {
                bottomRight.x = point.x;
                bottomRight.y = point.y;
            }
        });

        resolve({ topLeft, topRight, bottomRight, bottomLeft });
    });
}

function detectGreenLine(imageA: HTMLImageElement): Promise<{ startPoint: Point, endPoint: Point }> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = imageA.naturalWidth;
        canvas.height = imageA.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Could not get canvas context"));
        ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'

        ctx.drawImage(imageA, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let smallestX: Point = { x: Infinity, y: 0 };
        let smallestY: Point = { x: 0, y: Infinity };
        let biggestX: Point = { x: 0, y: 0 };
        let biggestY: Point = { x: 0, y: 0 };

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const index = (y * canvas.width + x) * 4;

                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];

                if (isValidPixel(g, r, b)) {
                    if (x < smallestX.x) smallestX = { x, y };
                    if (x > biggestX.x) biggestX = { x, y };
                    if (y < smallestY.y) smallestY = { x, y };
                    if (y > biggestY.y) biggestY = { x, y };
                }
            }
        }

        const isHorizontal = imageA.height > imageA.width;
        const startPoint = isHorizontal ? smallestX : smallestY;
        const endPoint = isHorizontal ? biggestX : biggestY;

        if (!startPoint || !endPoint) {
            return reject(new Error("No green line found"));
        }

        resolve({ startPoint, endPoint });
    });
}

function getRedDots(imageA: HTMLImageElement): Promise<PointVariants> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = imageA.naturalWidth;
        canvas.height = imageA.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Could not get canvas context"));
        ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'

        ctx.drawImage(imageA, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let redDots: PointVariants = { x: [], y: [] };

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const index = (y * canvas.width + x) * 4;

                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];

                // Identify the red dot
                if (isValidPixel(r, g, b)) {
                    redDots.x.push(x);
                    redDots.y.push(y);
                    //console.log("redDot:", "x:", x, "y:", y, "r:", r, "g:", g, "b:", b)
                }
            }
        }

        if (redDots.x.length == 0) {
            return reject(new Error("No red dot found"));
        }

        resolve(redDots);
    });
}

function chipOffImage(image: HTMLImageElement | HTMLCanvasElement, quad: Quadrilateral, borderColor: string | null = null): HTMLCanvasElement {
    // Create a canvas element and set its size to match the image
    const canvas = document.createElement('canvas');
    canvas.width = image instanceof HTMLImageElement? image.naturalWidth : image.width;
    canvas.height = image instanceof HTMLImageElement? image.naturalHeight : image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context");
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'
    
    // Clear the entire canvas to make everything transparent by default
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Extract quad points
    const { topLeft, topRight, bottomRight, bottomLeft } = quad;

    // Create a path for the quadrilateral area
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.closePath();

    // Clip to the quadrilateral area
    ctx.save();
    ctx.clip();

    // Draw the image only within the clipped area
    ctx.drawImage(image, 0, 0);

    // Restore context to stop clipping
    ctx.restore();

    // If borderColor is provided, draw the border around the quad
    if (borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(topLeft.x, topLeft.y);
        ctx.lineTo(topRight.x, topRight.y);
        ctx.lineTo(bottomRight.x, bottomRight.y);
        ctx.lineTo(bottomLeft.x, bottomLeft.y);
        ctx.closePath();
        ctx.stroke();
    }

    // Return the canvas as an image source (or append the canvas directly)
    return canvas;
}

function applyTransformation(
    imageB: HTMLImageElement,
    rotationAngle: number,
    scaleX: number,
    scaleY: number,
    shearX: number,
    shearY: number,
    center: Point,
    targetWidth: number,
    targetHeight: number,
    corners: Quadrilateral,
    debugColors?: DebugColors
): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context");
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((rotationAngle * Math.PI) / 180);
    ctx.transform(scaleX, shearX, shearY, scaleY, 0, 0);

    if (center) {
        const translateX = center.x - targetWidth / 2;
        const translateY = center.y - targetHeight / 2;
        ctx.translate(translateX, translateY);
    }

    ctx.drawImage(imageB, -imageB.width / 2, -imageB.height / 2);

    const chippedCanvas = chipOffImage(canvas, corners, debugColors?.border);

    return chippedCanvas;
}

async function hashImageSrc(imageSrc: string) {
    // Fetch the image as a blob (binary large object)
    const response = await fetch(imageSrc, {
        method: 'GET',
        mode: 'cors' // 👈 THIS is required for cross-origin CORS support
    });
    const blob = await response.blob();

    // Convert the blob to an array buffer
    const arrayBuffer = await blob.arrayBuffer();

    // Hash the array buffer using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);

    // Convert the hash buffer to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

export async function analyzeImage(imageA: HTMLImageElement, debug?: boolean): Promise<AnalyzeResult> {
    const corners = await findBlueQuadrilateralCorners(imageA)

    if (!corners) throw new Error("Blue border box not found!");

    const { topLeft, topRight, bottomLeft, bottomRight } = corners

    let redDots: PointVariants = await getRedDots(imageA)
    
    if (!topLeft || !bottomRight) throw new Error("Bounding box corners not found");

    const greenLineInfo = await detectGreenLine(imageA)
    const { startPoint, endPoint } = greenLineInfo

    const greenLineCurrentPosition = calculateMidpoint(startPoint, endPoint)

    const center = {
        x: redDots.x[redDots.x.length - 1],//Math.round((topRight.x - topLeft.x) / 2),//
        y: redDots.y[redDots.y.length - 1],//Math.round((bottomLeft.y - topLeft.y) / 2)//
    }
    
    const greenLineCircleRadius = Math.round(calculateDistance(center, greenLineCurrentPosition))

    const greenLinePreviousPosition = {
        x: center.x,
        y: center.y + greenLineCircleRadius
    }

    const angleFill = 2 * (imageA.height > imageA.width? -1 : 1)
    const rotationAngle = angleFill + Math.round(calculateAngleBetweenPoints(center, greenLinePreviousPosition, greenLineCurrentPosition))
    //console.log("detectGreenLineAngle: ", greenLineInfo, "greenLineCurrentPosition: ", greenLineCurrentPosition, "greenLinePreviousPosition: ", greenLinePreviousPosition);
 
    let scaleX = parseFloat((calculateDistance(topLeft, topRight) / imageA.naturalWidth).toPrecision(12));
    let scaleY = parseFloat((calculateDistance(topLeft, bottomLeft) / imageA.naturalHeight).toPrecision(12));
    
    const approximationErrorFill = 0.04
    scaleX = scaleX + approximationErrorFill;
    scaleY = scaleY + approximationErrorFill;

    const shearX = 0//(topRight.y - topLeft.y) / imageA.naturalWidth;
    const shearY = 0//(bottomLeft.x - topLeft.x) / imageA.naturalHeight;

    if(debug) {
        console.log(
            "analyzeImageV6:imageA", await hashImageSrc(imageA.src), 
            "imageA.width", imageA.width, 
            "imageA.height", imageA.height,
            "corners", corners,
            "greenLineInfo", greenLineInfo,
            "redDots", redDots,
            "center", center,
            "greenLineCircleRadius", greenLineCircleRadius,
            "greenLinePreviousPosition", greenLinePreviousPosition,
            "angleFill", angleFill,
            "rotationAngle", rotationAngle,
            "shearX", shearX,
            "shearY", shearY
        )
    }

    return {
        rotationAngle,
        scaleX,
        scaleY,
        shearX,
        shearY,
        center,
        width: imageA.width,
        height: imageA.height,
        corners
    };
}

function imageOrientation(angle: number): "landscape" | "portrait" | "diagonal" {
    // Normalize the angle to be between 0 and 360
    const normalizedAngle = angle % 360;

    // Define a tolerance for angles close to 90, 180, 270, 0
    const tolerance = 30;//A bit less than 45deg

    // Check if the angle is near 90° or 270° (horizontal)
    if (
        Math.abs(normalizedAngle - 90) <= tolerance || 
        Math.abs(normalizedAngle - 270) <= tolerance
    ) {
        return "landscape";  // The canvas is horizontal (landscape)
    } 
    
    // Check if the angle is near 0° or 180° (vertical)
    if (
        Math.abs(normalizedAngle - 0) <= tolerance || 
        Math.abs(normalizedAngle - 180) <= tolerance ||
        Math.abs(normalizedAngle - 360) <= tolerance
    ) {
        return "portrait";  // The canvas is vertical (portrait)
    }
    
    return "diagonal";  // For other angles (e.g., 45°, 135°, etc.), we cannot decide
}

const alignedImageSize = (imageB: HTMLImageElement, width: number, height: number, angle: number): HTMLImageElement => {
    /*
    if (height > width) {
        return (resizeImage(imageB, width, height) as any) as HTMLImageElement;

    } else {
        return (resizeImage(imageB, height, width) as any) as HTMLImageElement;
    }*/

    const orientation = imageOrientation(angle)
    //console.log("alignedImageSize: ", angle, angle - 360, orientation)
    if (orientation == "portrait" || orientation == "diagonal") {
        return (resizeImage(imageB, width, height) as any) as HTMLImageElement;

    } else {
        return (resizeImage(imageB, height, width) as any) as HTMLImageElement;
    }
}

export async function transformImage(
    base64ImageA: string,
    base64ImageB: string,
    topSpacePct: number,
    debugColors?: DebugColors
): Promise<string> {
    const imageA = await base64ToImage(base64ImageA);
    let imageB = await base64ToImage(base64ImageB);

    const analyzeResult = await analyzeImage(imageA);

    if (!analyzeResult) {
        throw new Error("Failed to analyze image");
    }

    //console.log("analyzeResult:transformImage ", analyzeResult);

    const { rotationAngle, scaleX, scaleY, shearX, shearY, center, width, height, corners } = analyzeResult;

    const w = width//Math.max(corners.topRight.x - corners.topLeft.x, corners.bottomRight.x - corners.bottomLeft.x)
    const h = height//Math.max(corners.bottomLeft.y - corners.topLeft.y, corners.bottomRight.y - corners.topRight.y)

    // Resize imageB to match the dimensions of imageA
    if (imageB.width !== w || imageB.height !== h) {
        imageB = alignedImageSize(imageB, w, h, rotationAngle)
    }
    
    const space = Math.round((topSpacePct * imageB.height) / 100);
    imageB = await ensureTopSpace(imageB, space) as HTMLImageElement;

    const transformedImageB = applyTransformation(
        imageB,
        rotationAngle,
        scaleX,
        scaleY,
        shearX,
        shearY,
        center,
        w,
        h,
        corners,
        debugColors
    );

    return imageToBase64(transformedImageB);
}

export async function transformImageByTemplate(
    analyzeResult: AnalyzeResult,
    base64ImageB: string,
    topSpacePct: number = 5,
    debugColors?: DebugColors
): Promise<string> {

    //console.log("transformImageByTemplate:1", topSpacePct)
    //return base64ImageB
    let imageB = await base64ToImage(base64ImageB);

    const { rotationAngle, scaleX, scaleY, shearX, shearY, center, width, height, corners } = analyzeResult;

    const w = width//Math.max(corners.topRight.x - corners.topLeft.x, corners.bottomRight.x - corners.bottomLeft.x)
    const h = height//Math.max(corners.bottomLeft.y - corners.topLeft.y, corners.bottomRight.y - corners.topRight.y)

    // Resize imageB to match the dimensions of imageA
    if (imageB.width !== w || imageB.height !== h) {
        imageB = alignedImageSize(imageB, w, h, rotationAngle)
    }
    
    const space = Math.round((topSpacePct * imageB.height) / 100);
    imageB = await ensureTopSpace(imageB, space) as HTMLImageElement;

    //console.log("transformImageByTemplate:", w, h, width, height)
    
    const transformedImageB = applyTransformation(
        imageB,
        rotationAngle - 360,
        scaleX,
        scaleY,
        shearX,
        shearY,
        center,
        w,
        h,
        corners,
        debugColors
    );

    return imageToBase64(transformedImageB);
}