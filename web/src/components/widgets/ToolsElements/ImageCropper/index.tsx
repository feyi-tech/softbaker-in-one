import React, { useState, useEffect } from 'react';
import ReactCrop, { Crop, PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Box, VStack, HStack, Text, Image as ImageEl, Spinner, Divider } from "@chakra-ui/react";
import CuteButton from "../../CuteButton";
import { FaSearch } from "react-icons/fa";
import DrawerPop from "../../DrawerPop";
import { ImageCropArg } from '../types';
import AppButton from '../../AppButton';

interface ImageCropper {
    image: string,
    imageFile?: File,
    imageCropArg: ImageCropArg,
    onImage: (file: File | null, base64Image: string | null, thumbnail?: string | null, error?: Error | null) => void;
    onThumb?: (file: File, base64Image: string | null) => Promise<string | null>,
}

const createImage = (url: string): Promise<HTMLImageElement> => {

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.src = url;
  });
}

const getCropScale = (originalSize: number, cropSize: number) => {
  return cropSize / originalSize
}

const getCroppedImg = async (imageSrc: string, percentageCrop: PercentCrop): Promise<{ base64: string }> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not get canvas context');

    const cropWidth = (percentageCrop.width * image.width) / 100
    const cropHeight = (percentageCrop.height * image.height) / 100
    const cropX = (percentageCrop.x * image.width) / 100
    const cropY = (percentageCrop.y * image.height) / 100

    /*
    console.log("getCroppedImg: ", 
      "percentageCrop.width", percentageCrop.width, 
      "cropWidth:", cropWidth, 
      "cropHeight: ", cropHeight, 
      "percentageCrop.height", percentageCrop.height,
      "cropX: ", cropX,
      "cropY: ", cropY,
      "image.width", image.width,
      "image.height", image.height
    )*/

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
    );

    return { base64: canvas.toDataURL('image/png') }; // Save as high-quality JPEG
};

const MIN_GRID_LENGTH_PCT = 5;
const ImageCropper: React.FC<ImageCropper> = ({ image, imageFile, imageCropArg, onThumb, onImage }) => {
    const [crop, setCrop] = useState<PercentCrop | undefined>();
    const [completedCrop, setCompletedCrop] = useState<PercentCrop | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Only set crop when the image changes
        if (image) {
            loadImageAndSetCrop();
        }
    }, [image]);

    const loadImageAndSetCrop = async () => {
        try {
            // Set crop only once on image load
            setCrop({
                unit: '%',
                x: 25, 
                y: 20, 
                width: 50, 
                height: 50,
            });

        } catch (error: any) {
            console.error('Error loading image:', error);
            onImage(null, null, null, error);
        } finally {
        }
    };

    const handleCropComplete = (crop: Crop, percentageCrop: PercentCrop) => {
        setCompletedCrop(percentageCrop);
    };

    const handleCropSave = async () => {
        setIsLoading(true)
        if (completedCrop) {
            try {
                const croppedImage = await getCroppedImg(image, completedCrop);
                onImage(null, croppedImage.base64);
                setIsLoading(false)
            } catch (error: any) {
                console.error('Error cropping the image:', error);
                onImage(null, null, null, error);
                setIsLoading(false)
            }
        }
    };

    return (
        <DrawerPop title="Crop Image" isOpen={true} width="100%" height="100%" placement="top" onClose={() => { onImage(null, null, null, null) }} overflowY="auto">
            <VStack width="100%" alignItems="center">
                {isLoading ? (
                    <VStack p="0.5rem" width="300px" height="300px" pos="relative" justifyContent="center" alignItems="center">
                      <Spinner size="xl" mb={2} />
                      <Text as="div" textAlign="center" fontStyle="italic">Processing image. Please wait...</Text>
                    </VStack>
                ) : (
                    <>
                        <VStack border="1px" p="0.5rem" width="300px" height="300px" pos="relative" justifyContent="flex-start" alignItems="center" mb={4}>
                          {imageCropArg.sampleImage && (
                            <>
                              <HStack justifyContent="flex-start" alignItems="flex-end" mb={0}>
                                <ImageEl width="auto" height="60px" src={imageCropArg.sampleImage} border="1px dashed" />
                                <Text as="div">Sample Image</Text>
                              </HStack>
                              <Divider />
                            </>
                          )}
                            <ReactCrop
                                crop={crop}
                                onChange={(newCrop: Crop, percentageCrop: PercentCrop) => {
                                    if(percentageCrop.width > MIN_GRID_LENGTH_PCT && percentageCrop.height > MIN_GRID_LENGTH_PCT) {
                                        //console.log("ReactCrop.onChange: ", MIN_GRID_LENGTH_PCT, percentageCrop)
                                        setCrop(percentageCrop)
                                    }
                                }}
                                onComplete={handleCropComplete}
                            >
                                <ImageEl
                                    src={image}
                                    height="200px" width="auto"
                                    //onLoad={() => setIsLoading(false)}
                                />
                            </ReactCrop>
                        </VStack>

                        {imageCropArg.message && (
                            <Box>
                                <Text as="div" textAlign="center" maxWidth="600px">{imageCropArg.message}</Text>
                            </Box>
                        )}
                        
                        <AppButton onClick={handleCropSave} outlineColor="#dd6b20">Submit Crop</AppButton>
                    </>
                )}
            </VStack>
        </DrawerPop>
    );
};

export default ImageCropper;