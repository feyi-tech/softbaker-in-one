
import { useEffect, useState } from "react"
import { Dimension, UserImage } from "../components/tools/index.types";
import { getImageColor, getImageDimension, imageToStamp } from "../utils/imageHelper";
import { useBreakpointValue } from "@chakra-ui/react";

const STORAGE_KEY = "USE_IMAGE_LOADER"

const loadSvgImage = (svgString: string): Promise<ImageBitmap | HTMLImageElement> => {
    return new Promise(async (resolve, reject) => {
        // Create a Blob from the SVG string
        const svgBlob = new Blob([svgString], { type: "image/svg+xml" });

        //console.log("svgBlob:1", svgBlob)
        try {
            // Create an SVG image element from the Blob
            const svgImage = await createImageBitmap(svgBlob);
            resolve(svgImage)

        } catch(e) {
            // Create an SVG image element from the Blob
            const svgImage = new Image();
            svgImage.src = URL.createObjectURL(svgBlob);

            // Wait for the image to load
            svgImage.onload = (result: any) => {
                //console.log("svgBlob.loaded", result)
                resolve(svgImage)
            };

            svgImage.onerror = (e: any) => {
                //console.log("svgBlob.error", e?.message)
                resolve(e)
            };
        }
    })
}
export const svgToImageBase64Url = (svgString: string, format: "png" | "jpeg", downloadFilename?: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {

        const svgImage = await loadSvgImage(svgString);
        //console.log("svgBlob:2", svgImage)
  
        // Create a canvas element and set its dimensions to match the image
        const canvas = document.createElement('canvas');
        canvas.width = svgImage.width;
        canvas.height = svgImage.height;
  
        // Draw the image onto the canvas
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(svgImage, 0, 0);
  
          // Convert the canvas to a JPEG image
          const dataUrl = canvas.toDataURL(`image/${format}`);
  
          if (downloadFilename) {
            const link = document.createElement("a");
            link.download = downloadFilename;
            link.href = dataUrl;
  
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
  
            // Return the JPEG data URL
            resolve(dataUrl);
          } else {
            // Return the JPEG data URL
            resolve(dataUrl);
          }
        } else {
          reject(new Error("no-canvas-context"));
        }
      } catch (e) {
        reject(e);
      }
    });
}


export const getValidImageUrl = (url: string | File | null) => {
    if(typeof url === "string") {
        if(url.startsWith("/")) {
            return `${window.location.origin}${url}`

        }
        return url

    } else {
        return url
    }
}

const addToCache = (fileOrUrl: string | File, base64Image: string) => {/*
    if(typeof fileOrUrl === "string" && base64Image) {
        var storage = window.localStorage.getItem(STORAGE_KEY) || "{}"
        try {
            storage = {...JSON.parse(storage), [fileOrUrl]: base64Image}
            //console.log("storage:3", storage, base64Image)
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))

        } catch (e) {
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify({[fileOrUrl]: base64Image}))

            } catch(e) {}
        }
    }*/
}
const getFromCache = (fileOrUrl: string | File): string | null | undefined => {/*
    if(typeof fileOrUrl === "string") {
        var storage = window.localStorage.getItem(STORAGE_KEY)
        let cachedValue
        if(storage) {
            try {
                cachedValue = JSON.parse(storage)[fileOrUrl]
                //console.log("storage:get.d", cachedValue)

            } catch(e: any) {
                //console.log("storage:get.e", e.message)
            }
        }
        return cachedValue
    }*/
    return null
}

