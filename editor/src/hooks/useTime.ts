import { useState, useEffect } from 'react';

const useTime = (interval: number) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, interval);

    // Cleanup the interval on component unmount
    return () => clearInterval(timer);
  }, [interval]);

  return currentTime;
};

export default useTime;