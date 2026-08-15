const isNode = typeof window === 'undefined';

export class DOMParserWrapper {
    private parser: any;

    constructor() {
        if (isNode) {
            const { JSDOM } = require("jsdom");
            this.parser = JSDOM;
        } else {
            this.parser = new DOMParser();
        }
    }

    public parseFromString(s: string, contentType = 'text/html'): any {
        if (isNode) {
            const dom = new this.parser(s, { contentType });
            return dom.window.document;
        } else {
            return this.parser.parseFromString(s, contentType);
        }
    }
}

// Register the global DOMParser in Node.js
if (isNode) {
    (globalThis as any).DOMParser = DOMParserWrapper;
}