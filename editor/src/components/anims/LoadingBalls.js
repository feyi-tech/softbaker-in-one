import Loading from '../widgets/Loading'
import { useColorModeValue } from "@chakra-ui/react"
import theme from "@/root/src/theme"

export default function LoadingBalls() {

  const loadingC = useColorModeValue(theme?.colors?.colorAccent?.light, theme?.colors?.colorAccent?.dark)

  return (
    <Loading
        type={Loading.TYPES.ballTrinagle}
        color={loadingC}
        height={50}
        width={50}
        visible={true}
    />
  )
}