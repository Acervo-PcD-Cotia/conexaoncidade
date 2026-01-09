import { useEffect } from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => void;
    };
  }
}

export function VLibrasWidget() {
  const { settings } = useAccessibility();

  useEffect(() => {
    if (!settings.vlibrasActive) return;

    // Check if script already loaded
    if (document.querySelector('script[src*="vlibras"]')) return;

    // Load VLibras script
    const script = document.createElement("script");
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.async = true;
    script.onload = () => {
      if (window.VLibras) {
        new window.VLibras.Widget("https://vlibras.gov.br/app");
      }
    };
    document.head.appendChild(script);

    // Add widget container if not exists
    let container = document.querySelector('[vw]');
    if (!container) {
      container = document.createElement('div');
      container.setAttribute('vw', '');
      container.className = 'enabled';
      container.innerHTML = `
        <div vw-access-button class="active"></div>
        <div vw-plugin-wrapper>
          <div class="vw-plugin-top-wrapper"></div>
        </div>
      `;
      document.body.appendChild(container);
    }
  }, [settings.vlibrasActive]);

  return null;
}
