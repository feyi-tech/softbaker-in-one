import { VStack } from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'
import InputBox, { TYPES } from '../widgets/InputBox'
import AppButton from '../widgets/AppButton'
import { FaChevronRight, FaCoins, FaExclamationTriangle } from 'react-icons/fa'
import { SDK_NAME } from '../../utils/c'
import { consoleLog } from '../../utils/f'
import { Box } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import { HStack } from '@chakra-ui/react'
import { Vendor } from './types'

interface AmountEditor {
    amount: number,
    minAmount: number,
    vendors?: Vendor[] | null,
    onAmountValid: (amount: number) => void,
    onSubmit: () => void
}

const BONUSES = [
    {
        min: 50, max: 99, bonusPct: 10, icon: <FaCoins size="1rem" />, color: "#55af79"
    },
    {
        min: 100, max: 199, bonusPct: 15, icon: <FaCoins size="1rem" />, color: "#1E90FF"
    },
    {
        min: 200, max: 499, bonusPct: 20, icon: <FaCoins size="1rem" />, color: "#f858ae"
    },
    {
        min: 500, max: 999, bonusPct: 30, icon: <FaCoins size="1rem" />, color: "#FF7043"
    },
    {
        min: 1000, max: Infinity, bonusPct: 40, icon: <FaCoins size="1rem" />, color: "#c8c80b"
    }
]

interface VendorsWarningProps {
    vendors?: Vendor[] | null
}

export const VendorsWarining: React.FC<VendorsWarningProps> = ({ vendors }) => (
    <>
        {
            vendors?
            <Box>
                <HStack justifyContent="flex-start" alignItems="center" fontSize="0.9rem" color={"#FF2300"}>
                    <FaExclamationTriangle size="1rem" />
                    <Text as="div">To avoid losing your deposits, only trade with the following softbaker approved vendors on whatsapp when paying with Naira.</Text>
                </HStack>
                <Text as="div">
                    {
                        vendors.map(v => v.number).join(" or ")
                    }
                </Text>
            </Box>
            : null
        }
    </>
)

interface Bonus {
    vendors?: Vendor[] | null,
    min: number, max: number, bonusPct: number, icon: any, [x: string]: any
}
const Bonus: React.FC<Bonus> = ({ vendors, min, max, bonusPct, icon, color, ...props }) => {

    
    if(max != Infinity) {
        return (
            <HStack justifyContent="flex-start" alignItems="center" fontSize="0.8rem" color={color} {...props}>
                {icon}
                <Text as="div">Deposit ${min} to ${max} and get +{bonusPct}% extra credits.</Text>
            </HStack>
        )

    } else {
        return (
            <HStack justifyContent="flex-start" alignItems="center" fontSize="0.8rem" color={color} {...props}>
                {icon}
                <Text as="div">Deposit ${min} and above, and get +{bonusPct}% extra credits.</Text>
            </HStack>
        )
    }
}

const AmountEditor: React.FC<AmountEditor> = ({ vendors, amount, minAmount, onAmountValid, onSubmit }) => {
    const [a, setA] = useState<number>(amount || 0)
    const [e, setE] = useState<string>()
    
    const [ helperText, setHelperText ] = useState<string>(`The minimum deposit amount is $${minAmount}.`)
    
    const getBonusText = (amount: number, bonusPct: number) => {
        const bonus = ((amount * bonusPct) / 100)
        return `You will get $${bonus.toFixed(2)} extra credits(+${bonusPct}%). Expected total credits you will receive is $${(amount + bonus).toFixed(2)}.`
    }
    
    /*
    useEffect(() => {
        if(a < minAmount) {
            setHelperText(`The minimum deposit amount is $${minAmount}. The higher your deposits, the higher the extra credits you get.`)

        } else if(a < 50) {
            setHelperText(`You will get $${a} credits. No extra credits on deposits less than $50.`)

        } else if(a >= 50 && a < 100) {
            setHelperText(getBonusText(a, 10))

        } else if(a >= 100 && a < 200) {
            setHelperText(getBonusText(a, 15))

        } else if(a >= 200 && a < 500) {
            setHelperText(getBonusText(a, 20))
            
        } else if(a >= 500 && a < 1000) {
            setHelperText(getBonusText(a, 30))
            
        } else if(a >= 1000) {
            setHelperText(getBonusText(a, 40))
        }
    }, [a])*/

    const validate = useCallback((amount: number, showError: boolean) => {
        setE("")
        if(!amount) {
            if(showError) setE("Enter an amount in dollar to deposit.")
            return false
        }
        if(amount < minAmount) {
            if(showError) setE(`The amount to deposit cannot be less than $${minAmount}`)
            return false
        }
        return true
    }, [])

    const handleChange = useCallback((amt: number) => {
        consoleLog(`${SDK_NAME}:/AmountEditor.handleChange.amount => amt: `, amt, " | amount: ", amount, " a: ", a)
        setA(amt)
        if(validate(amt, true)) onAmountValid(amt)
    }, [])

    const handleSubmit = useCallback(() => {
        if(validate(a, true)) onSubmit()
    }, [a])

    return (
        <VStack p="1rem !important" w="100%" h="68vh" justifyContent="flex-start" alignItems="center">
            <InputBox zIndex="10"
                id={`${SDK_NAME}_depositAmount`}
                key={`${SDK_NAME}_depositAmount`}
                name="depositAmount"
                title="Deposit Amount" 
                helperText={helperText} 
                value={a} type={TYPES.number} 
                numberDecimals={0}
                numberUnit={`$`} 
                mb={4} 
                onChange={handleChange} 
                errorMessage={e}
            />
            <Box fontWeight="700" mb={2}>
            <VendorsWarining vendors={vendors} />
            {/*
                BONUSES.map((bonus, index) => (
                    <Bonus key={index} 
                    vendors={vendors}
                    min={bonus.min} max={bonus.max} 
                    bonusPct={bonus.bonusPct} 
                    icon={bonus.icon} 
                    color={bonus.color} mb={1} 
                    cursor="pointer"
                    onClick={() => {
                        handleChange(bonus.min)
                    }} />
                ))*/
            }
            </Box>
            <AppButton alignSelf="flex-start" onClick={handleSubmit} rightIcon={<FaChevronRight />}>
                Next
            </AppButton>
        </VStack>
    )
}

export default AmountEditor