/* eslint-disable no-useless-escape */
import { Dispatch, SetStateAction, useEffect, useState } from "react";

function isValidJSON(text: string) {
  try {
    const result = JSON.parse(text);
    return typeof result === "object" && result !== null;
  } catch (e) {
    return false;
  }
}

// <any> - string | null | boolean + to fix type errors while using the value
function useLocalStorage<T>(
  key: string,
  initialValue: any
): [T, Dispatch<SetStateAction<T>>, () => void] {
  // Get from local storage then
  // parse stored json or return initialValue

  const readValue = () => {
    if (typeof window === "undefined") {
      return initialValue;
    }
  
    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }
  
      let parsedValue;
      // Attempt to parse as JSON, fallback to the original string if it's not valid JSON
      try {
        parsedValue = JSON.parse(item); // handles valid JSON and boolean convertions
      } catch {
        parsedValue = item;
      }

      if (typeof parsedValue === 'string' && initialValue === null) {
        // if the initialValue of key is supposed to be null, and the stored value is a string, 
        // then it is wrongly set and need to be cleared
        return initialValue;
      } else if (parsedValue === null) { 
        // in case of possible null after JSON.parse
        return initialValue;
      } else {
        return parsedValue;
      }
    } catch (error) {
      return initialValue;
    }
  };

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  // <any> - string | null | boolean | different JSON structures
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    // Prevent build error "window is undefined" but keeps working
    // eslint-disable-next-line eqeqeq
    if (typeof window === "undefined") {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`
      );
    }

    try {
      // Allow value to be a function so we have the same API as useState
      const newValue: any = value instanceof Function ? value(storedValue) : value;

      // Save to local storage
      try {
        if (newValue !== "" || newValue !== null) {
          const serializedValue = typeof newValue === "string" ? newValue : JSON.stringify(newValue);
          window.localStorage.setItem(key, serializedValue);

          // Save state
          setStoredValue(newValue);

          // We dispatch a custom event so every useLocalStorage hook are notified
          window.dispatchEvent(new Event("local-storage"));
        } else {
          removeValue()
        }
      } catch (error) {
        console.warn(`Error serializing localStorage key “${key}”:`, error);
      }

    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  const removeValue = () => {
    if (typeof window === "undefined") {
      console.warn(
        `Tried removing localStorage key “${key}” even though environment is not a client`
      );
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.warn(`Error removing localStorage key “${key}”:`, error);
    }
  };

  useEffect(() => {
    setStoredValue(readValue());

    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // this only works for other documents, not the current one
    window.addEventListener("storage", handleStorageChange);

    // this is a custom event, triggered in writeValueToLocalStorage
    window.addEventListener("local-storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
    };
    // eslint-disable-next-line
  }, []);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
