import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

interface Step {
  label: string;
  icon?: any;
}

interface StepViewProps {
  steps: Step[];
  currentStep: number;
  [x: string]: any;
}

const StepView: React.FC<StepViewProps> = ({ steps, currentStep, ...props }) => {
  return (
    <Box as="ul"
      style={{
        textAlign: 'justify',
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        display: 'inline-flex',
        justifyContent: 'space-around',
        width: '100%',
        listStyleType: 'none',
      }}
      {...props}
    >
      {steps.map((step, index) => (
        <Box as="li" key={index} style={{ position: 'relative', width: '20%', textAlign: 'center', display: 'inline', paddingBottom: '20px' }}>
          <Flex as="span" m="0px !important" display="inline-flex"
            w="1.5rem" h="1.5rem"
            textAlign="center" justifyContent="center" alignItems="center" 
            lineHeight="1.7rem" borderRadius="50%" bg={index <= currentStep ? '#21a2d1' : '#7d7d7d'}
          >
            {step.icon}
          </Flex>
          {index < steps.length - 1 && (
            <Box as="span" pos="absolute" w="100%" h="4px" 
            backgroundColor={index < currentStep ? '#21a2d1' : '#7d7d7d'}
            top="10px"
            />
          )}
          <Box as="span" color={index <= currentStep? '#fff' : '#7d7d7d'} 
          bg={index == currentStep? '#21a2d1' : 'none'} p={index == currentStep? '1px' : '0px'}
          borderRadius="4px"
          fontSize="12px" lineHeight="-15px" fontFamily="Arial" pos="absolute" left="0" right="0" bottom="0">
            {step.label}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default StepView;
