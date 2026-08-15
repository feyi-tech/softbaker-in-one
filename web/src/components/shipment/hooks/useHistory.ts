import { useEffect, useState } from "react";
import { CurrentTimelineData, UseHistoryResult } from "../types";
import { Message } from "../../shipview/types";

interface History {
  [documentId: string]: {
    currentIndex: number,
    totalUpdates: number,
    timeline: Message[]
  }
}

const useHistory = (maxTimeline: number): UseHistoryResult => {
  const [history, setHistory] = useState<History>({});

  /*
  useEffect(() => {
    //7PBDK9BXYK2BAJOSV7BO
    
    const currentHistory = history["7PBDK9BXYK2BAJOSV7BO"];
    if(currentHistory) {

      const totalUpdatesTillLimitedTimelineStart =  (
          currentHistory.totalUpdates - currentHistory.timeline.length
      )
      const currentTimelineTotalUpdates =  totalUpdatesTillLimitedTimelineStart + (
          currentHistory.currentIndex + 1
      )

      console.log("getCurrentTimelineData:2 ", currentTimelineTotalUpdates, history)
    }
  }, [history])*/

  const addHistory = (documentId: string, shipment: Message) => {
    
    try {
      const currentHistory = history[documentId];
      //Only update the history if the the current document data is not the same as the update resulting data
      if(!currentHistory || JSON.stringify(currentHistory.timeline[currentHistory.timeline.length - 1]) != JSON.stringify(shipment)) {
          const updatedTimeline = [
            ...(currentHistory?.timeline ?? []),
            shipment,
        ];

        // Slice the timeline to keep only the last 5 shipments
        const limitedTimeline = updatedTimeline.slice(-maxTimeline);

        const updatedHistory = {
          ...history,
          [documentId]: {
            currentIndex: limitedTimeline.length - 1,
            totalUpdates: (currentHistory?.totalUpdates || 0) + 1,
            timeline: limitedTimeline,
          },
        };

        setHistory(updatedHistory);
      }
    } catch (error) {
      console.error("Error adding history:", error);
    }
  };

  const clearHistory = (documentId: string) => {
    try {
        delete history[documentId]

        setHistory(history);

    } catch(error) {
        console.error("Error clearing history:", error);
    }
  }

  const clearAllHistory = () => {
    try {
        setHistory({});

    } catch(error) {
        console.error("Error clearing history:", error);
    }
  }

  const undo = (documentId: string): Message | undefined => {
    const currentHistory = history[documentId];
    
    if (currentHistory?.currentIndex > 0) {
      const previousIndex = currentHistory.currentIndex - 1;
      const previousShipment = currentHistory.timeline[previousIndex];
      
      try {
        setHistory({
            ...history,
            [documentId]: {
                currentIndex: previousIndex,
                totalUpdates: currentHistory.totalUpdates,
                timeline: currentHistory.timeline
            }
        });
        
        return previousShipment;
      } catch (error) {
        console.error("Error undoing history:", error);
      }
    }
    
    return undefined;
  };

  const redo = (documentId: string): Message | undefined => {
    const currentHistory = history[documentId];
    
    if (currentHistory?.currentIndex < currentHistory.timeline.length - 1) {
        const nextIndex = currentHistory.currentIndex + 1;
        const nextShipment = currentHistory.timeline[nextIndex];
        
        try {
          setHistory({
              ...history,
              [documentId]: {
                  currentIndex: nextIndex,
                  totalUpdates: currentHistory.totalUpdates,
                  timeline: currentHistory.timeline
              }
          });
          
          return nextShipment;
        } catch (error) {
          console.error("Error redoing history:", error);
        }
    }
    
    return undefined;
  };

  const getCurrentTimeline = (documentId: string): Message | undefined => {
    const currentHistory = history[documentId];
    
    if (currentHistory?.currentIndex > -1) {
      return currentHistory.timeline[currentHistory.currentIndex];
    }
    
    return undefined;
  };

  const getCurrentTimelineData = (documentId: string): CurrentTimelineData => {
    const currentHistory = history[documentId];
    if(currentHistory) {

        const totalUpdatesTillLimitedTimelineStart =  (
            currentHistory.totalUpdates - currentHistory.timeline.length
        )
        const currentTimelineTotalUpdates =  totalUpdatesTillLimitedTimelineStart + (
            currentHistory.currentIndex + 1
        )
        
        return {
            hasUndo: currentHistory.currentIndex > 0,
            hasRedo: currentHistory.currentIndex < currentHistory.timeline.length - 1,
            totalUpdates: currentTimelineTotalUpdates
        }
    }

    return {
        hasUndo: false,
        hasRedo: false,
        totalUpdates: 0
    }
  }

  return {
    addHistory, clearHistory, clearAllHistory,
    undo,
    redo,
    getCurrentTimeline, getCurrentTimelineData
  };
};

export default useHistory;