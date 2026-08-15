import { useEffect, useState } from "react"
import { Config, preload, removeBackground } from "@imgly/background-removal"
import { IMGLY_BG_REMOVAL_ASSETS_PATH } from "@/root/src/app-config"
import useTime from "../../../../hooks/useTime"
import { base64UrlToFile } from "@/root/src/utils/base64Image"

interface Progress {
    key: string,
    current: number, 
    total: number
}

interface RemovalState {
    imageData: string, 
    imageFile?: File | null
}

const inferenceMessages = [
    `🧠 Applying AI magic... Step {CURRENT} of {TOTAL}. Your image's background is being removed as we speak!🔥`,
    `🧠 Applying AI magic... Step {CURRENT} of {TOTAL}. Please be patient. Nothing's broken. The background is still being removed.👌`,
    `🧠 Applying AI magic... Step {CURRENT} of {TOTAL}. AI does good job at tasks like this. But can be a little bit slow if your mobile phone or PC's GPU is low. Please be patient.✌`,
    `🧠 Applying AI magic... Step {CURRENT} of {TOTAL}. Hang on buddy. All is working fine. Your image's background is being removed as we speak.😍`,
    `🧠 Applying AI magic... Step {CURRENT} of {TOTAL}. Only step 1 takes the longest time. The remaining steps take less than a few seconds in total.🚀`
]

const MESSAGE_STEP = 1000 * 10 // 10 seconds

function generateProgressMessage(key: string, current: number, total: number, inferenceStartTime: number, currentTime: number) {
    let progressMessage = "";

    if (key.startsWith("fetch:")) {
        if (current < total) {
            progressMessage = `🚀 Downloading background removal tools... ${Math.floor((current / total) * 100)}% completed. If this is your first time, this may take a bit longer. But don’t worry, next time will be much faster!`;
        } else {
            progressMessage = `✅ Tools downloaded! We're all set for quick background removal from now on.`;
        }
    } else if (key.includes("compute:decode")) {
        progressMessage = `🔍 Decoding image data... Step ${current} of ${total}. Hang tight, we're preparing your image for background removal.`;
    } else if (key.includes("compute:mask")) {
        progressMessage = `🔍 Masking image data... Step ${current} of ${total}. Hold on, we're masking your image for background removal.`;
    } else if (key.includes("compute:encode")) {
        progressMessage = `🔍 Encoding image data... Step ${current} of ${total}. Still working, we're encoding your image for background removal.`;
    } else if (key.includes("compute:inference")) {
        const timeDiff = currentTime - inferenceStartTime;
        const index = Math.floor(timeDiff / MESSAGE_STEP) % inferenceMessages.length;
        progressMessage = inferenceMessages[index]
            .replace("{CURRENT}", `${current}`)
            .replace("{TOTAL}", `${total}`);
    } else {
        progressMessage = `Wrapping up... Step ${current} of ${total}. Your image is being re-touched!`;
    }

    //console.log(`progressMessage`, progressMessage);

    return progressMessage;
}

const useBgRemover = (image: string, file?: File, debug?: boolean) => {
    const [ progress, setProgress ] = useState<Progress>()
    const [ progressMessage, setProgressMessage ] = useState<string>()
    const [ inferenceStartTime, setInferenceStartTime ] = useState<number>()

    const currentTime = useTime(1000)

    const resetProgress = () => {
        setProgress(undefined)
        setProgressMessage(undefined)
        setInferenceStartTime(undefined)
    }

    const setInference = () => {
        if(progress) {
            const time = Date.now()
            if(!inferenceStartTime && progress.key.includes("compute:inference")) setInferenceStartTime(time)
            setProgressMessage(generateProgressMessage(progress.key, progress.current, progress.total, inferenceStartTime || time, time))
        }
    }

    useEffect(() => {
        setInference()
    }, [ currentTime ])

    useEffect(() => {
        setInference()
    }, [ progress ])

    const [ imageState, setImageState ] = useState<RemovalState>({
        imageData: image,
        imageFile: file
    })

    useEffect(() => {
        setImageState({
            imageData: image,
            imageFile: file
        })
        resetProgress()
    }, [image, file])

    const [ config, setConfig ] = useState<Config>({
        //debug: debug,
        //device: 'cpu',
        publicPath: IMGLY_BG_REMOVAL_ASSETS_PATH,
        output: {
            format: "image/png",
            quality: 1
        },
        progress: (key, current, total) => {
            setProgress({
                key, current, total
            })
            console.info(`Downloading; ${key}: ${current} of ${total}`);
        }
    })

    const downscaleImage = (imageData: string, ratio: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = imageData;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL());
                } else {
                    reject(new Error('Failed to get canvas context'));
                }
            };
            img.onerror = () => {
                reject(new Error('Failed to load image for downscaling'));
            };
        });
    };

    const startBackgroundRemoval = (speedWithDownScaleRatio = 1): Promise<RemovalState> => {
        return new Promise((resolve, reject) => {
            resetProgress()

            let imageToProcess = Promise.resolve(image);
    
            if (speedWithDownScaleRatio && speedWithDownScaleRatio < 1) {
                imageToProcess = downscaleImage(image, speedWithDownScaleRatio);
            }
    
            imageToProcess
                .then((processedImage) => {
                    return removeBackground(processedImage, config);
                })
                .then((blob: Blob) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const finalImageData = reader.result as string;
                        let imageFile;
                        if (file) {
                            imageFile = base64UrlToFile(finalImageData, file.name);
                        }

                        const state = {
                            imageData: finalImageData,
                            imageFile: imageFile
                        };

                        setImageState(state);
                        resolve(state);
                    };
    
                    reader.onerror = () => {
                        reject(new Error('Failed to convert blob to base64'));
                    };
    
                    reader.readAsDataURL(blob);
                })
                .catch(e => {
                    reject(e);
                });
        });
    };

    return {
        progress,
        progressMessage,
        preloadBackgroundRemoval: () => preload(config),
        startBackgroundRemoval,
        imageState
    }
}

export default useBgRemover;
