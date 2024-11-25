import { createContext, useState } from "react";

export const OverlayContext = createContext();

export const OverlayProvider = ({ children }) => {
  const [overlayStep, setOverlayStep] = useState(null);

  const startOverlaySequence = () => {
    setOverlayStep(0);
    localStorage.setItem("showOverlaySequence", "true");
  };

  const stopOverlaySequence = () => {
    setOverlayStep(null);
    localStorage.removeItem("showOverlaySequence");
  };

  return (
    <OverlayContext.Provider
      value={{
        overlayStep,
        setOverlayStep,
        startOverlaySequence,
        stopOverlaySequence,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
};
