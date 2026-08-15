import { Box, VStack, List, ListItem, Text } from "@chakra-ui/react";
import InputBox, { InputBoxProps } from "../../InputBox";
import React, { useState, useEffect } from "react";
import useColorValue from "@/root/src/hooks/useColorValue";

interface InputWithSuggestion extends InputBoxProps {
    textAreaData: {[x: string]: any},
    delimiter: string,
    suggestions: string[],
    onSuggestionSelected: (suggestion: string, positionInText: number, newValue: string) => void,
    [x: string]: any
}

const InputWithSuggestion: React.FC<InputWithSuggestion> = ({ textAreaData, delimiter, value, onChange, suggestions, onSuggestionSelected, ...props }) => {
    const [currentValue, setCurrentValue] = useState<string>(value || '');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [cursorPosition, setCursorPosition] = useState<number>(0);

    useEffect(() => {
        setCurrentValue(value || '');
    }, [value]);

    const handleChange = (inputValue: string, newCursorPosition: number) => {
        if(inputValue == null || inputValue == undefined) return
        setCurrentValue(inputValue);
        setCursorPosition(newCursorPosition);

        const textBeforeCursor = inputValue.slice(0, newCursorPosition);
        const lastDelimiterIndex = textBeforeCursor.lastIndexOf(delimiter);
        const afterDelimiter = inputValue.slice(lastDelimiterIndex + delimiter.length, newCursorPosition);

        const suggestionsWithDocId = ["id", ...suggestions]
        if (lastDelimiterIndex !== -1 && (/^[a-zA-Z]*$/.test(afterDelimiter) || afterDelimiter.length === 0)) {
            let newFilteredSuggestions;
            if (afterDelimiter.length === 0) {
                newFilteredSuggestions = suggestionsWithDocId;
            } else {
                newFilteredSuggestions = suggestionsWithDocId.filter(suggestion =>
                    suggestion.toLowerCase().startsWith(afterDelimiter.toLowerCase())
                );
            }
            setFilteredSuggestions(newFilteredSuggestions);
            setShowSuggestions(newFilteredSuggestions.length > 0);
        } else {
            setShowSuggestions(false);
        }
        if (onChange) onChange(inputValue);
    };

    const handleSuggestionClick = (suggestion: string) => {
        const textBeforeCursor = currentValue.slice(0, cursorPosition);
        const lastDelimiterIndex = textBeforeCursor.lastIndexOf(delimiter);
        const newValue = currentValue.slice(0, lastDelimiterIndex + delimiter.length) + suggestion + currentValue.slice(cursorPosition);
        setCurrentValue(newValue);
        setShowSuggestions(false);
        const newCursorPosition = lastDelimiterIndex + delimiter.length + suggestion.length;
        onSuggestionSelected(suggestion, lastDelimiterIndex + delimiter.length, newValue);
    };

    const handleCursorPositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const newCursorPosition = e.target.selectionStart || 0;
        handleChange(inputValue, newCursorPosition);
    };

    return (
        <Box w="100%" overflowX="hidden" {...(props as any)}>
            <InputBox
                w="100%"
                value={currentValue}
                onChange={(v: string, e: any) => handleCursorPositionChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                onClick={(e: any) => handleCursorPositionChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                onKeyUp={(e: any) => handleCursorPositionChange(e as unknown as React.ChangeEvent<HTMLInputElement>)} 
                { ...textAreaData }
            />
            {showSuggestions && (
                <VStack
                    position="absolute"
                    zIndex="5"
                    w="100%"
                    boxShadow="md"
                    borderRadius="md"
                    height="120px"
                    width="100%"
                    overflowY="auto"
                    overflowX="hidden" 
                    bg={useColorValue("dropDownBg.light", "dropDownBg.dark")}
                >
                    <List w="100%" overflowX="hidden">
                        {filteredSuggestions.map((suggestion, index) => (
                            <ListItem
                                overflowX="hidden"
                                key={index}
                                p="2"
                                cursor="pointer"
                                _hover={{
                                    border: "1px solid",
                                    borderRadius: "3px"
                                }}
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <Text as="div">{suggestion}</Text>
                            </ListItem>
                        ))}
                    </List>
                </VStack>
            )}
        </Box>
    );
};

export default InputWithSuggestion;