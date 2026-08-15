import React, { useState } from 'react'
import { User } from 'firebase/auth'
import DrawerPop from '../widgets/DrawerPop'
import { Box, Image, Text, VStack } from "@chakra-ui/react"
import SignInView from "./SignInView"
import SignUpView from "./SignUpView"
import { LOGO_PATH } from '../../utils/c'
import Link from '../widgets/Link'
import { Config } from '../../theme.type'

interface AuthView {
    show: boolean,
    setUser: (user: User) => void,
    signInTitle: string, 
    signUpTitle: string,
    onSuccess: (user: User) => void,
    onError: (error: any) => void,
    config: Config,
    isDarkMode?: boolean
}
const AuthView: React.FC<any> = ({ show, signInTitle, signUpTitle, onSuccess, onError, isDarkMode, setUser, config }) => {
    const [showSignIn, setShowSignIn] = useState<boolean>(true)

    const handleAuthLinkClick = (e: any) => {
        e.preventDefault()
        setShowSignIn(!showSignIn)
    }

    if(!show) return null
    return (
        <DrawerPop title={`${config?.appName} Authentication`} 
          isOpen={true} onClose={() => {
            onError(new Error(""))
          }} placement="bottom" height="95vh" bg="#012 !important" color="#fff !important">
            <Box minH="60vh" w="100%" maxW="700px" 
                p={{base: "15px 15px", md: "50px 80px"}} m="15px auto">
                {
                    showSignIn? 
                    <>
                        <VStack w="100%" justifyContent="flex-start" alignItems="center">
                            <Image src={LOGO_PATH} h="48px" w="auto" />
                            <Text as="div" fontSize="14px" mb="0.1rem !important" textAlign="center">
                                {signInTitle}
                            </Text>
                            <Text as="div" fontSize="14px" mb="1.5rem !important" textAlign="center">
                                If you don't have an account yet, <Link color="green.500" textDecoration="underline" onClick={handleAuthLinkClick} fontWeight="bold">Sign up here.</Link>
                            </Text>
                        </VStack>
                        <SignInView onAuthDone={onSuccess} setUser={setUser} config={config} /> 
                    </>
                    : 
                    <>
                        <VStack w="100%" justifyContent="flex-start" alignItems="center">
                            <Image src={LOGO_PATH} h="48px" w="auto" />
                            <Text as="div" fontSize="14px" mb="0.1rem !important" textAlign="center">
                                {signUpTitle}
                            </Text>
                            <Text as="div" fontSize="14px" mb="1.5rem !important" textAlign="center">
                                If you already have an account, <Link color="green.500" textDecoration="underline" onClick={handleAuthLinkClick} fontWeight="bold">Sign in here.</Link>
                            </Text>
                        </VStack>
                        <SignUpView onAuthDone={onSuccess} setUser={setUser} config={config} /> 
                    </>
                }
                <Text as="div" textAlign="center" fontSize="14px">
                    {
                        showSignIn?
                        <>Don't have an account yet? <Link color="green.500" textDecoration="underline" onClick={handleAuthLinkClick}>Sign up here.</Link></>
                        :
                        <>Already have an account? <Link color="green.500" textDecoration="underline" onClick={handleAuthLinkClick}>Log in here.</Link></>
                    }
                </Text>
            </Box>
        </DrawerPop>
    )
}

export default AuthView