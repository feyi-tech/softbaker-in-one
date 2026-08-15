import { APP_DESCRIPTION, APP_NAME, DEFAULT_DEPOSIT_AMOUNT, URL_BASE } from '@/app-config'
import AppPageBody from '@/components/pages/AppPageBody'
import { HStack, Heading, Text, VStack } from '@chakra-ui/react';
import useColorValue from '../hooks/useColorValue';
import { useWindowWidth } from '@react-hook/window-size';
import { useEffect, useMemo, useState } from 'react';
import { FaMoneyBill, FaPaintBrush, FaSignInAlt, FaSignOutAlt, FaSync, FaTools, FaWallet, FaWhatsapp } from 'react-icons/fa';
import { useSoftBaker } from 'use-softbaker';
import { Menu } from '../components/PageBody/index.types';
import Swal from 'sweetalert2';
import Card from '../components/widgets/Card';
import CuteButton from '../components/widgets/CuteButton';
import syncUserBalance from '../components/shipment/syncUserBalance';
import ToolsGrid from '../components/widgets/ToolsGrid';
import useToolsSelector from '../hooks/useToolsSelector';
import axios from 'axios';

const Home = () => {
  const homeBg = useColorValue('homeBg.light', 'homeBg.dark')
  const colorAcent = useColorValue("colorAccent.light", "colorAccent.dark")

  const [ hasPendingWalletView, setHasPendingWalletView ] = useState<boolean>(false)
  const [ authMessage, setAuthMessage ] = useState<{signIn: string, signUp: string}>()
  const [deviceWidth, setDeviceWidth] = useState<number>(0)
  const windowWidth = useWindowWidth()
  useEffect(() => {
    if(windowWidth) {
      setDeviceWidth(windowWidth)
    }
  }, [windowWidth])

  useEffect(() => {
    setDeviceWidth(window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)
  }, [])

  const titleComp = () => {
    return (
      <Text as="span">Your n<Text as="span" textDecoration="underline">o</Text> 1 tools for generating websites and documents.</Text>
    )
  }
  const descComp = "Create Flight Ticket, Shipping Invoice with tracking, Banking Websites and other documents and websites."

  const { user, signIn, signOut, showWallet, authLoading, aff_pct, adminInfo, group_link } = useSoftBaker()

  const { showTools } = useToolsSelector()

  useEffect(() => {
    //console.log("adminInfo:22 ", adminInfo)
  }, [user, adminInfo])

  useEffect(() => {
    if(!authLoading && hasPendingWalletView && authMessage) {
      if(user) {
        showWallet(DEFAULT_DEPOSIT_AMOUNT)

      } else {
        signIn(authMessage.signIn, authMessage.signUp)
        .then(user => {})
        .catch((e: any) => {})
      }
      setHasPendingWalletView(false)
    }
  }, [ authLoading, user])

  const allTools = {
    title: "All Tools",
    forceMobileDisplay: true,
    onClick: () => {
      showTools(null)
    },
    onIcon: () => {
        return <FaTools />
    }
  }

  const myWallet = {
    title: "My Wallet",
    forceMobileDisplay: false,
    onClick: () => {
      if(authLoading) {
        setHasPendingWalletView(true)
        setAuthMessage({
          signIn: "Please sign in to access your wallet.",
          signUp: "Please sign up to access your wallet."
        })

      } else if(!user) {
        setHasPendingWalletView(true)
        signIn("Please sign in to access your wallet.", "Please sign up to access your wallet.")
        .then(user => {})
        .catch((e: any) => {})

      } else if(user) {
        showWallet(DEFAULT_DEPOSIT_AMOUNT)
      }
    },
    onIcon: () => {
        return <FaWallet />
    }
  }

  const handleSyncUserBalance = async () => {
    syncUserBalance(user)
    .then(r => {

    })
    .catch(e => {

    })
  }

  const authLoadingMenu: Menu[] = [
    allTools
  ]
  const menuNoAff: Menu[] = [
    myWallet,
    {...allTools}
  ]
  const menuAff: Menu[] = [
    myWallet,
    {
      title: "Make Money",
      forceMobileDisplay: false,
      onClick: () => {
        Swal.fire({
          title: "Earn on Softbaker",
          text: `Softbaker allows you to earn BNB by telling your friends about Softbaker. Just share your referral link with your friends and start earning a ${aff_pct}% reward each time they make a deposit. They also enjoy a ${aff_pct}% bonus added to their balance on each deposit for signing up with your referral link.`,
          icon: "info",
          confirmButtonText: "Start Earning",
          cancelButtonText: "Cancel",
          showCancelButton: true
        })
        .then(c => {
          if(c.isConfirmed) {
            if(authLoading) {
              setHasPendingWalletView(true)
              setAuthMessage({
                signIn: "Please sign in to start earning.",
                signUp: "Please sign up to start earning."
              })
      
            } else if(!user) {
              setHasPendingWalletView(true)
              signIn("Please sign in to start earning.", "Please sign up to start earning.")
              .then(user => {})
              .catch((e: any) => {})
      
            } else if(user) {
              showWallet(DEFAULT_DEPOSIT_AMOUNT)
            }
          }
        })
      },
      onIcon: () => {
          return <FaMoneyBill />
      }
    },
    {...allTools}
  ]
  
  const defaultCurveValue = 350;
  const curveRate = 3;
  const [ curveValue, setCurveValue ] = useState<number>(350)
  

  useEffect(() => {
    // Variables
    var ticking = false;

    window.addEventListener("scroll", function(e) {
      const scrollPos = window.scrollY;
  
      if (!ticking) {
        window.requestAnimationFrame(function() {
          if (scrollPos >= 0 && scrollPos < defaultCurveValue) {
            const newCurveValue = defaultCurveValue - (scrollPos / curveRate);
            setCurveValue(newCurveValue)
          }
          ticking = false;
        });
      }
  
      ticking = true;
    });
  }, [])

  const menu = useMemo(() => {
    let menuArray = authLoading ? authLoadingMenu : aff_pct && aff_pct > 0 ? menuAff : menuNoAff;
    if(!authLoading && user) {
      menuArray.push({
          title: "Sign Out",
          forceMobileDisplay: true,
          onClick: () => {
            Swal.fire({
              title: "Sign Out",
              text: "Are you sure you want to sign out?",
              icon: "warning",
              confirmButtonText: "Yes",
              cancelButtonText: "No",
              showCancelButton: true
            })
            .then(result => {
              if(result.isConfirmed) {
                signOut()
                .then(() => {

                })
                .catch(e =>{

                })
              }
            })
          },
          onIcon: () => {
              return <FaSignOutAlt />
          }
      })

    } else if(!authLoading && !user) {
      menuArray.push({
        title: "Sign In",
        forceMobileDisplay: true,
        onClick: () => {
          signIn(authMessage?.signIn, authMessage?.signUp)
          .then(() => {

          })
          .catch(e =>{

          })
        },
        onIcon: () => {
            return <FaSignInAlt />
        }
      })
    }

    return menuArray;
  }, [authLoading, aff_pct, adminInfo, user]);


  return (
    <AppPageBody title={APP_NAME} appName={APP_NAME} description={APP_DESCRIPTION} image={`${URL_BASE}/logo.png`}  
    /*Nav and sidebar menu*/
    navMenu={menu} sideBarMenu={[]} mobileShowSideBarAsBottomNav={false}
    bg={useColorValue("homeBg2.light", "homeBg2.dark")} pageLoading={authLoading}>
      {/* Header Section */}
      
      <VStack as="header" className="curved-header" textAlign="center" w="100%" 
          justifyContent="center" alignItems="center" mt="1rem">

          <Card w="90%" maxWidth="900px" mt={4}>
            <Heading as="h1" fontSize="3xl" fontWeight="bold">
              {titleComp()}
            </Heading>

            <Text as="div" mb="1rem">The best AI tools to generate any website and edit documents without any coding or editing skill.</Text>

            <VStack w="100%" justifyContent="center" alignItems="center" flexWrap="wrap">
              {
                group_link?
                <CuteButton as="a" href={group_link/*"https://chat.whatsapp.com/DpPO2BJG15JK1AKkix7YEJ"*/} target="_blank" bg={"#075E54"} rightIcon={<FaWhatsapp />}>
                  Join Our Whatsapp Group
                </CuteButton>
                :
                <CuteButton disabled fontStyle="italic" bg={"#075E54"} rightIcon={<FaWhatsapp />}>
                  Loading Whatsapp Link...
                </CuteButton>
              }
            </VStack>
          </Card>
        </VStack>
        <HStack id="toolsTitle" w="100%" justifyContent="center" fontSize={{base: "1.1rem", md: "2rem"}} fontWeight="bold" my={4} 
        textDecoration="underline" color={colorAcent}>
          <FaTools /><FaTools /><Text as="div" textAlign="center">Softbaker Tools</Text><FaTools /><FaTools />
        </HStack>

        <HStack w="100%" justifyContent="center" borderRadius="8px" border={`8px ridge ${colorAcent}`} 
          p="0!important">
          <ToolsGrid />
        </HStack>
        <HStack justifyContent="center" alignItems="flex-start">
          <Card w="90%" maxW="800px" mt={8} px="1rem" justifyContent={"center"} alignItems="center">
            <Text as="div" mb="0.5rem" fontWeight="bold" textAlign="center">Disclaimer: </Text>
            <Text as="div" textAlign="center">
              By using this website, you agree that this website is just a piece of software to create documents, websites, and tools for the sole purpose of <b>content creation</b>, and that you're 100% responsible for whatever you do with the tools available on this webites, the documents or links generated for you on this website.
              <br /><br />
              You agree by using this website that the owner(s) of this website and other websites it is connected to, such as the documents viewing website(s) and websites are not responsible in any way for whatever you do with them. 
            </Text>
          </Card>
        </HStack>
      
    </AppPageBody>
  )
  
};

export default Home;