import { Box, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Image, Text } from '@chakra-ui/react';
import { FilterArgs } from 'frontbacked-svg';


interface Transform {
    filterImage?: string | null, 
    filterArgs?: FilterArgs | null,
    setFilterArgs: (newFilterArgs: FilterArgs) => void,
    [x: string]: any
}
const Transform: React.FC<Transform> = ({ filterImage, filterArgs, setFilterArgs, ...props }) => {

    const handleRotationChange = (value: number) => {
        setFilterArgs({ ...filterArgs, rotation: value });
    };

    return (
        <Box>
            <Text as="div" mb={2}>Rotate Image</Text>
            <Image
                src={filterImage || ""}
                alt="Filter Image"
                style={{ transform: `rotate(${filterArgs?.rotation || 0}deg)` }}
                mb={4}
                {...props}
            />
            <Slider
                aria-label="rotation-slider"
                value={filterArgs?.rotation || 0}
                onChange={handleRotationChange}
                min={0}
                max={360}
            >
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
            </Slider>
        </Box>
    )
}

export default Transform