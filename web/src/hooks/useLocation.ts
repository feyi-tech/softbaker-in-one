
import { useEffect, useState } from "react"

interface LatLng {
    lat: number,
    lng: number
}
export const getCurrentLocation = (): Promise<LatLng> => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
            }, error => {
                reject(error)
            })
        } else {
            reject("Geolocation is not supported by your browser.")
        }
    })
}

const useLocation = (interval: number) => {
    const [ location, setLocation ] = useState<LatLng>()
    const [ locationError, setLocationError ] = useState<string>()
    const [ lastUpdateTime, setLastUpdateTime ] = useState<number>()
    const [ lastPollTime, setLastPollTime ] = useState<number>()

    const canUpdate = (latLng: LatLng) => {
        return !location || latLng.lat != location.lat || latLng.lng != location.lng
    }
    const pollLocation = () => {
        setTimeout(() => {
            getCurrentLocation()
            .then(location => {
                const now = Date.now()
                if(canUpdate(location)) {
                    setLocation(location)
                    setLastUpdateTime(now)
                }
                setLastPollTime(now)
                pollLocation()
            })
            .catch(e => {
                setLocationError(e.message)
                setLastPollTime(Date.now())
            })
        }, interval);
    }

    useEffect(() => {
        pollLocation()
    }, [])
    
    return { location, locationError, lastUpdateTime, lastPollTime }
}

export default useLocation