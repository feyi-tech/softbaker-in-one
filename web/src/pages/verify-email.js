import { Box, Text, useColorModeValue } from '@chakra-ui/react'
import { applyActionCode, confirmPasswordReset } from "firebase/auth";
import AppContainer from '../components/widgets/AppContainer'
import AppPageBody from '@/components/pages/AppPageBody'
import Section from '../components/widgets/Section'
import AppButton from '../components/widgets/AppButton'
import InputBox from "@/compos/widgets/InputBox"
import Card from "@/compos/widgets/Card"
import { APP_DESCRIPTION, APP_NAME, URL_BASE } from '../app-config'
import Swal from 'sweetalert2'
import { useEffect, useState } from 'react'
import { useSoftBaker } from 'use-softbaker';
import { useRouter } from 'next/router'
import { nullOrEmpty } from '../utils/f'
import useUrlQuery from '../hooks/useUrlQuery';
import Loading from '../components/widgets/Loading';


const EmailVerify = () => {
  const { auth } = useSoftBaker()

  const router = useRouter()
  const query = useUrlQuery()
  
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  
  const [passwordError, setPasswordError] = useState()
  const [passwordConfirmError, setPasswordConfirmError] = useState()
  const [requesting, setRequesting] = useState()
  const [verified, setVerified] = useState()

  const nextUrl = (fallbackUrl = "/") => {
    var url = query?.continueUrl
    if(url) return decodeURI(url)
    return fallbackUrl
  }

  useEffect(() => {
    //console.log("query!oobCode::", query)
    if(auth && query && !query.oobCode) {
      Swal.fire({
        icon: "error",
        text: "Invalid verification link!"
      })
      .then((confirm) => {
        if(confirm.isConfirmed) {
          router.replace(nextUrl())
        }
      })

    } else if(auth && query && query.oobCode && query.mode == "verifyEmail" && !verified && !requesting) {
      verifyMail()
    }
  }, [query, auth])

  const clearErrors = () => {
    setPasswordError("")
    setPasswordConfirmError("")
  }

  const verifyMail = e => {
    setRequesting(true)
    applyActionCode(auth, query.oobCode)
    .then(r => {
      //console.log("Error:EmailVerify.r", r)
      setVerified(true)
      Swal.fire({
        icon: "success",
        text: "Email address verified successfully."
      })
      .then(() => {
        router.replace(nextUrl())
      })
    })
    .catch((e) => {
      let msg;
      var redirect = nextUrl()
      if(e.code == "auth/expired-action-code") {
        msg = "The email address verification link has expired. Sign In to your dashboard to request a new verification link."

      } if(e.code == "auth/invalid-action-code") {
        msg = "Invalid verification link!"

      } if(e.code == "auth/network-request-failed") {
        msg = "Please check your internet connection and reload!"
        redirect = null

      } else {
        msg = e.message
      }
      //console.log("Error:EmailVerify.E", e)
      Swal.fire({
        icon: "error",
        text: msg
      })
      .then(() => {
        if(redirect) {
          router.replace(redirect)

        } else {
          setRequesting(false)
        }
      })
    })
  }

  const resetPass = (e) => {
    clearErrors()
    var hasError = false

    //Check password
    if(nullOrEmpty(password)) {
      hasError = true
      setPasswordError("Please enter a password.")

    } else {
      if(nullOrEmpty(passwordConfirm)) {
        hasError = true
        setPasswordConfirmError("Please confirm your password.")
  
      } else if(!/.{6,}/.test(password)) {
        hasError = true
        setPasswordError("Your password cannot be less than 6 characters.")
        
      } else if(password != passwordConfirm) {
        hasError = true
        setPasswordConfirmError("Your password confirmation is wrong.")
  
      }

    }

    if(!hasError) {
      setRequesting(true)
      confirmPasswordReset(auth, query.oobCode, password)
      .then(r => {
        Swal.fire({
          icon: "success",
          text: "Your password was successfully updated! Sign In now."
        })
        .then(() => {
          router.push(nextUrl())
        })
      })
      .catch((e) => {
        let msg;
        var redirect = nextUrl()
        if(e.code == "auth/expired-action-code") {
          msg = "This password reset link has expired. Request a password reset again."
  
        } if(e.code == "auth/invalid-action-code") {
          msg = "Invalid verification link!"

        } if(e.code == "auth/network-request-failed") {
          msg = "Please check your internet connection and reload!"
          redirect = null
  
        } else {
          msg = e.message
        }
        //console.log("Error:PassReset", e)
        Swal.fire({
          icon: "error",
          text: msg
        })
        .then(() => {
          if(redirect) {
            router.replace(redirect)

          } else {
            setRequesting(false)
          }
        })
      })

    }

  }

  return (
    <AppPageBody title={"Email Verification"} appName={APP_NAME} description={APP_DESCRIPTION} image={`${URL_BASE}/logo.png`}  
    /*Nav and sidebar menu*/
    navMenu={[]} sideBarMenu={[]} mobileShowSideBarAsBottomNav={false}
    bg={useColorModeValue("homeBg2.light", "homeBg2.dark")}>
      <Section bg="url(/assets/images/banner/bg.png)" 
      _before={{
        pos: "absolute",
        content: "''",
        w: "100%",
        h: "100%",
        left: 0, 
        right: 0,
        top: 0,
        bg: useColorModeValue("navbarBg.light", "navbarBg.dark"),
        opacity: .9
      }} 
      p={{base: "20px 0 25px", md: "100px 0 50px"}}>
        <AppContainer zIndex="1">
          <Card w={{base: "100%", sm: "400px", md: "500px"}} display={query && query?.mode == "resetPassword"? "block" : "none"}>
              <Box className="d-flex justify-content-between align-items-start">
                  <Box display="flex" flexGrow="1" flexDirection="column" justifyContent="center" alignItems="center">
                  
                      <Text as="div" fontFamily="SFProDisplay-Bold, Helvetica, Arial, sans-serif"
                        fontSize="25px" lineHeight="28px" fontWeight="600" 
                          mt="0px" mb="15px" textAlign="center" display="block" 
                          textTransform="capitalize" wordBreak="break-word">
                        Welcome back 😍
                      </Text>

                      <Text as="div"
                      fontSize="17px" lineHeight="30px" fontWeight="300" mt="0" textAlign="center" 
                      letterSpacing=".25px" mb="15px" opacity=".8">
                        Reset Password
                      </Text>
                  </Box>
              </Box>

              <Box>
                  <InputBox mb={2} 
                    title="New Password:" 
                    type="password" name="password" placeholder="Enter New Password" 
                    value={password}
                    onChange={e => {setPassword(e.trim())}}
                    errorMessage={passwordError} />

                    <InputBox mb={2} 
                      title="Confirm Password:" 
                      type="password" name="password" placeholder="Retype Password" 
                      value={passwordConfirm}
                      onChange={e => {setPasswordConfirm(e.trim())}}
                      errorMessage={passwordConfirmError} />

                    <AppButton id="recaptcha-container" type="submit" onClick={
                      resetPass
                    } 
                    disabled={requesting} fontStyle={requesting? "italic" : "normal"}>
                      {requesting? "Please wait..." : "Reset Password"}
                    </AppButton>
              </Box>
          </Card>
          <Card w={{base: "100%", sm: "400px", md: "500px"}} 
            display={!query || query?.mode == "verifyEmail"? "flex" : "none"} 
            justifyContent="center" alignItems="center">
            <Loading
              style={{display: "inline !important"}}
              width={"50px"}
              height={"50px"}
              color={useColorModeValue("colorAccent.light", "colorAccent.dark")}
              type={Loading.TYPES.tailSpin} />
            <Text as="div" ml="15px" fontStyle="italic">Please wait... Verifying your account.</Text>
          </Card>
        </AppContainer>
      </Section>
    </AppPageBody>
  )
}

export default EmailVerify