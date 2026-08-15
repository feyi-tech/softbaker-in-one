import { Box, HStack, Text, useToast } from "@chakra-ui/react";
import ModalPop from "../../ModalPop";
import { useState, useEffect, useRef } from "react";
import CuteButton from "../../CuteButton";
import SignaturePad from "signature_pad";
import { FaTrash, FaUndo } from "react-icons/fa";
import { ImageInputStrategy, SignatureDrawerInput } from "../types";
import Swal from "sweetalert2";
import useColorValue from "@/root/src/hooks/useColorValue";

interface DrawSignature extends SignatureDrawerInput, ImageInputStrategy {

}
const DrawSignature: React.FC<DrawSignature> = ({ onClose, onImage, minSignatureWidth, maxSignatureWidth }) => {
    const signaturePadRef = useRef<SignaturePad | null>(null);
    const [canvasLoaded, setCanvasLoaded] = useState<boolean>(false)
    const [ processingSignature, setProcessingSignature ] = useState<boolean>()
    const [ imageError, setImageError ] = useState<string>()
    const toast = useToast()
    
    const setupCanvas = () => {
        const canvas = document.getElementById("signature_track") as HTMLCanvasElement;
        if (canvas) {
            signaturePadRef.current = new SignaturePad(canvas, {
                penColor: "#000",
                minWidth: minSignatureWidth || 0.7,
                maxWidth: maxSignatureWidth || 0.7
            });
            setCanvasLoaded(true)

        } else {
            setTimeout(() => {
                setupCanvas()
            }, 100);
        }
    }

    useEffect(() => {
        // Initialize the signature pad
        setupCanvas()
    }, []);

    const handleUseSignature = () => {
        if(processingSignature) {
            Swal.fire({
                icon: "info",
                title: "Processing",
                text: "Your signature is currently being processed. Please try again after processing."
            })
            return
        }
        setProcessingSignature(true)
        // Get the base64 representation of the drawn signature
        const base64Image = signaturePadRef.current?.toDataURL() || "";
        onImage(null, base64Image)
    };

    const undo = () => {
        const current = signaturePadRef.current;
        if(current) {
            const data = current.toData();
            data.pop() // remove the last dot or line
            current.fromData(data);

        } else {
            toast({
                description: "Signature pad unavailabe. Please try again later.",
                status: "error",
                duration: 4000,
                isClosable: true
            })
        }
    }

    const clear = () => {
        const current = signaturePadRef.current;
        if(current) {
            current.clear()

        } else {
            toast({
                description: "Signature pad unavailabe. Please try again later.",
                status: "error",
                duration: 4000,
                isClosable: true
            })
        }
    }

    return (
        <ModalPop title={"Draw Signature"} isOpen={true} onClose={() => onClose()}>
            {
                canvasLoaded?
                <Text as="div" fontSize="12px" mb={2}>
                    Drag your finger or mouse around, inside the box below to sign.
                </Text>
                :
                <Text as="div" fontSize="12px" mb={2} fontStyle="italic">
                    Setting up signature pad. Please wait...
                </Text>
            }
            <Box as="canvas" id="signature_track" mb={0} width="100%" height="150px" cursor="pointer" bg="#cfcfcf" border="4px ridge #dd6b20" />
            <HStack justifyContent="space-between" alignItems="center" mb={1}>
                <CuteButton status="warning" mb="1rem" onClick={undo} rightIcon={<FaUndo />}>
                    Undo
                </CuteButton>
                <CuteButton status="warning" mb="1rem" onClick={clear} rightIcon={<FaTrash />}>
                    Clear
                </CuteButton>
            </HStack>

            {processingSignature? <Text as="div" fontStyle="italic" fontSize="12px">Processing signature...</Text> : null}
            {imageError? <Text as="div" fontSize="12px" color={useColorValue("errorColor.light", "errorColor.dark")}>{imageError}</Text> : null}
            <CuteButton status="warning" mb="1rem" onClick={handleUseSignature}>
                Use Signature
            </CuteButton>
        </ModalPop>
    );
};

export default DrawSignature;