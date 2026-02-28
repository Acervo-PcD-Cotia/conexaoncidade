import { useState, useEffect, useCallback } from 'react';
import { BusinessFormData, INITIAL_FORM_DATA } from '@/constants/businessForm';

const STORAGE_KEY = 'voce_no_google_draft';

export function useBusinessForm() {
  const [formData, setFormData] = useState<BusinessFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...INITIAL_FORM_DATA, ...JSON.parse(saved) } : INITIAL_FORM_DATA;
    } catch {
      return INITIAL_FORM_DATA;
    }
  });

  const [currentStep, setCurrentStep] = useState(0);

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(t);
  }, [formData]);

  const updateField = useCallback(<K extends keyof BusinessFormData>(key: K, value: BusinessFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const nextStep = useCallback(() => setCurrentStep(s => Math.min(s + 1, 4)), []);
  const prevStep = useCallback(() => setCurrentStep(s => Math.max(s - 1, 0)), []);
  const goToStep = useCallback((s: number) => setCurrentStep(s), []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(0);
  }, []);

  return { formData, updateField, currentStep, nextStep, prevStep, goToStep, clearDraft, setFormData };
}
