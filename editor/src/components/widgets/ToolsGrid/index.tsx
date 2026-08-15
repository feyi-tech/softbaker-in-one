import React, { useState } from "react";
import { Box, Heading, Image, Text, VStack, Alert, AlertIcon, HStack, SimpleGrid } from "@chakra-ui/react";
import "react-horizontal-scrolling-menu/dist/styles.css";
import { useTools, DynamicTemplate, StaticTool } from "use-frontbacked";
import { IconFromId } from "../ToolsElements/IconSelector";
import { FaChevronUp, FaEye, FaEyeSlash } from "react-icons/fa";
import ToolDivider from "./ToolDivider";
import useColorValue from "@/root/src/hooks/useColorValue";
import Loading from "../Loading";
import CuteButton from "../CuteButton";
import { R2_DOMAIN, USE_FRONTBACKED_CONFIG } from "@/root/src/app-config";
import { setR2Host } from "frontbacked-svg";


interface LinkOrBox {
    href?: string | null,
    as?: any,
    children: any,
    [x: string]: any
}
const trackingToolsId = ["PE2U7P6L77EALVDK69OE", "0QZLQQKVTRV3Q6SFAIEA"]
const LinkOrBox: React.FC<LinkOrBox> = ({ href, as, children, ...props }) => {
    return (
        <>
        {
            href?
            <Box as="a" href={href} {...props}>{children}</Box>
            :
            <Box as={as || "div"} {...props}>{children}</Box>
        }
        </>
    )
}

const ITEMS_PER_GRID = 4

