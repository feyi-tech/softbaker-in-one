import { Box, HStack } from "@chakra-ui/react";
import React from "react";
import { FaTools } from "react-icons/fa";

interface ToolDivider {
    [x: string]: any
}
//#676B79 #dcdcdc 
const ToolDivider: React.FC<ToolDivider> = ({...props}) => {
    return (
        <HStack width="100%" align="center" spacing={4} {...props}>
            <Box flex="1" height="2px" bg="gray.300" />
            <HStack justifyContent="center">
                <FaTools size={24} /><FaTools size={24} /><FaTools size={24} />
            </HStack>
            <Box flex="1" height="2px" bg="gray.300" />
        </HStack>
    );
};

export default ToolDivider;
