import React, { useEffect, useState } from 'react';
import { CssActions, Font, FontsMap, createFontThumbnail, getIdentifier, parseValueUnit } from "frontbacked-svg";
import UploadInput, { UploadInput as UploadInputProps } from '@/root/src/components/widgets/ToolsElements/UploadInput';
import { getExt } from '@/root/src/utils/fileutils';
import InputBox from '@/root/src/components/widgets/InputBox';
import { HStack, Spinner, Text, VStack } from '@chakra-ui/react';

interface FontsInputProps {
    isLoading?: boolean;
    fonts?: FontsMap | null;
    cssActions?: CssActions | null;
    onCssActionsChanged: (cssActions: CssActions) => void;
    onFontsChanged: (fonts: FontsMap) => void;
}

interface FontUploadInput extends UploadInputProps {
    fontData: Font
}

interface FontSpacingInputProps {
    fontData: Font;
    cssActions?: CssActions | null;
    onChanged: (cssActions: CssActions) => void;
    [x: string]: any;
}

const FontUploadInput: React.FC<FontUploadInput> = ({ onChange, fontData, ...props }) => {
    const [ thumb, setThumb ] = useState<string>()

    useEffect(() => {

        if(fontData.dataUrl) {
            //console.log("FontUploadInput:thumb ", fontData.dataUrl, fontData.ext, fontData)
        }
        if(fontData.dataUrl && fontData.ext) {
            createFontThumbnail(fontData.dataUrl, fontData.ext)
            .then(dataUrl => {
                setThumb(dataUrl)
                //console.log("FontUploadInput:thumb", fontData.id, dataUrl)

            })
            .catch(e => {
                //console.log("FontUploadInput:thumb.e", e.message)

            })
        }

    }, [fontData])

    return (
        <UploadInput 
            thumbnail={thumb}
            isOtherFiles={true}
            accept={`font/*`}
            onThumb={async (file, dataUrl) => {
                if(!dataUrl || !file) {
                    return null

                } else {
                    return createFontThumbnail(dataUrl, getExt(file.name))
                }
            }}
            onChange={(file, base64String, thumbnail) => {
                setThumb(thumbnail as string)
                onChange(file, base64String, thumbnail)
            }}
            {...props} 
        />
    )

}

const LETTER_SPACING_UNITS: { [x: string]: string } = {
    psd: "Photoshop Unit",
    em: "em Unit"
}