interface ToolsGrid {
    toolId?: string | null, 
    templateId?: string | null,
    hideJumper?: boolean
}
const ToolsGrid: React.FC<ToolsGrid> = ({ hideJumper, toolId, templateId }) => {
  const { tools, loading, error } = useTools(USE_FRONTBACKED_CONFIG);
  const colorAcent = useColorValue("colorAccent.light", "colorAccent.dark")
  const [showAll, setShowAll] = useState<{[x: string]: boolean}>({})

  const toggleShowAll = (toolId: string) => {
    setShowAll({
        ...showAll,
        [toolId]: !showAll[toolId]
    })
  }

  function removeFirstWord(text: string) {
    const words = text.split(/\s+/); // Split by whitespace
    return words.length > 1 ? words.slice(1).join(" ") : text;
  }

    const handleJump = () => {
        const target = document.getElementById("toolsGridTop");
        console.log("target:", target);
        if (target) {
            console.log("target:willCallScroll", target.offsetTop);
            
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };
  

  if (loading) {
    return (
        <VStack w="100%" alignItems="center">
            <Loading
                style={{display: "inline !important"}}
                width={"70px"}
                height={"70px"}
                color={colorAcent}
                type={Loading.TYPES.threeDots} 
            />
            <Text fontStyle="italic" fontWeight="600">Loading tools. Please wait...</Text>
        </VStack>
    )
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch" p={4}>
        <Box id="toolsGridTop"></Box>
        {(tools || []).map((tool) => (
            <>
                <Box key={tool.id} 
                opacity={tool.isActive === false? 0.3 : 1}
                cursor={tool.isActive === false? "not-allowed" : "pointer"}
                _hover={{ opacity: tool.isActive === false? 0.3 : 1 }}>

                <LinkOrBox as={Heading} lineHeight="1.2" fontSize="1.25rem" mb={3} fontWeight="bold" display="block"
                    href={tool.isActive === false? null : tool.is_static? (tool as StaticTool).siteUrl : `/tool-viewer/?id=${tool.id}`} size="md">
                    <HStack justifyContent="flex-start" alignItems="center">
                        {tool.icon? <IconFromId id={tool.icon} /> : null }{" "}
                        <Text as="div">{tool.name}{tool.isActive === false? `(Comming Soon)` : trackingToolsId.includes(tool.id)? " With Tracking Website" : null}</Text>
                        {
                            !trackingToolsId.includes(tool.id) && !tool.is_static?
                            <Text>({tool.templates.length}+ Types)</Text> 
                            : null
                        }
                    </HStack>
                </LinkOrBox>
                {
                    tool.is_static?
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 4 }} spacing={4}>
                        <LinkOrBox borderRadius="md" border={`3px ridge ${colorAcent}`} 
                            href={tool.isActive === false? null : (tool as StaticTool).siteUrl} display="flex" alignItems="center" flexDirection="column" 
                            cursor={tool.isActive === false? "not-allowed" : "pointer"}
                            key={tool.id}
                            width="100%"
                            mx={2}
                            _hover={tool.isActive === false? {} : { transform: "scale(1.05)", transition: "0.3s" }} pt="10px"
                        >
                            <Image
                                src={(tool as StaticTool).siteLogoUrl? setR2Host((tool as StaticTool).siteLogoUrl as any, R2_DOMAIN) : "https://via.placeholder.com/120"}
                                alt={tool.name}
                                boxSize="220px"
                                borderRadius="md"
                                objectFit="cover"
                            />
                            <Text fontSize="sm" fontWeight="bold" mt={2} noOfLines={1}>
                                {tool.name}
                            </Text>
                        </LinkOrBox>
                    </SimpleGrid>
                    :
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 4 }} spacing={4}>
                        {
                            [...tool.templates, {id: `${tool.id}-other-item-placeholder`} as DynamicTemplate]
                            .slice(0, showAll[tool.id]? tool.templates.length + 1 : ITEMS_PER_GRID)
                            .map((template) => (
                        <>
                            {
                                template.id != `${tool.id}-other-item-placeholder`?
                                <VStack borderRadius="md" border={`3px ridge ${colorAcent}`} as="a" 
                                href={`/tool-viewer/?id=${tool.id}&tp=${template.id}`} display="flex" alignItems="center" flexDirection="column"
                                    key={template.id}
                                    width="100%"
                                    mx={2}

                                    _hover={{ transform: "scale(1.05)", transition: "0.3s" }} pt="10px"
                                >
                                    <Image
                                    src={template.thumbnail? setR2Host(template.thumbnail as any, R2_DOMAIN) :  "https://via.placeholder.com/120"}
                                    alt={template.name}
                                    boxSize="220px"
                                    borderRadius="md"
                                    objectFit="cover"
                                    />
                                    <Text fontSize="sm" fontWeight="bold" mt={2} noOfLines={1}>
                                        {template.name}
                                    </Text>
                                </VStack>
                                :
                                trackingToolsId.includes(tool.id)? null : 
                                <VStack borderRadius="md" border={`3px ridge ${colorAcent}`} as="a" 
                                href={`/tool-viewer/?id=${tool.id}`} display="flex" alignItems="center" flexDirection="column"
                                    key={template.id}
                                    width="100%"
                                    mx={2}

                                    _hover={{ transform: "scale(1.05)", transition: "0.3s" }} pt="10px"
                                >
                                    <HStack 
                                        w="100%" h="220px" justifyContent="center" alignItems="center" color="#fff" 
                                        borderRadius="md" bg={colorAcent}>
                                        <Text fontWeight="bold" fontSize="1.1rem" textAlign="center">
                                            Other {tool.name}
                                        </Text>
                                    </HStack>
                                    <Text fontSize="sm" fontWeight="bold" mt={2} noOfLines={1}>
                                        Other {tool.name}
                                    </Text>
                                </VStack>
                            }
                        </>
                        ))}
                    </SimpleGrid>
                }
                
                {!tool.is_static && tool.templates.length > ITEMS_PER_GRID && (
                    <CuteButton bg={colorAcent} onClick={() => toggleShowAll(tool.id)} mt={4} leftIcon={showAll[tool.id]? <FaEye /> : <FaEyeSlash />}>
                        {showAll[tool.id] ? "Show Less" : `Show The Remaining ${tool.templates.length - ITEMS_PER_GRID} ${removeFirstWord(tool.name)}`}
                    </CuteButton>
                )}
                </Box>
                <ToolDivider my={1} />
            </>
        ))}
        {
            !hideJumper?
            <HStack cursor="pointer" onClick={handleJump} borderRadius="50%" justifyContent="center" alignItems="center"
            pos="fixed" 
            right={{base: "20px", md: "40px"}} 
            bottom="25px" 
            zIndex="50" 
            w={{base: "40px", md: "60px"}} 
            h={{base: "40px", md: "60px"}}
            bg={colorAcent} color="white" 
            boxShadow="0 4px 29px 0 rgba(0, 0, 0, 0.3)" 
            transition="background-color 200ms ease">
                <FaChevronUp />
            </HStack>
            : null
        }
    </VStack>
  );
};

export default ToolsGrid;