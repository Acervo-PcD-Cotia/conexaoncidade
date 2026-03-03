import { useState, useEffect, useCallback } from "react";

const TOTAL_SECONDS = 36 * 60 * 60; // 36 hours

function getStorageKey(cpfCnpj: string) {
  const clean = cpfCnpj.replace(/\D/g, "");
  return `formula_countdown_${clean}`;
}

export function useFormulaCountdown(cpfCnpj: string) {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);

  const init = useCallback(() => {
    if (!cpfCnpj) return;
    const key = getStorageKey(cpfCnpj);
    const stored = localStorage.getItem(key);
    if (stored) {
      const startTs = parseInt(stored, 10);
      const elapsed = Math.floor((Date.now() - startTs) / 1000);
      setRemaining(Math.max(0, TOTAL_SECONDS - elapsed));
    } else {
      localStorage.setItem(key, Date.now().toString());
      setRemaining(TOTAL_SECONDS);
    }
  }, [cpfCnpj]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [remaining > 0]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const isExpired = remaining <= 0;

  return { hours, minutes, seconds, isExpired, remaining };
}
