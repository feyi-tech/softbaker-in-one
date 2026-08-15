import React, { useEffect, useState } from "react"
import { DocRules, DownloadTypeProps, DownloadTypeResult, SUSCRIPTION_TYPES, Tool } from "../PayFlow/types"
import InputBox, { TYPES } from "../widgets/InputBox"
import { Box, HStack, Text, VStack } from "@chakra-ui/react"
import PleaseWaitForX from "../widgets/PleaseWaitForX"
import AppButton from "../widgets/AppButton"
import { amountFormatDefault, consoleLog, getColor } from "../../utils/f"
import { useSoftBaker } from "../SoftBakerProvider"
import { Config } from "../../theme.type"
import DrawerPop from "../widgets/DrawerPop"
interface DownloadType extends DownloadTypeProps {
    config: Config,
    onSuccess: (result: DownloadTypeResult) => void,
    onError: (error: Error) => void,
    onGetTool: (id: string) => Tool | null,
    isDarkMode?: boolean
}


const DownloadType: React.FC<DownloadType> = ({ 
    title, config,
    removeFreemiumBeforeUpdate,
    toolId,
    onGetTool,
    freeTitle, 
    freeMessage, 
    paidTitle, 
    paidMessage,
    updateMessage,
    onSuccess, onError, isDarkMode, renewSubscription,
    isFreemium
}) => {
    const [ downloadType, setDownloadType ] = useState<string>()
    const [ downloadTypeError, setDownloadTypeError ] = useState<string>()
    const [ docRules, setDocRules ] = useState<DocRules | null>()
    const { adminInfo } = useSoftBaker()

    const [ autoProcessOn, setAutoProcessOn ] = useState<boolean>(true)

    useEffect(() => {
        if(onGetTool && toolId) {
            const tool = onGetTool(toolId)
            consoleLog("DownloadType.setDocRules", tool)
            setDocRules(!tool? null : {
                ...(docRules || {}),
                allow_freemium: tool?.allow_freemium || true,
                create_price: tool?.create_price || 0,
                update_price: tool?.update_price || 0,
                create_price_is_monthly: tool?.create_price_is_monthly || false,
                yearly_price: tool?.yearly_price,
                quarterly_price: tool?.quarterly_price
            })
        }

    }, [onGetTool, toolId])

    const download = () => {
        setDownloadTypeError("")
        if(docRules && downloadType === "clean") {
            const okResult: DownloadTypeResult = {
                allow_freemium: docRules.allow_freemium,
                create_price: docRules.create_price,
                update_price: docRules.update_price,
                is_create: updateMessage? false : true,
                is_freemium: false,
                cost: docRules.create_price
            }

            if(docRules.create_price_is_monthly) okResult.subscription_type = SUSCRIPTION_TYPES.monthly
            onSuccess(okResult)
    
        } else if(docRules && downloadType === "clean_quarterly") {
            onSuccess({
                allow_freemium: docRules.allow_freemium,
                create_price: docRules.quarterly_price || 0,
                update_price: docRules.update_price,
                is_create: updateMessage? false : true,
                is_freemium: false,
                subscription_type: SUSCRIPTION_TYPES.quarterly,
                cost: docRules.quarterly_price || 0
            })
    
        } else if(docRules && downloadType === "clean_yearly") {
            onSuccess({
                allow_freemium: docRules.allow_freemium,
                create_price: docRules.yearly_price || 0,
                update_price: docRules.update_price,
                is_create: updateMessage? false : true,
                is_freemium: false,
                subscription_type: SUSCRIPTION_TYPES.yearly,
                cost: docRules.yearly_price || 0
            })
    
        } else if(docRules && downloadType === "free") {
            onSuccess({
                allow_freemium: docRules.allow_freemium,
                create_price: docRules.create_price,
                update_price: docRules.update_price,
                is_create: true,
                is_freemium: true,
                cost: 0
            })
    
        } else if(docRules && updateMessage) {
            const updatePrice = docRules.create_price_is_monthly && renewSubscription? docRules.create_price 
            : 
            docRules.allow_freemium && isFreemium? 0 : docRules.update_price
            consoleLog("DownloadType.updatePrice.1", updatePrice, "isMonth: ", docRules.create_price_is_monthly, "isRenew", renewSubscription)
            onSuccess({
                allow_freemium: docRules.allow_freemium,
                create_price: docRules.create_price,
                update_price: updatePrice,
                is_create: false,
                is_freemium: false,
                cost: updatePrice
            })

        } else {
          setDownloadTypeError("Please select a type.")
        }
    }
    
    useEffect(() => {
        setAutoProcessOn(true)
        if(docRules) {
            //If the type is to determine creation price and freemium is not allowed, 
            // return result without presenting the freemium option and the item is not subscription modeled
            if(updateMessage && removeFreemiumBeforeUpdate && docRules.create_price > 0 && !docRules.yearly_price && !docRules.quarterly_price) {
                
                consoleLog("DownloadType.setDocRules.2", docRules)
                onSuccess({
                    allow_freemium: docRules.allow_freemium,
                    create_price: docRules.create_price,
                    update_price: docRules.update_price,
                    is_create: false,
                    is_freemium: false,
                    cost: docRules.create_price
                })

            } 
            //If the type is to determine creation price and freemium is not allowed, 
            // return result without presenting the freemium option and the item is not subscription modeled
            else if(!updateMessage && !docRules.allow_freemium && !docRules.yearly_price && !docRules.quarterly_price) {
                consoleLog("DownloadType.setDocRules.3", docRules)
                onSuccess({
                    allow_freemium: docRules.allow_freemium,
                    create_price: docRules.create_price,
                    update_price: docRules.update_price,
                    is_create: true,
                    is_freemium: false,
                    cost: docRules.create_price
                })

            } 
            //If the type is to determine the creation price and the create price is 0, 
            // return result without presenting the update price's message
            else if(!updateMessage && docRules.create_price == 0) {
                consoleLog("DownloadType.setDocRules.4", docRules)
                onSuccess({
                    allow_freemium: docRules.allow_freemium,
                    create_price: docRules.create_price,
                    update_price: docRules.update_price,
                    is_create: true,
                    is_freemium: false,
                    cost: docRules.create_price
                })
            }  
            //If the type is to determine the update price and the update price is > 0, 
            // return result without presenting the update price's message
            else if(updateMessage && docRules.update_price >= 0 && !removeFreemiumBeforeUpdate && (!renewSubscription || (renewSubscription && !docRules.yearly_price && !docRules.quarterly_price))) {
                consoleLog("DownloadType.setDocRules.5", docRules)
                const updatePrice = docRules.create_price_is_monthly && renewSubscription? docRules.create_price 
                : 
                docRules.allow_freemium && isFreemium? 0 : docRules.update_price
                consoleLog("DownloadType.updatePrice.2", updatePrice, "isMonth: ", docRules.create_price_is_monthly, "isRenew", renewSubscription)
                onSuccess({
                    allow_freemium: docRules.allow_freemium,
                    create_price: docRules.create_price,
                    update_price: updatePrice,
                    is_create: false,
                    is_freemium: false,
                    cost: updatePrice
                })

            } else {
                setAutoProcessOn(false)
            }
        }
    }, [docRules])

    if(
        !toolId || !onGetTool || 
        !freeTitle || 
        !freeMessage || 
        !paidTitle || 
        !paidMessage
    ) return null

    return (
        <DrawerPop placement="bottom" bg={getColor(isDarkMode, "cardBg")} 
        height="75vh" isOpen={true} title={title} 
        onClose={() => {
            onError(new Error(""))
        }}
        footer={
            autoProcessOn || !docRules? null :
          <VStack w="100%" mt="1rem" justifyContent="flex-start" alignItems="flex-start">
            {
                downloadTypeError? 
                <Text as="div" color="rgb(246, 70, 93)" mb={2}>{ downloadTypeError }</Text>
                : null
            }
                <AppButton onClick={download}>
                    Continue
                </AppButton>
            </VStack>
        }>
            {
                //If docRuls has not been loaded
                //Or it's an update that needs freemium to be replaced with premium/paid and create price > 0
                //Or it's not an update(it's a create) but freemium is not allowed
                //Or it's not an update(it's a create) but create price is 0
                //Or it's an update but update price is 0
                //Or it's an update for subscription renewal
                /*!docRules ||*/ /*
                (updateMessage && removeFreemiumBeforeUpdate && docRules.create_price > 0) || 
                (!updateMessage && !docRules.allow_freemium) || 
                (!updateMessage && docRules.create_price == 0) || 
                (updateMessage && docRules.update_price == 0) || 
                (updateMessage && renewSubscription) || 
                (updateMessage && renewSubscription)*/

                //(!updateMessage && docRules.create_price == 0) || (updateMessage && !docRules.yearly_price && !docRules.quarterly_price)?
                autoProcessOn || !docRules?
                <PleaseWaitForX />
                :
                <>
                    {
                        updateMessage && !docRules.yearly_price && !docRules.quarterly_price?
                        <Text mb="1rem" as="div">{paidMessage.replace("{PRICE}", `$${docRules.update_price}`)}</Text>
                        :
                        <>
                            <InputBox type={TYPES.radio} value={downloadType} direction="column" 
                            errorMessage={downloadTypeError}
                                options={[
                                ...(
                                    !updateMessage?
                                    [
                                        {
                                            value: "free",
                                            title: freeTitle.replace("{PRICE}", `${amountFormatDefault(docRules.create_price, 2, 2, true)}`),
                                            desc: freeMessage.replace("{PRICE}", `${amountFormatDefault(docRules.create_price, 2, 2, true)}`)
                                        }
                                    ]
                                    :
                                    []
                                ),
                                {
                                    value: "clean",
                                    title: paidTitle.replace("{PRICE}", `${amountFormatDefault(docRules.create_price, 2, 2, true)}${docRules.create_price_is_monthly? " for 1 month" : ""}`),
                                    desc: paidMessage.replace("{PRICE}", `${amountFormatDefault(docRules.create_price, 2, 2, true)}${docRules.create_price_is_monthly? " for 1 month" : ""}`) + (docRules.create_price_is_monthly? " It can be renewed after it expires in 1 month." : "")
                                },
                                ...(
                                    docRules.create_price_is_monthly && docRules.quarterly_price && docRules.quarterly_price > 0? 
                                    [
                                        {
                                            value: "clean_quarterly",
                                            title: paidTitle.replace("{PRICE}", `${amountFormatDefault(docRules.quarterly_price, 2, 2, true)} for 3 months`),
                                            desc: paidMessage.replace("{PRICE}", `${amountFormatDefault(docRules.quarterly_price, 2, 2, true)} for 3 months`) + " It can be renewed after it expires in 3 months."
                                        }
                                    ] 
                                    : 
                                    []
                                ),
                                ...(
                                    docRules.create_price_is_monthly && docRules.yearly_price && docRules.yearly_price > 0? 
                                    [
                                        {
                                            value: "clean_yearly",
                                            title: paidTitle.replace("{PRICE}", `${amountFormatDefault(docRules.yearly_price, 2, 2, true)} for 1 year`),
                                            desc: paidMessage.replace("{PRICE}", `${amountFormatDefault(docRules.yearly_price, 2, 2, true)} for 1 year`) + " It can be renewed after it expires in 1 year."
                                        }
                                    ] 
                                    : 
                                    []
                                ) 
                            ]}
                            onOptionName={(v) => 
                            <VStack justifyContent="flex-start" alignItems="flex-start" mb="1rem">
                                <Text as="div" fontSize="1.2rem" fontWeight="bold">{v.title}</Text>
                                <Text as="div">{v.desc}</Text>
                            </VStack>}
                            
                            onOptionValue={(v) => v.value} 
                            onChange={v => {
                                setDownloadType(v)
                            }}>
                            </InputBox>
                        </>
                    }
                </>
            }
        </DrawerPop>
    )
}

export default DownloadType