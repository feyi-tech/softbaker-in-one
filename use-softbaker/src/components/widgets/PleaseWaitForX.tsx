import { HStack } from '@chakra-ui/react'
import React from 'react'
import Loading from './Loading'

const PleaseWaitForX = () => {
    return (
        <HStack display="flex" w="100%" h="120px" justifyContent="center" alignItems="center" pos="relative" p="2rem">
            <Loading color="green.500" type={Loading.TYPES.RotatingLines} />
        </HStack>
    )
}

export default PleaseWaitForX