import { Box, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import useDraggableScroll from "use-draggable-scroll";
import Quote from "../Quote";

interface DocContainerProps {
  children: React.ReactNode,
  message?: string,
  disableDrag?: boolean,
  [x: string]: any
}

const DocContainer: React.FC<DocContainerProps> = ({ children, message, disableDrag, ...props }) => {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [mouseDownPos, setMouseDownPos] = useState<number | null>(null);

    const { onMouseDown } = useDraggableScroll(scrollContainerRef);

    const handleScroll = (prevY: number, currentY: number) => {
        if (!scrollContainerRef.current || prevY == currentY) return;

        const container = scrollContainerRef.current;

        const amount = Math.abs(currentY - prevY)
        // Check if the user has reached the top
        if (container.scrollTop === 0) {
            // Scroll the parent element up
            const formContainer = document.getElementById("form-container");
            if (formContainer) {
                formContainer.scrollTop -= amount; // Adjust the value based on the desired scrolling speed
            }
        }

        // Check if the user has reached the bottom
        const isAtBottom = container.scrollTop >= container.scrollHeight - container.clientHeight;

        if (isAtBottom) {
            //console.log('Reached the bottom');
            // Optionally, scroll the parent element down
            const formContainer = document.getElementById("form-container");
            if (formContainer) {
                formContainer.scrollTop += amount; // Adjust the value based on the desired scrolling speed
            }
        }
    }

    const handleMouseDown = (ev: React.MouseEvent<HTMLDivElement>) => {
        setMouseDownPos(ev.pageY)
    }
    const handleMouseUp = (ev: React.MouseEvent<HTMLDivElement>) => {
        if(disableDrag) return
        if(mouseDownPos) {
            handleScroll(mouseDownPos, ev.pageY)
        }
    }

    return (
        <Box {...props} overflow="auto" ref={scrollContainerRef} p="2rem" 
        onMouseDown={(ev) => {
            if(disableDrag) return
            onMouseDown(ev);
            handleMouseDown(ev);
        }}
        onMouseUp={handleMouseUp}>
            {children}
            <Quote as="div" status="info" fontWeight="700" maxW="80vw">
                <Text as="span">
                    {message || "Drag around to view the whole document"}
                </Text>
            </Quote>
        </Box>
    );
};

export default DocContainer;
