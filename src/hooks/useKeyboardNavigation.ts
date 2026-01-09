import { useEffect } from "react";

export function useKeyboardNavigation() {
  useEffect(() => {
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        document.body.classList.add("keyboard-user");
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove("keyboard-user");
    };

    window.addEventListener("keydown", handleFirstTab);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleFirstTab);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);
}
