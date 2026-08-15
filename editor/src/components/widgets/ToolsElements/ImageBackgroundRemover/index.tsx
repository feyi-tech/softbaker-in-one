import React, { useState, useEffect } from 'react';
import { Box, Flex, HStack, Image as ImageEl, Progress, Spinner, Text, VStack } from '@chakra-ui/react';
import ModalPop from '../../ModalPop';
import CuteButton from '../../CuteButton';
import useBgRemover from './use-bg-remover';
import { base64UrlToFile } from '@/root/src/utils/base64Image';
import AppButton from '../../AppButton';
import Swal from 'sweetalert2';
import useLogger, { LOGGER_LOG_TYPES } from '../../../tools/tool_editor/Form/svg-processor/hooks/useLogger';

interface ImageBackgroundRemover {
    image: string,
    imageFile?: File,
    debug?: boolean,
    onImage: (file?: File | null, base64Image?: string | null, thumbnail?: string | null, error?: Error | null) => void;
    onThumb?: (file?: File, base64Image?: string | null) => Promise<string | null>,
}

const checkImageTransparency = async (imageSrc: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = imageSrc;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(false);

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const transparencyThreshold = 0.2; // Threshold for significant transparency
            const cornerSize = 0.15; // 15% of width and height

            const corners = [
                [0, 0],
                [canvas.width - cornerSize * canvas.width, 0],
                [0, canvas.height - cornerSize * canvas.height],
                [canvas.width - cornerSize * canvas.width, canvas.height - cornerSize * canvas.height]
            ];

            const checkTransparency = (x: number, y: number) => {
                const index = (y * canvas.width + x) * 4;
                return data[index + 3] < 255 * transparencyThreshold; // Alpha value check
            };

            let transparentPixels = 0;
            const totalPixels = cornerSize * cornerSize * canvas.width * canvas.height;
            
            for (const [cx, cy] of corners) {
                for (let x = 0; x < cornerSize * canvas.width; x++) {
                    for (let y = 0; y < cornerSize * canvas.height; y++) {
                        if (checkTransparency(cx + x, cy + y)) {
                            transparentPixels++;
                        }
                    }
                }
            }

            resolve(transparentPixels / totalPixels > 0.5); // Check if significant transparency
        };

        img.onerror = () => resolve(false);
    });
};

const ImageBackgroundRemover: React.FC<ImageBackgroundRemover> = ({ image, imageFile, onThumb, onImage, debug }) => {
    const { logger } = useLogger()
    const [processing, setProcessing] = useState<boolean>(true);

    const { startBackgroundRemoval, progress, progressMessage } = useBgRemover(image, imageFile, debug);

    const returnImage = async (imageBase64: string, imageFile?: File) => {
        let thumb;
        let imgFile;
        if(imageFile) imgFile = base64UrlToFile(imageBase64, imageFile.name, imageFile.type)

        if (onThumb && imgFile) {
            try {
                thumb = await onThumb(imgFile, imageBase64);
            } catch (e) {
                console.error(e);
            }
        }
        onImage(imgFile, imageBase64, thumb);
    }

    useEffect(() => {
        if (image) {
            setProcessing(true);
            checkImageTransparency(image)
            .then(async isTransparent => {
                //console.log("bgRemover:isTransparent ", isTransparent)

                if (isTransparent) {
                    await returnImage(image, imageFile)
                    setProcessing(false);

                } else {
                    setProcessing(false);
                }

            })
            .catch((e: any) => {
                logger(`ImageBackgroundRemover.checkImageTransparency.error:${e?.message}`, LOGGER_LOG_TYPES.error)
                onImage(null, null, null, e);
            })
        }

    }, [image]);

    return (
        <ModalPop title="Background Remover" isOpen={true} width="100%" height="100%" onClose={() => { onImage(null, null, null, null); }}>
            <VStack spacing={4} alignItems="center">
                <ImageEl src={image} height="250px" width="auto" overflowY="auto" />
                {
                    progress && processing && progressMessage? (
                        <VStack w="200px" alignItems="center">
                            <Progress 
                                value={(progress.current / progress.total) * 100} 
                                width="100%" borderRadius="2px"
                                hasStripe 
                                isAnimated
                            />
                            <Text as="div" fontSize="12px" textAlign="center" fontStyle="italic">
                                { progressMessage }
                            </Text>
                            <Spinner size="sm" />
                        </VStack>
                    )
                    :
                    processing? (
                        <VStack w="100%" justifyContent="flex-start" alignItems="center">
                            <Spinner size="xl" mb={2} />
                            <Text as="div" textAlign="center" fontStyle="italic">
                                Checking Image opacity. Please be patient...
                            </Text>
                        </VStack>
                    ) : (
                        <Flex w="100%" 
                            flexDirection={{base: "column", md: "row"}} 
                            justifyContent={{base: "flex-start", md: "center"}}>
                            <AppButton fontSize="0.7rem" bgColor="tomato"
                                mr={{base: "0px", md: "0.5rem"}} mb={{base: "0.5rem", md: "0px"}}
                                onClick={() => {
                                    setProcessing(true);
                                    startBackgroundRemoval() //startBackgroundRemoval(0.25)
                                    .then(async (result) => {
                                        logger(`ImageBackgroundRemover.startBackgroundRemoval.ok: ${result.imageData? "resultImageData" : ""} ${result.imageFile? "resultImageFile" : ""} ${imageFile? "imageFile" : ""}`, LOGGER_LOG_TYPES.info)
                                        await returnImage(result.imageData, result.imageFile || imageFile)
                                        setProcessing(false);
                                    })
                                    .catch((error) => {
                                        logger(`ImageBackgroundRemover.startBackgroundRemoval.error:${error?.message}`, LOGGER_LOG_TYPES.error)
                                        setProcessing(false);
                                        onImage(null, null, null, error);
                                    });
                                }}
                            >
                                Remove Background
                            </AppButton>

                            <AppButton fontSize="0.7rem" variant="outline" outlineColor="tomato"
                                onClick={() => {
                                    Swal.fire({
                                        icon: "warning",
                                        title: "Skip Background Removal",
                                        text: "Are you sure you want to skip image background removal? If your image has a background, we recommend removing the background.",
                                        confirmButtonText: "Yes, Skip",
                                        cancelButtonText: "No",
                                        showCancelButton: true
                                    })
                                    .then(async (result) => {
                                        if(result.isConfirmed) {
                                            setProcessing(true);
                                            await returnImage(image, imageFile)
                                            setProcessing(false);
                                        }
                                    })
                                }}
                            >
                                Skip Background Removal
                            </AppButton>
                        </Flex>
                    )}
            </VStack>
        </ModalPop>
    );
};


export default ImageBackgroundRemover;