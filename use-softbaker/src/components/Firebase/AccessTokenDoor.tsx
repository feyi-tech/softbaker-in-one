import React, { ChangeEvent, useState } from 'react'
import { consoleLog, getColor, rejectPromise, resolvePromise } from '../../utils/f'
import { PROMISE_ID, SDK_NAME, STORAGE_KEYS } from '../../utils/c'
import { User, signInWithEmailAndPassword } from 'firebase/auth'
import useFirebase from '.'
import ModalPop from '../widgets/ModalPop'
import { VStack } from '@chakra-ui/react'
import InputBox, { TYPES } from '../widgets/InputBox'
import AppButton from '../widgets/AppButton'
import { FaSignInAlt } from 'react-icons/fa'
import { Config } from '../../theme.type'

interface AccessTokenDoor {
    show: boolean,
    onSuccess: (accessToken: string, User: User) => void,
    onError: (error: any) => void,
    config: Config,
    isDarkMode?: boolean
}
const AccessTokenDoor: React.FC<any> = ({ show, onSuccess, onError, isDarkMode, config }) => {
    const { auth, user, setUser } = useFirebase(config)
    const [password, setPassword] = useState<string>()
    const [ e, setE ] = useState<string>()
    const [ authenticating, setAuthenticating ] = useState<boolean>(false)

    const handleSubmit = () => {
        setE("")
        if(!password) {
            setE("Please enter your password")

        } else if(auth && user && user.email && password && password.length > 0) {
            setAuthenticating(true)
            signInWithEmailAndPassword(auth, user.email, password)
            .then(auntentication => {
                const user = auntentication.user as User
                if(user) {
                    setUser(user)
                    user.getIdToken()
                    .then(token => {
                        localStorage.setItem(STORAGE_KEYS.LAST_LOGIN_MILLI, `${Date.now()}`)
                        onSuccess(token, user)
                    })
                    .catch(e => {
                        onError(e)
                    })

                } else {
                    setE("Failed to sign in. Please try again later.")
                    setAuthenticating(false)
                }
            })
            .catch((e: any) => {
                let msg
                if(e.code == "auth/wrong-password") {
                    msg = "Wrong email address or password. Check your email address and password, then try again."

                } else if(e.code == 'auth/user-not-found') {
                    msg = "Wrong email address or password. Check your email address and password, then try again."

                } else {
                    msg = e.message
                }
                setE(msg)
                setAuthenticating(false)
            })
        } else {
            consoleLog(
                "AccessTokenDoor.handleSubmit => ", "auth:", auth, 
                " | user:", user, " | userEmail:", user?.email, " | password:", password, " | config", config
            )
        }
    }

    if(!show) return null
    return (
        <ModalPop bg={getColor(isDarkMode, "cardBg")} title={"Confirm Operation"} isOpen={true} onClose={() => {
            onError(new Error("Failed to confirm that it's you."))
        }}>
            <VStack p="1rem !important" w="100%" h="68vh" justifyContent="flex-start" alignItems="center">
                <InputBox zIndex="10"
                    id={`${SDK_NAME}_pass_confirm`}
                    key={`${SDK_NAME}_pass_confirm`}
                    name="pass_confirm"
                    title="Enter Password" 
                    helperText={`Enter your password to confirm that it's you.`} 
                    value={password} type={TYPES.password} 
                    mb={4} 
                    onChange={(password) => {
                        setPassword(password)
                    }} 
                    errorMessage={e}
                />
                <AppButton alignSelf="flex-start" onClick={handleSubmit} rightIcon={<FaSignInAlt />} 
                disabled={authenticating} fontStyle={authenticating? "italic" : "normal"}>
                    {authenticating? "Please wait..." : "Confirm Operation"}
                </AppButton>
            </VStack>
        </ModalPop>
    )
}

export default AccessTokenDoor