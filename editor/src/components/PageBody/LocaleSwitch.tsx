import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton, Divider,
  HStack, Flex
} from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';
import ReactCountryFlag from 'react-country-flag';
import { GoogleLanguage } from 'use-google-translate';

export interface Locale { 
    lang?: any, 
    onLocaleName?: (key: string) => string, 
    onLocaleIcon?: (key: string) => any, 
}

export interface LocaleMap {
    [x: string]: Locale
}

interface LocaleSwitch {
    bg?: any, zIndex?: any, isCircle?: boolean, 
    lang?: any, langs?: {
        [code: string]: GoogleLanguage;
    } | null, 
    onLocaleName?: (key: string) => string, 
    onLocaleIcon?: (key: string) => any, 
    [x: string]: any
}
const LocaleSwitch: React.FC<LocaleSwitch> = ({ zIndex, disable, isCircle, lang, langs, onLocaleSelected, ...props }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [show, setShow] = useState(false)
  
    useEffect(() => {
      setShow(true)
    }, [])
  
    if(!show || !langs) return null
    return (
      <Box>
        <Button
          display={disable ? 'none' : 'inline-flex'}
          cursor="pointer"
          className={`sidebar-btn`}
          onClick={onOpen} 
          {...props}
        >
          <HStack
            as={Button}
            className={isCircle ? 'circle-button' : ''}
            background="transparent !important"
            justifyContent="center"
            alignItems="center"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            overflow="hidden" 
            _hover={{opacity: "0.3 !important"}}
          >
            <Box
              as="span"
              aria-label={!langs ? '' : langs[lang]?.name}
              title={!langs ? '' : langs[lang]?.name}
              display={isCircle ? 'none' : 'inline-flex'}
              className="notranslate"
            >
              {!langs ? '' : langs[lang]?.name}
            </Box>
            &nbsp;
            <ReactCountryFlag countryCode={!langs ? '' : langs[lang]?.countryCode} svg />
            {!isCircle ? <Box as={FaChevronDown} /> : null}
          </HStack>
        </Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent bg="rgb(39, 38, 44)" zIndex={zIndex} justifyContent="flex-start">
            <ModalHeader>
              <Box p="0.5rem">
                  <Button
                      id={!langs? "" : langs[lang]?.name}
                      key={lang}
                      onClick={() => {
                          onClose();
                      }}
                      className="dropdown-item"
                      style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                      }}
                      _hover={{opacity: "0.3 !important"}}
                      >
                      <Box className="notranslate" aria-label={!langs? "" : langs[lang]?.name} title={!langs? "" : langs[lang]?.name}>
                          {!langs? "" : langs[lang]?.name}
                      </Box>
                      &nbsp;
                          <ReactCountryFlag countryCode={!langs? "" : langs[lang]?.countryCode} svg />
                  </Button>
              </Box>
            </ModalHeader>
            <Divider />
            <ModalCloseButton color="#fff" />
            <ModalBody>
              <Flex w="100%" flexWrap="wrap">
                  {Object.keys(langs || {}).map((lng) => {
                  if (lng === lang) return null;
                  return (
                      <Box w={{base: "50%", md: "30%", ld: "25%"}} p="0.5rem">
                          <Button w="100%"
                          id={lng}
                          key={lng}
                          onClick={() => {
                              if (onLocaleSelected) onLocaleSelected(lng);
                              onClose();
                          }}
                          className="dropdown-item"
                          style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                          }}
                          _hover={{opacity: "0.3 !important"}}
                          >
                          <Box className="notranslate" aria-label={langs[lng].name} title={langs[lng].name}>
                              {langs[lng].name}
                          </Box>
                          &nbsp;
                              <ReactCountryFlag countryCode={langs[lng]?.countryCode} svg />
                          </Button>
                      </Box>
                  );
                  })}
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    );
  };
  
  export default LocaleSwitch;