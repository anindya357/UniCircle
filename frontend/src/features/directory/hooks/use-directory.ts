"use client";

import { useEffect, useState } from "react";

import type { Department } from "@/features/directory/types/directory";
import { directoryService } from "@/services";

export function useDirectory() {
  const [departments, setDepartments] = useState<readonly Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    void directoryService
      .listDepartments()
      .then((records) => {
        if (isCurrent) {
          setDepartments(records);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setError("The directory could not be loaded. Please try again.");
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [reloadToken]);

  function retry() {
    setIsLoading(true);
    setError(null);
    setReloadToken((current) => current + 1);
  }

  return {
    departments,
    isLoading,
    error,
    retry,
  };
}
