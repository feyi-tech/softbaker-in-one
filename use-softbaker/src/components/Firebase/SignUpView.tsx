import React, { useEffect, useState } from "react"
import { Box, HStack, Text, VStack } from "@chakra-ui/react"
import AppButton from "../widgets/AppButton"
import InputBox, { TYPES } from "../widgets/InputBox"
import { isValidEmail, nullOrEmpty } from "../../utils/f"
import Swal from 'sweetalert2'
import { User, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, updateProfile } from "firebase/auth"
import useFirebase from "."
import { Config } from "../../theme.type"


interface SignUpView {
    setUser: (user: User) => void,
    config: Config,
    onAuthDone?: (user: User) => void
}
const SignUpView: React.FC<SignUpView> = ({ onAuthDone, setUser, config, ...props }) => {
    const { auth, user, db } = useFirebase(config)

    const [fullname, setFullname] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [password2, setPassword2] = useState<string>()

    const [fullnameError, setFullnameError] = useState<string>("")
    const [emailError, setEmailError] = useState<string>()
    const [passwordError, setPasswordError] = useState<string>()
    const [passwordError2, setPasswordError2] = useState<string>()
    const [requesting, setRequesting] = useState<boolean>()

    const clearErrors = () => {
        setFullnameError("")
        setEmailError("")
        setPasswordError("")
        setPasswordError2("")
    }

    const sendRequest = (maxRetries: number, triedTimes: number) => {
      if(!auth) return
      createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        if(userCredential) {
          updateProfile(userCredential.user, {displayName: fullname})
          .then(() => {
              sendVerification(userCredential.user)
          })
          .catch(error => {
              sendVerification(userCredential.user)
          })
          
        } else {
          throw new Error("No user credentials.")
        }
      })
      .catch(async (e) => {
          let msg
          if(e.code == "auth/email-already-in-use") {
            msg = "Email already in use. Please sign in."

          } else if(e.code == "auth/invalid-verification-code") {
            msg = "The verification code is invalid."

          } else if(e.code == "auth/popup-closed-by-user") {
            msg = "Authentication cancelled."

          } else if(e.code == "auth/network-request-failed") {
            if(user) {
              //If the signup already resulted into user authentiaction, Proceed to update the user's profile.
              try {
                await updateProfile(user, {displayName: fullname})
                sendVerification(user)

              } catch(e) {
                sendVerification(user)
              }
              return
            }

            if(triedTimes + 1 < maxRetries) {
              setTimeout(() => {
                //Try to sign in first. Maybe the sign up was successful
                signInWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                  try {
                    await updateProfile(userCredential.user, {displayName: fullname})
                    sendVerification(userCredential.user)
    
                  } catch(e) {
                    sendVerification(userCredential.user)
                  }
                })
                .catch((e: any) => {
                  sendRequest(maxRetries, triedTimes + 1)
                })

              }, 2000);
              return

            } else {
              msg = "Failed to reach the server. Make sure your internet connection is stable and try again."
            }

          } else {
            msg = e.message
          }
          Swal.fire({
            icon: "error",
            text: msg
          })
          setRequesting(false)
      })
    }
    
    const handleSubmit = (e: Event) => {
        try {
          e.preventDefault()
        } catch(e) {}
        if(requesting) return
        clearErrors()
        var hasError = false
    
        //Check fullname
        if(nullOrEmpty(fullname)) {
            hasError = true
            setFullnameError("Please enter your fullname.")
      
        }

        //Check email
        if(nullOrEmpty(email)) {
          hasError = true
          setEmailError("Please enter your email address.")
    
        } else if(!isValidEmail(email)) {
          hasError = true
          setEmailError('Please enter a valid email address.')
        }
    
        //Check password and password confirmation
        if(nullOrEmpty(password)) {
          hasError = true
          setPasswordError("Please enter your password.")
    
        } else if(!/.{6,}/.test(password)) {
          hasError = true
          setPasswordError("Your password cannot be less than 6 characters.")

        } else if(nullOrEmpty(password2)) {
          hasError = true
          setPasswordError2("Re-enter password")
    
        } else if(password != password2) {
          hasError = true
          setPasswordError2("Password does not match")
        }
        
        
        if(!hasError && auth) {
          setRequesting(true)
          sendRequest(3, 0)
        }
    }

    const sendVerification = (user: User) => {
        sendEmailVerification(user, {url: location.href})
        .then(() => {
            Swal.fire({
                icon: "success",
                title: "Registration successful",
                text: `Your registration was successful. An email to verify your email address has been sent. Please check your email inbox or spam folder for the email sent.`
            })
            .then(() => {
                setUser(user)
                setRequesting(false)
                if(onAuthDone) onAuthDone(user)
            })
            .catch((e: any) => {
                setUser(user)
                setRequesting(false)
                if(onAuthDone) onAuthDone(user)
            })

        })
        .catch((e: any) => {
            Swal.fire({
                icon: "success",
                title: "Registration successful",
                text: `Your registration was successful.`
            })
            .then(() => {
                setUser(user)
                setRequesting(false)
                if(onAuthDone) onAuthDone(user)
            })
            .catch((e: any) => {
                setUser(user)
                setRequesting(false)
                if(onAuthDone) onAuthDone(user)
            })
        })
    }

    return (
        <VStack>
            <InputBox type={TYPES.text} 
                title={"Fullname"} 
                placeholder={"Enter your fullname"} 
                mb={"1rem !important"} 
                value={fullname}
                onChange={(e) => setFullname(e)}
                errorMessage={fullnameError}
            />

            <InputBox type={TYPES.email} 
            title={"Email"} 
            placeholder={"Enter your email"} 
            mb={"1rem !important"} 
            value={email}
            onChange={(e) => setEmail(e)}
            errorMessage={emailError}
            />

            <InputBox type="password" 
            title={"Password"} 
            placeholder={"Enter your password"} 
            mb={"1rem !important"}  
            value={password}
            onChange={e => {setPassword(e)}}
            errorMessage={passwordError}
            />
            <InputBox type="password" 
            title={"Confirm password"} 
            placeholder={"Re-enter password"} 
            mb={"1rem !important"}  
            value={password2}
            onChange={e => {setPassword2(e)}}
            errorMessage={passwordError2}
            />
            
            <AppButton w="100%" alignSelf="flex-start" type="submit" 
            onClick={handleSubmit} 
            disabled={requesting} fontStyle={requesting? "italic" : "normal"} 
            mt={"1rem !important"} mb={"1.5rem !important"}>
                {requesting && !nullOrEmpty(password)? "Please wait..." : "Sign up"}
            </AppButton>
        </VStack>
    )

}

export default SignUpView