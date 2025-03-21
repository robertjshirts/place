import { useEffect } from "react";
import { getCanvasState } from "../canvas";
import { useStore } from "../store";

export function useFetchCanvas() {
  const setCanvasState = useStore(store => store.setCanvasState);
  const setLoading = useStore(store => store.setLoading);

  useEffect(() => {
    // Initial fetch
    getCanvasState()
      .then(canvas => {
        setLoading(false);
        setCanvasState(canvas);
      })
      .catch((err) => { // I miss you golang
        console.error(`Failed to fetch canvas state: ${err}`);
        setLoading(false);
      });

    // Fetch every 5 seconds
    const intervalId = setInterval(() => {
      getCanvasState()
        .then(canvas => {
          setCanvasState(canvas);
        })
        .catch((err) => {
          console.error(`Failed to fetch canvas state during interval: ${err}`);
        });
    }, 5000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [setCanvasState, setLoading])
}