export const fileOrUrlToBase64 = (fileOrUrl: string | File): Promise<string | ArrayBuffer | null> => {
    return new Promise(async (resolve, reject) => {
        if(!fileOrUrl) return resolve(null)
        const cachedValue = getFromCache(fileOrUrl)
        if(cachedValue) {
            resolve(cachedValue)
            
        } else if(window.FileReader) {
            let blob
            if(typeof fileOrUrl === "string") {
                try {
                    blob = await (await fetch(fileOrUrl, {
                        method: 'GET',
                        mode: 'cors' // 👈 THIS is required for cross-origin CORS support
                    })).blob()
                } catch(e) {
                    reject(e)
                    return
                }

            }
            const reader = new FileReader()
            reader.onloadend = function() {
                if(reader.result) {
                    addToCache(fileOrUrl, reader.result.toString())
                    resolve(reader.result)

                } else {
                    reject(new Error("empty-filereader-result"))
                }
                
            }
            reader.onerror = function (error) {
                reject(error)
            }
            reader.readAsDataURL(blob || fileOrUrl as File)

        } else {
            if(typeof fileOrUrl !== "string") {
                reject(new Error("file-reader-not-supported"))

            } else {
                const img = new Image();
                img.crossOrigin = 'Anonymous'
                img.onload = function() {
                    var canvas = document.createElement('canvas')
                    var ctx = canvas.getContext('2d');
                    if(ctx) {
                        canvas.height = img.naturalHeight
                        canvas.width = img.naturalWidth
                        ctx.drawImage(img, 0, 0)
                        const dataURL = canvas.toDataURL()
                        resolve(dataURL);

                    } else {
                        reject("no-canvas")
                    }
                };
                img.src = fileOrUrl
            }
        }
    })
}

export const useBase64ImageLoader = (url: string | File) => {
    const [ base64Url, setBase64Url ] = useState<string | null>()
    const [ loading, setLoading ] = useState<boolean>()
    const [ error, setError ] = useState<string>()
    
    useEffect(() => {
        const validImageUrl = getValidImageUrl(url)
        if(validImageUrl) {
            setLoading(true)
            fileOrUrlToBase64(validImageUrl)
            .then(b64Image => {
                if(b64Image) setBase64Url(b64Image.toString())
                setLoading(false)
            })
            .catch((e: Error) => {
                setError(e.message)
                setLoading(false)
            })

        } else {
            setBase64Url(null)
        }
    }, [url])

    return { base64Url, loading, error }
}

export const useImageDimension = (image?: string | null) => {
    const [ userImage, setUserImage ] = useState<UserImage>()
    const [ loading, setLoading ] = useState<boolean>()
    const [ error, setError ] = useState<string>()
    
    useEffect(() => {
        if(image) {
            setLoading(true)
            getImageDimension(image)
            .then(dm => {
                setUserImage({
                    base64Url: image,
                    width: dm.width,
                    height: dm.height
                })
                setLoading(false)
            })
            .catch((e: Error) => {
                setError(e.message)
                setLoading(false)
            })
        }
    }, [image])

    return { userImage, loading, error }
}

export const useImageColor = (useDominantColor: boolean, image?: string | null) => {
    const [ color, setColor ] = useState<number[]>()
    const [ loading, setLoading ] = useState<boolean>()
    const [ error, setError ] = useState<string>()
    
    useEffect(() => {
        if(image) {
            setLoading(true)
            getImageColor(image, useDominantColor)
            .then(c => {
                setColor(c)
                setLoading(false)
            })
            .catch((e: Error) => {
                setError(e.message)
                setLoading(false)
            })
        }
    }, [image])

    return { color, loading, error }
}

export const useImageStamp = (color: number[], holePct: number, image?: string | null) => {
    const [ stamp, setStamp ] = useState<string>()
    const [ loading, setLoading ] = useState<boolean>()
    const [ error, setError ] = useState<string>()
    
    useEffect(() => {
        if(image) {
            setLoading(true)
            imageToStamp(image, color, holePct)
            .then(s => {
                setStamp(s)
                setLoading(false)
            })
            .catch((e: Error) => {
                setError(e.message)
                setLoading(false)
            })
        }
    }, [image])

    return { stamp, loading, error }
}

export const useResponsiveValue = (responsiveValue?: any | null) => {
    const [ loading, setLoading ] = useState<boolean>()
    const [ error, setError ] = useState<string>()
    const value = useBreakpointValue(responsiveValue? responsiveValue : {});

    return { value, loading, error }
}