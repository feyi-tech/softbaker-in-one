
const isNode = typeof window === 'undefined';

export class FileWrapper {

    constructor(blob: any, name: string, mime: any) {
        if(!isNode) {
            return new File(blob, name, mime)

        } else {
            return blob
        }
    }
    
}

// Register the global Image in Node.js
if (isNode) {
    (globalThis as any).File = FileWrapper;
}