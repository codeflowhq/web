import { useCallback, useEffect, useState } from "react";

export const useCollections = (storageKey) => {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setCollections(JSON.parse(stored));
      }
    } catch (error) {
      console.error(error);
    }
  }, [storageKey]);

  const persistCollections = useCallback(
    (nextCollections) => {
      setCollections(nextCollections);
      window.localStorage.setItem(storageKey, JSON.stringify(nextCollections));
    },
    [storageKey],
  );

  return { collections, setCollections, persistCollections };
};
