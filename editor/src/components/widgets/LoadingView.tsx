import LoadingBalls from "../anims/LoadingBalls"
import { Box } from '@chakra-ui/react'

interface LoadingView {
    title?: string, message?: string
    [x: string]: any
}
const LoadingView: React.FC<LoadingView> = ({title, message, ...props}) => {
    return(
        <Box className="loading-view" minH="100vh" w="100%" 
        pos="relative" display="flex" flexDirection="column" 
        justifyContent="center" alignItems="center" {...props}>
            {
                title? <h1>{title}</h1> : null
            }
            {
                message? <Box fontStyle="italic">{message}</Box> : null
            }
            <LoadingBalls />
        </Box>
    )
}

export default LoadingView