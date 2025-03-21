import { useEffect } from 'react';
import { getPixelCooldownEnd } from '../cooldown';
import { useStore } from '../store';

export function useFetchPixelCooldown(username?: string | null) {
  const setCooldownEnd = useStore(store => store.setCooldownEnd);

  useEffect(() => {
    if (!username) return;
    
    getPixelCooldownEnd(username)
      .then((storedCooldownEnd) => {
        console.log("Fetched cooldown end:", storedCooldownEnd);
        // Don't check for !storedCooldownEnd since Date.now() is returned when no cooldown exists
        setCooldownEnd(storedCooldownEnd);
      })
      .catch(error => {
        console.error("Error fetching pixel cooldown:", error);
      });
  }, [username, setCooldownEnd]);
}