const FontSpacingInput: React.FC<FontSpacingInputProps> = ({ fontData, cssActions, onChanged, ...props }) => {

    const [ spacing, setSpacing ] = useState<string>()
    const [ spacingUnit, setSpacingUnit ] = useState<string>()

    const [ spacingError, setSpacingError ] = useState<string>()
    const [ spacingUnitError, setSpacingUnitError ] = useState<string>()

    useEffect(() => {
        //console.log("parsedSvg:cssActions ", cssActions)
        const letterSpacingDeclarations = (cssActions?.if_property_and_value || {})[getIdentifier("font-family", fontData.name)]?.declarations
        if(letterSpacingDeclarations) {
            for(const declaration of letterSpacingDeclarations) {
                if(declaration.property == 'letter-spacing') {
                    const { value, unit } = parseValueUnit(declaration.value)
                    if(value && unit && Object.keys(LETTER_SPACING_UNITS).includes(unit)) {
                        if(!spacing) setSpacing(value)
                        if(!spacingUnit) setSpacingUnit(unit)
                    }
                }
            }
        }
    }, [ cssActions] )

    useEffect(() => {
        if(spacing) handleValueChange(spacing)

    }, [spacing])

    useEffect(() => {
        if(spacingUnit) handleUnitChange(spacingUnit)

    }, [spacingUnit])

    const handleValueChange = (value: string) => {
        setSpacingError("")
        //console.log("parsedSvg.handleValueChange: ", value, spacingUnit)
        if(!value || !spacingUnit) return
        try {
            if(isNaN(Number(value.trim()))) {
                setSpacingError("Enter a valid number")
                return
            }

        } catch(e) {
            return
        }
        const actions = { ...cssActions }
        actions.if_property_and_value = cssActions?.if_property || {}
        actions.if_property_and_value[`${getIdentifier("font-family", fontData.name)}`] = {
            declarations: [
                { property: 'letter-spacing', value: `${value.trim()}${spacingUnit}` }
            ]
        }

        onChanged(actions)
    }

    const handleUnitChange = (unit: string) => {
        setSpacingUnitError("")
        //console.log("parsedSvg.handleUnitChange: ", unit, spacing)
        if(!unit || !spacing) return
        const actions = { ...cssActions }
        actions.if_property_and_value = cssActions?.if_property || {}
        actions.if_property_and_value[`${getIdentifier("font-family", fontData.name)}`] = {
            declarations: [
                { property: 'letter-spacing', value: `${spacing}${unit}` }
            ]
        }

        onChanged(actions)
    }

    return (
        <HStack w="100%" justifyContent="space-between" alignItems="center"  {...props}>
            <InputBox
                key={`${fontData.id}_spacing_value`} // Assuming font has an id property
                width="60%"
                type={InputBox.TYPES.text}
                value={spacing}
                onChange={setSpacing}
                id={`${fontData.name}_letter_spacing`}
                title={`${fontData.name} Letter Spacing`}
                helperText={`Adjust the letter spacing of the font here.`}
                info={`This is where you adjust the letter spacing of the font.`}
                errorMessage={spacingError}
            />
            <InputBox
                key={`${fontData.id}_spacing_unit`} // Assuming font has an id property
                width="40%"
                type={InputBox.TYPES.select}
                options={Object.keys(LETTER_SPACING_UNITS)}
                onOptionValue={(key: string) => key}
                onOptionName={(key: string) => LETTER_SPACING_UNITS[key]}
                value={spacingUnit}
                onChange={setSpacingUnit}
                id={`${fontData.name}_letter_spacing_unit`}
                title={`${fontData.name} Letter Spacing Unit`}
                helperText={`Set the letter spacing uinit here.`}
                info={`This is where you set the letter spacing unit.`}
                errorMessage={spacingUnitError}
            />
        </HStack>
    );
}

const FontsInput: React.FC<FontsInputProps> = ({ isLoading, fonts, onFontsChanged, cssActions, onCssActionsChanged }) => {

    useEffect(() => {
        //console.info("FontsInput:fonts ", fonts)
    }, [ fonts ])

    useEffect(() => {
        //console.log("parsedSvg:cssActions ", cssActions)
    }, [ cssActions] )

    return (
        <>
            {
                isLoading?
                <VStack>
                    <Spinner />
                    <Text as="div" fontStyle="italic">Loading fonts...</Text>
                </VStack> 
                : !fonts? null :
                Object.values(fonts || {}).filter(font => true/*font.url == undefined || font.url == null*/).map((font) => (
                    <>
                        <FontUploadInput
                            mb={2}
                            key={font.id} // Assuming font has an id property
                            width="100%"
                            fontData={font}
                            onChange={(file, base64String) => {
                                if (base64String && file) {
                                    onFontsChanged({...fonts, [font.id]: {
                                        ...(fonts[font.id] || {}), file, dataUrl: base64String, ext: getExt(file.name)
                                    }})
                                }
                            }}
                            id={font.name}
                            disabled={font.url != undefined && font.url != null}
                            title={`${font.name} Font`}
                            helperText={font.url? `${font.name} font already upload.` : `Upload the ${font.name} font here.`}
                            info={`This is where you upload the ${font.name} font.`}
                            message={`Drag and Drop the ${font.name} font file here`}
                            hoverMessage={`Drop the font file here`}
                            ruleMessage={`Make sure you're uploading a font file.`}
                            useImageText={`Use Font`}
                        />
                        <FontSpacingInput fontData={font} cssActions={cssActions} onChanged={onCssActionsChanged} mb={4} />
                    </>
                ))
            }
        </>
    );
}

export default FontsInput;