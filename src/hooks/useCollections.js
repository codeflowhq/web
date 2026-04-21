import { useCallback, useState } from "react";

export const useCollections = (storageKey) => {
  const [collections, setCollections] = useState(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error(error);
    }
    return [];
  });

  const persistCollections = useCallback(
    (nextCollections) => {
      setCollections(nextCollections);
      window.localStorage.setItem(storageKey, JSON.stringify(nextCollections));
    },
    [storageKey],
  );

  return { collections, setCollections, persistCollections };
};
