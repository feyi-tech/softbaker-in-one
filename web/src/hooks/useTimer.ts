
import { useEffect, useState } from "react"


const useTimer = (callback: () => any, interval: number, setValueOnStart?: boolean) => {

    const [timerValue, setTimerValue] = useState<any>()
    const [timerId, setTimerId] = useState<any>(null)
    const [ticks, setTicks] = useState<number>(0)
    const startTimer = (tag?: string) => {
        if(timerId === null) {
            //console.log("useTimer", "timerId", timerId, "startTimer", "tag", tag, "interval", interval, "callback", callback)
            if(setValueOnStart) setTimerValue(callback())
            const timer = setInterval(() => {
                setTimerValue(callback())
                //console.log("useTimer.ticks", ticks + 1, "timerId", timerId)
                setTicks(ticks + 1)
            }, interval)
            setTimerId(timer)
        }
    }

    useEffect(() => {
        //console.log("useTimer.useEffect", "timerId", timerId)

    }, [timerId])

    const stopTimer = (emptyValue?: any) => {
        //console.log("useTimer.stopTimer", "timerId", timerId)
        clearInterval(timerId)
        setTimerId(null)
        setTicks(0)
        if(emptyValue !== undefined && emptyValue !== null) clearTimer(emptyValue)
    }

    const clearTimer = (emptyValue?: any) => {
        setTimerValue(emptyValue)
    }

    return {timerValue, ticks, startTimer, stopTimer, clearTimer}
}

export default useTimer