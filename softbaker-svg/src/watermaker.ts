import { getCanvas } from "./imageHelper.ts";

const isNode = typeof window === 'undefined';

export const OBSCURE_PCT = 70
export function obscureText(text: string, visiblePercentage: number): string {
    if (visiblePercentage < 0 || visiblePercentage > 100) {
        throw new Error("Percentage should be between 0 and 100");
    }

    const totalChars: number = text.length;
    
    // Collect indices of non-space characters
    const nonSpaceIndices: number[] = [];
    for (let i = 0; i < totalChars; i++) {
        if (text[i] !== ' ') {
            nonSpaceIndices.push(i);
        }
    }

    const visibleCharsCount: number = Math.round((visiblePercentage / 100) * nonSpaceIndices.length);

    // Shuffle indices randomly
    for (let i = nonSpaceIndices.length - 1; i > 0; i--) {
        const j: number = Math.floor(Math.random() * (i + 1));
        [nonSpaceIndices[i], nonSpaceIndices[j]] = [nonSpaceIndices[j], nonSpaceIndices[i]];
    }

    const visibleIndices: Set<number> = new Set(nonSpaceIndices.slice(0, visibleCharsCount));

    return text.split('').map((char, index) => {
        if (char === ' ') return char; // Keep spaces unchanged
        return visibleIndices.has(index) ? char : '*';
    }).join('');
}

export async function watermark(svgString: string, width: number, height: number): Promise<string> {
    /**
     * Extracts the most frequently used text color from an SVG, considering multiple <style> elements.
     */
    function getDominantTextColor(svgString: string): string {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgString, "image/svg+xml");

        // Collect all <style> content
        const styleContent = Array.from(svgDoc.querySelectorAll("style"))
            .map(style => style.textContent || "")
            .join(" ");

        console.log("styleContent:", styleContent)

        /**
         * Extracts fill color from CSS rules.
         */
        function findFillInCSS(selector: string): string | null {
            const regex = new RegExp(`${selector}\\s*{[^}]*fill:\\s*([^;]+);`, "gi");
            const matches = Array.from(styleContent.matchAll(regex)); // FIXED HERE
            const fill = matches.length > 0 ? matches[matches.length - 1][1].trim() : null;

            console.log("findFillInCSS:", selector, fill)

            return fill
        }

        const textElements = svgDoc.querySelectorAll("text");
        const colorMap: Record<string, number> = {};

        textElements.forEach((textEl) => {
            let color = textEl.getAttribute("fill");

            // If no fill is found, check CSS styles
            if (!color) {
                const classNames = textEl.getAttribute("class")?.split(/\s+/) || [];
                const id = textEl.getAttribute("id");

                // Check CSS rules for fill color
                for (const className of classNames) {
                    if (!color) color = findFillInCSS(`\\.${className}`);
                }
                if (!color && id) color = findFillInCSS(`#${id}`);
            }

            // Normalize color and count occurrences
            if (color) {
                color = color.toLowerCase();
                colorMap[color] = (colorMap[color] || 0) + 1;
            }
        });

        // Get the most frequently used text color, fallback to white if none found
        return Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1]) // Sort by frequency
            .map(([color]) => color)[0] || "black"; // Default to white
    }

    return new Promise((resolve, reject) => {
        const textColor = getDominantTextColor(svgString); // Extract text color from SVG styles

        // Convert SVG to Image
        const img = new Image();
        let svgBtoa
        try {
            svgBtoa = btoa(unescape(encodeURIComponent(svgString))) // btoa(svgString)

        } catch(e: any) {
            console.log("getDominantTextColor:error", e?.message, svgString)
            return reject(e)
        }
        img.onload = () => {
            const canvas = getCanvas(width, height);
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d") as any;

            if (!ctx) {
                resolve("");
                return;
            }

            ctx.clearRect(0, 0, width, height);
            ctx.font = "20px Arial";
            ctx.globalAlpha = 0.9; // Semi-transparent watermark

            const text = "Fake Sample";
            const textWidth = ctx.measureText(text).width;
            const textHeight = 20;
            const numTexts = Math.floor((width * height) / (textWidth * textHeight * 3));

            for (let i = 0; i < numTexts; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const angle = (Math.random() * 60 - 30) * (Math.PI / 180);

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle);
                ctx.fillStyle = textColor; // Use the extracted text color
                ctx.fillText(text, 0, 0);
                ctx.restore();
            }

            // === Add Warning Text with Contrast Fix ===
            const warningText = `Remove watermark to remove "Fake Sample" and show all hidden texts.`;

            let warningFontSize = Math.floor(width / 30);
            ctx.font = `${warningFontSize}px Arial`;
            ctx.globalAlpha = 1;

            // Calculate best contrast for warning text
            const avgColor = textColor.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
            const brightness = (avgColor[0] * 0.299 + avgColor[1] * 0.587 + avgColor[2] * 0.114);
            ctx.fillStyle = brightness > 128 ? "black" : "white"; // Adjust contrast

            let warningTextWidth = ctx.measureText(warningText).width;
            const maxWidth = width * 0.45;

            while (warningTextWidth > maxWidth && warningFontSize > 10) {
                warningFontSize -= 2;
                ctx.font = `${warningFontSize}px Arial`;
                warningTextWidth = ctx.measureText(warningText).width;
            }

            const padding = warningFontSize * 0.8;
            const textX = width * 0.05;

            const positions = [
                { x: textX, y: height * 0.15 },
                { x: textX, y: height * 0.6 }
            ];

            positions.forEach(({ x, y }) => {
                const boxWidth = warningTextWidth + padding * 2;
                const boxHeight = warningFontSize + padding * 1.5;
                const boxX = x - padding * 0.5;
                const boxY = y - warningFontSize - padding;

                ctx.globalAlpha = 0.5;
                ctx.fillStyle = "black";
                ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

                ctx.globalAlpha = 1;
                ctx.fillStyle = "white";
                ctx.fillText(warningText, x, y);
            });

            resolve(canvas.toDataURL("image/png"));
        };
        img.src = `data:image/svg+xml;base64,${svgBtoa}`;
    });
}