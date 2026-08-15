import { APP_DESCRIPTION, APP_NAME, DEFAULT_DEPOSIT_AMOUNT, URL_BASE } from '@/app-config'
import AppPageBody from '@/components/pages/AppPageBody'
import { HStack, Heading, Text, VStack } from '@chakra-ui/react';
import { FaMoneyBill, FaPaintBrush, FaSignInAlt, FaSignOutAlt, FaTools, FaWallet } from 'react-icons/fa';
import useColorValue from '../../hooks/useColorValue';
import AppButton from '../../components/widgets/AppButton';
import AppContainer from '../../components/widgets/AppContainer';
import useLogger from '../../components/tools/tool_editor/Form/svg-processor/hooks/useLogger';

const DownloadDebug = () => {
  const { downloadLogs } = useLogger()
  

  return (
    <AppPageBody title={`Download Debug File`} appName={APP_NAME} description={APP_DESCRIPTION} image={`${URL_BASE}/logo.png`}  
    /*Nav and sidebar menu*/
    navMenu={[]} sideBarMenu={[]} mobileShowSideBarAsBottomNav={false}
    bg={useColorValue("homeBg2.light", "homeBg2.dark")} justifyContent="center" alignItems="center" overflow="hidden">
      {/* Header Section */}
      
      <AppContainer>
        <VStack w="100%" h="80vh" justifyContent="center" alignItems="center" textAlign="center" maxW="600px">
          <Text>A file that should help the developer troubleshoot whatever is wrong anywhere on the site should automatically be downloaded on your browser. Check your download folder and send the file to the developer</Text>
          <Text mb={4}>If the file did not automatically download, Click the button below to download it.</Text>
          <AppButton onClick={downloadLogs}>Download Debug File</AppButton>
        </VStack>
      </AppContainer>
      
    </AppPageBody>
  )
  
};

export default DownloadDebug;