/**
 * Generates a UUID v4 for user identification
 * @returns A UUID string
 */
export function generateUserId(): string {
  // Check if user already has an ID stored in localStorage
  const storedId = typeof window !== 'undefined' ? localStorage.getItem('place_user_id') : null;
  
  if (storedId) {
    return storedId;
  }
  
  // Generate a new UUID v4
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  
  // Store the UUID in localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('place_user_id', uuid);
  }
  
  return uuid;
}
