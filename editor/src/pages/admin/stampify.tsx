import { HStack, Image, VStack } from "@chakra-ui/react"
import InputBox from "../../components/widgets/InputBox"
import { useState } from "react"
import UploadInput from "../../components/widgets/ToolsElements/UploadInput"
import AppButton from "../../components/widgets/AppButton"
import Swal from "sweetalert2"
import { imageToStamp } from "../../utils/imageHelper"

const Stampify = ({}) => {
    const [holes, setHoles] = useState<number>()
    const [stampColor, setStampColor] = useState<number[]>()
    const [image, setImage] = useState<string>()
    const [stampImage, setStampImage] = useState<string>()

    const handleSubmit = () => {
        if(!holes || !stampColor || !image) {
            Swal.fire({
                icon: "error",
                title: "Invalid or Empty fields",
                text: "Makre sure the image to stamp is uploaded, and the color and number of holes are specified"
            })
            
        } else {
            imageToStamp(image, stampColor, holes)
            .then(result => {
                setStampImage(result)
            })
            .catch(e => {
                console.log("Stampify.handleSubmit.error: ")
            })
        }
    }

    const handleDownload = () => {
        if(!stampImage) return
        const link = document.createElement('a');
        link.href = stampImage;
    
        // Try to infer file extension from base64 header
        const match = stampImage.match(/^data:image\/(\w+);base64,/);
        const extension = match ? match[1] : 'png'; // default to png if not found
    
        link.download = `image.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };    

    return (
        <VStack>
            <Image src={stampImage || image} height="200px" w="auto"mb={4} />
            <UploadInput w="100%"
                title={`Upload Image`} mb={4}
                message="Drag and Drop the picture here"
                hoverMessage="Drop the the picture here"
                ruleMessage="Upload JPG or PNG image."
                useImageText="Submit for Stamp"
                disableCrop={true}
                onChange={(file, base64Url) => {
                    if(base64Url) {
                        setImage(base64Url)
                    }
                }}
            />
            <InputBox mb={4} type={InputBox.TYPES.text} title={"Stamp colors"} 
            helperText={`Stamp color in rgb values. E.g 255,0,0 for red`}
            placeholder="Enter number of stamp holes" 
                onChange={(v) => {
                    const values = v.split(",").map((v: string) => Number(v.trim()))
                    if(values.length == 3) {
                        setStampColor(values)
                    }
                }}
            />
            <InputBox mb={4} type={InputBox.TYPES.number} title={"Stamp holes percentage"} 
                value={holes}
                placeholder="Enter stamp holes percentage" 
                numberDecimals={0}
                onChange={setHoles}
            />

            <HStack>
                <AppButton onClick={handleSubmit}>
                    Stamp Now
                </AppButton>
                <AppButton onClick={handleDownload}>
                    Download Stamp
                </AppButton>
            </HStack>

        </VStack>
    )
}

export default Stampify