
import { useEffect, useState } from 'react'
//import Image from 'next/image'
import { Flex, Image } from "@chakra-ui/react"
import Loading from "../Loading"
import { APP_NAME } from '@/root/src/app-config'

const MEDIA_QUERY_SIZES = {
  base: "base",
  md: "md",
  lg: "lg"
}


const extractSize = (
  size?: string | number | null, isWidth?: boolean, mediaQuerySize?: any, idData?: string | number | null
  ): string | number | undefined | null => {
  var s
  try {
    s = size? (typeof size === "string" || typeof size === "number"? size : size[mediaQuerySize]) : null

  } catch(e) {
  }
  
  if(s) {
    s = `${s}`
    
    try {
      s = s.toLowerCase().replace("px", "").replace("rem", "").replace("rem", "")

    } catch (e) {
    }
    if(s.endsWith(isWidth? "vw" : "vh")) {
      switch (mediaQuerySize) {
        case MEDIA_QUERY_SIZES.base:
          s = 512
          break;
        case MEDIA_QUERY_SIZES.md:
          s = 768
          break;
        default:
          s = 1024
          break;
      }
    }
    
  }
  
  return s
}

const extractWidth = (width?: string | number | null, mediaQuerySize?: any, idData?: string | number | null): string | number | undefined | null => {
  return extractSize(width, true, mediaQuerySize, idData)
}
const extractHeight = (height?: string | number | null, mediaQuerySize?: any, idData?: string | number | null): string | number | undefined | null => {
  return extractSize(height, false, mediaQuerySize, idData)
}

interface ImageView {
  src: string, 
  idData?: string, d?: any, display?: any,
  isDefaultHost?: boolean, 
  host?: any, 
  alt?: any, title?: any,
  fallbackProfilePhoto?: any, 
  resWidth?: any, resHeight?: any,
  w?: any, h?: any, width?: any, height?: any, 
  intrisicWidth?: any, intrisicHeight?: any,
  srcType?: string,
  [x: string]: any
}
const ImageView: React.FC<ImageView> = ({ idData, d, display,
  src, 
  isDefaultHost, 
  host, 
  alt, title,
  fallbackProfilePhoto, 
  resWidth, resHeight,
  w, h, width, height, 
  intrisicWidth, intrisicHeight, srcType,
  ...props}) => {
  const imgSrc = imageSrc({
    src: src,
    width: extractWidth(intrisicWidth, "none"),
    height: extractHeight(intrisicHeight, "none")
  })

  const sizes = [
    {size: 512, mquery: MEDIA_QUERY_SIZES.base},
    {size: 768, mquery: MEDIA_QUERY_SIZES.md},
    {size: 1024, mquery: MEDIA_QUERY_SIZES.lg}
  ]
  const webpImages = []
  const defaultImages = []
  const webPData: {[x: string]: any} = {}
  const defaultData: {[x: string]: any} = {}
  var defaultImageExt: string | null | undefined = ""
  if(w || width || h || height) {
    for(const size of sizes) {
      const imageInfo = imageSrc({
        src: src, 
        width: extractWidth(resWidth || w || width, size.mquery, idData), 
        height: extractHeight(resHeight || h || height, size.mquery, idData), 
        suffix: ` ${size.size}w`,
        requiresSize: true, idData: idData
      })
      if(imageInfo.default) {
        defaultImages.push(imageInfo.default)
        defaultImageExt = imageInfo.ext
        defaultData[size.mquery] = imageInfo.default
      }
      if(imageInfo.webp) {
        webpImages.push(imageInfo.webp)
        webPData[size.mquery] = imageInfo.webp
      }
    }
  }

  const [loaded, setLoaded] = useState(true)
  const [lastSrc, setLastSrc] = useState()
  const [lastFallback, setLastFallback] = useState()

  return (
    <picture>
      {/*
        webpImages.length > 0?
        <source type="image/webp" 
        srcset={webpImages.join(", ")} />
        : null*/
      }
      {
        defaultImages.length > 0?
        <source type={srcType || `image/${defaultImageExt}`} 
        srcSet={defaultImages.join(", ")} />
        : null
      }
      <Flex 
        display={loaded? "none" : "flex"} 
        position={loaded? "relative" : "absolute"}
        w={w || width || "50px"} 
        h={h || height || "50px"} justifyContent="center" alignItems="center"
      >
        <Loading type={Loading.TYPES.puff} width="25px" height="25px" color="#dfdfdf" />
      </Flex>
      <Image 
      src={defaultImages[0]}
      data-src={lastFallback || webPData.toString()} 
      opacity={loaded? 1 : 0}
      alt={alt || title || APP_NAME} /*
      fallbackSrc={fallbackProfilePhoto || defaultData}*/
      data-fallback-src={fallbackProfilePhoto || defaultData.toString()}
      w={w || width || "auto"} 
      h={h || height || "auto"} 
      htmlWidth={extractWidth(w || width, MEDIA_QUERY_SIZES.md) as string} 
      htmlHeight={extractHeight(h || height, MEDIA_QUERY_SIZES.md) as string} 
      onLoad={() => {
        setLoaded(true)
      }} 
      onError={() => {/*
        console.log("onImageError", "a", webPData.toString())
        if(!lastSrc) {
          setLastSrc(fallbackProfilePhoto || defaultData || "none")
          console.log("onImageError", "b", fallbackProfilePhoto || defaultData.toString())

        } else if(!lastFallback) {
          setLastFallback(src)
          console.log("onImageError", "c", src)
        }*/
      }}
      {...props} />
    </picture>
  )
}

interface ImageSrc {
  src: string, width: any, height: any, 
  suffix?: string, requiresSize?: boolean, idData?: any
}
interface SrcData {
  default?: string,
  webp?: string,
  ext?: string
}
export const imageSrc = ({src, width, height, suffix, requiresSize, idData}: ImageSrc) => {
  var srcData: SrcData = {default: src, ext: src && src.length? src.substring(src.lastIndexOf(".") + 1).toLowerCase() : ""}
  
  if(src && src.length > 0 && src.startsWith("/")) {
    if(requiresSize && isNaN(width) && isNaN(height)) {
      srcData = {}

    } else {
      var config = ""
      if(width && !isNaN(width)) {
        config += `w_${`${width}`.trim()}`
      }
      if(height && !isNaN(height)) {
        config += `${config.length > 0? "," : ""}h_${`${height}`.trim()}`
      }
      if(config.length > 0) {
        config = `/${config},q_auto`

      } else {
        config = `/q_auto`
      }
      const srcPrefix = `https://res.cloudinary.com/cosmobox-it/image/upload${config}`
      srcData.default = `${srcPrefix}${src}`
      srcData.webp = `${srcData.default.substring(0, srcData.default.lastIndexOf("."))}.webp`
      if(suffix) {
        srcData.default = `${srcData.default}${suffix}`
        srcData.webp = `${srcData.webp}${suffix}`
      }
      
    }
    
  }
  
  
  return srcData
}

export default ImageView