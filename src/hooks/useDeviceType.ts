import { useState, useEffect } from 'react';
import { BREAKPOINTS, type DeviceType } from '@/lib/adFormats';

/**
 * Hook to detect current device type based on viewport width
 * Updates on window resize
 */
export function useDeviceType(): DeviceType {
  const [device, setDevice] = useState<DeviceType>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width <= BREAKPOINTS.mobile) return 'mobile';
    if (width <= BREAKPOINTS.tablet) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width <= BREAKPOINTS.mobile) setDevice('mobile');
      else if (width <= BREAKPOINTS.tablet) setDevice('tablet');
      else setDevice('desktop');
    };

    // Use matchMedia for better performance
    const mobileQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile}px)`);
    const tabletQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.tablet}px)`);

    const handleChange = () => checkDevice();

    mobileQuery.addEventListener('change', handleChange);
    tabletQuery.addEventListener('change', handleChange);

    return () => {
      mobileQuery.removeEventListener('change', handleChange);
      tabletQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return device;
}
