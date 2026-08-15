import { useEffect, useState } from "react";
import ModalPop from "../ModalPop";
import CuteButton from "../CuteButton";
import { FaUpload } from "react-icons/fa";
import { VStack, Text, Image, HStack } from "@chakra-ui/react";
import { UploadStrategy } from "./types";
import { resizeImage } from "@/root/src/utils/imageHelperTs";
import { galleryGet } from "@/root/src/utils/gallery";
import { base64UrlToFile } from "@/root/src/utils/base64Image";
import useLogger, { LOGGER_LOG_TYPES } from "../../tools/tool_editor/Form/svg-processor/hooks/useLogger";


const UploadImage: React.FC<UploadStrategy> = ({ 
  galleryKey,
  onClose, onImage, maxFileSize, isOtherFiles, onThumb,
  title, message, hoverMessage, ruleMessage, useImageText,
  accept,
}) => {
  const { logger } = useLogger()
  const [hovered, setHovered] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>()

  useEffect(() => {
    if(galleryKey) {
      const savedImage = galleryGet(galleryKey)
      if(savedImage) {
        setBase64Image(savedImage)
        const savedImageFile = base64UrlToFile(savedImage)
        if(savedImage) setImageFile(savedImageFile)
      }
    }
  }, [galleryKey])

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHovered(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHovered(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if(processing) return
    e.preventDefault();
    setHovered(false);

    const files = e.dataTransfer.files;

    if (files.length > 0) {
      const reader = new FileReader();
      const file = files[0];

      reader.onload = async (event) => {
        //console.log("FileInfo:check ", maxFileSize, maxFileSize && maxFileSize > 0? true : false, !isOtherFiles, isOtherFiles)
        if(maxFileSize && maxFileSize > 0 && !isOtherFiles && file.size > maxFileSize) {
          setProcessing(true)
          const resizedImage = await resizeImage(file, maxFileSize);
          setBase64Image(resizedImage.base64);
          setImageFile(resizedImage.file)
          setProcessing(false)
          //console.log("FileInfo:prev ", resizedImage.file)

        } else {
          //console.log("FileInfo:else ", file)
          const result = event.target?.result as string;
          setBase64Image(result);
          setImageFile(file)
        }
        
      };

      reader.readAsDataURL(file);
    }
  };

  const handleClickUpload = () => {
    logger(`handleClickUpload.called:`, LOGGER_LOG_TYPES.info);

    if (processing) {
      logger(`handleClickUpload.aborted: processing in progress`, LOGGER_LOG_TYPES.warning);
      return;
    }

    // Create and configure the file input
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = accept || "image/*";
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.addEventListener("change", async (event) => {
      const files = (event.target as HTMLInputElement).files;
      document.body.removeChild(fileInput);

      if (files && files.length > 0) {
        const file = files[0];
        logger(`File selected: ${JSON.stringify({
          name: file.name,
          size: file.size,
          type: file.type,
        })}`, LOGGER_LOG_TYPES.info);

        const reader = new FileReader();

        reader.onload = async (event) => {
          logger(`FileReader.onload fired:`, LOGGER_LOG_TYPES.info);

          const result = event.target?.result as string;

          if (!result) {
            logger(`FileReader result is empty or undefined`, LOGGER_LOG_TYPES.error);
            return;
          }

          if (maxFileSize && maxFileSize > 0 && !isOtherFiles && file.size > maxFileSize) {
            logger(`File size exceeds maxFileSize, resizing...`, LOGGER_LOG_TYPES.info);

            setProcessing(true);
            const resizedImage = await resizeImage(file, maxFileSize);

            logger(`Image resized.size: ${resizedImage.base64.length}`, LOGGER_LOG_TYPES.info);

            setBase64Image(resizedImage.base64);
            setImageFile(resizedImage.file);
            setProcessing(false);
          } else {
            logger(`File within size limit, setting base64 image`, LOGGER_LOG_TYPES.warn);

            setBase64Image(result);
            setImageFile(file);
          }
        };

        reader.onerror = (error: any) => {
          logger(`FileReader.onerror fired: ${error?.message || error}`, LOGGER_LOG_TYPES.error);
        };

        reader.readAsDataURL(file);
      } else {
        logger(`No file selected or file input is empty`, LOGGER_LOG_TYPES.warn);
      }
    });

    
    fileInput.click();
  };


  const [ thumb, setThumb ] = useState<string | null>()

  const handleUseImage = () => {
    onImage(imageFile as File, base64Image as string, thumb)
  };
  
  useEffect(() => {
    if(imageFile && base64Image && onThumb) {
      onThumb(imageFile, base64Image)
      .then(image => {
        setThumb(image)
      })
      .catch(e => {
        console.error("handleUseImage: ", e.message)
        setThumb(undefined)
      })

    } else {
      setThumb(base64Image)
    }
  }, [base64Image]);

  return (
    <ModalPop title={title} isOpen={true} onClose={() => onClose()}>
      <VStack p="0.5rem"
        id="upload-area"
        justifyContent="center"
        alignItems="center"
        mb={4}
        width="100%"
        height="300px"
        cursor="pointer"
        border={`4px dashed ${hovered ? "#dd6b20" : "#ccc"}`} 
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FaUpload size="2rem" />
        <VStack alignItems="center">
          <Text as="div" fontSize="12px">
            { hovered ? hoverMessage : message }
          </Text>
          <Text as="div" fontSize="14px">
            OR
          </Text>
          <CuteButton status="info" mb="1rem" onClick={handleClickUpload} display={processing? "none" : "block"}>
            Click to Upload
          </CuteButton>
          <Text as="div" fontSize="12px" textAlign="center">({ ruleMessage })</Text>
          {
            processing? 
            <Text as="div" fontSize="12px" fontStyle="italic" color="#3182ce">Processing image. Please wait...</Text>
            : null
          }
          <HStack justifyContent="center" alignItems="flex-end" flexWrap="wrap">
            {base64Image && (
                <>
                    <Image src={thumb || ""} bg={"#cfcfcf"} width="auto" height="70px" border="4px ridge #dd6b20" />
                    
                    <CuteButton status="warning" h="70px" onClick={handleUseImage} disabled={processing} fontStyle={processing? "italic" : "normal"}>
                        { processing? "Please wait..." : useImageText }
                    </CuteButton>
                </>
            )}
          </HStack>
        </VStack>
      </VStack>
    </ModalPop>
  );
};

export default UploadImage;