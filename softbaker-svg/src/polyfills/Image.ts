const isNode = typeof window === 'undefined';

export class ImageWrapper {
    private _onload: (() => void) | null = null;
    private _onerror: ((err: any) => void) | null = null;
    private _src: string = '';
    private _imageLoaded: boolean = false;
    private _realImage: any;
    
    constructor() {
        if (isNode) {
          const { Image } = require('canvas');
          this._realImage = new Image();
        } else {
          this._realImage = new window.Image();
        }
    }

    get onload() {
        return this._onload;
    }

    set onload(callback: (() => void) | null) {
        this._onload = callback;
        this._realImage.onload = callback;
    }

    get onerror() {
        return this._onerror;
    }

    set onerror(callback: ((err: any) => void) | null) {
        this._onerror = callback;
        this._realImage.onerror = callback;
    }

    get realImage(): any {
        return this._realImage;
    }

    get src(): string {
        return this._src;
    }

    set src(value: string) {
        this._src = value;
        this._imageLoaded = false;

        if (isNode) {
            const { loadImage } = require('canvas');

            const handleLoad = (img: any) => {
                this._realImage = img; // Replace _realImage with the fully loaded image
                this._imageLoaded = true;
                if (this._onload) this._onload();
            };

            const handleError = (err: any) => {
                this._imageLoaded = false;
                if (this._onerror) this._onerror(err);
            };

            if (value.startsWith('data:image/') || value.startsWith('data:img/')) {
                const buffer = Buffer.from(value.split(',')[1], 'base64');
                loadImage(buffer).then(handleLoad).catch(handleError);
            } else {
                loadImage(value).then(handleLoad).catch(handleError);
            }
        } else {
            this._realImage.src = value; // Native browser behavior
        }
    }

    get width(): number {
        return this._realImage.width;
    }

    get height(): number {
        return this._realImage.height;
    }

    get complete(): boolean {
        return this._imageLoaded;
    }
}

// Register the global Image in Node.js
if (isNode) {
    (globalThis as any).Image = ImageWrapper;
}