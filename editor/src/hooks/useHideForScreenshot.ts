import { useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { copyFromText } from '../utils/f';

const useCaptureAndDownload = (className: string): void => {
    const toast = useToast()
    useEffect(() => {
        // Function to hide elements with the specified class
        const hideElements = (): void => {
            const elements = document.querySelectorAll<HTMLElement>(className);
            elements.forEach(element => {
                element.style.visibility = 'hidden';
            });
        };

        // Function to show elements again
        const showElements = (): void => {
            const elements = document.querySelectorAll<HTMLElement>(className);
            elements.forEach(element => {
                element.style.visibility = 'visible';
            });
        };

        // Function to show elements again
        const elementsVisible = (): boolean => {
            const elements = document.querySelectorAll<HTMLElement>(className);
            return elements[0] && elements[0].style.visibility !== "hidden"
        };

        const keyHandler = (e: KeyboardEvent): void => {
            if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p')) {
                if(elementsVisible()) {
                    e.preventDefault(); // Prevent default print behavior
                    copyFromText(".")
                    try {
                        e.cancelBubble = true;
                        e.stopImmediatePropagation();

                    } catch(err) {}

                    hideElements()
                    toast({
                        description: "Screenshot not taken. Try again.",
                        status: "error",
                        duration: 4000,
                        isClosable: true
                    })

                } else {
                    setTimeout(() => {
                        showElements()
                    }, 200);
                }
            }
            };

            // Add keyup event listener
            window.addEventListener('keyup', keyHandler);

            return () => {
            window.removeEventListener('keyup', keyHandler);
        };
    }, [className]); // Dependency array ensures the effect runs when the className changes
};

export default useCaptureAndDownload;