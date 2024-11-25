import React from "react";
import AmikaFace from "../assets/Amika_face.png"; // Import the image

export default function Overlay({
  step,
  onNext,
  onSkip,
  instructions,
  position,
  className,
}) {
  const overlayStyles = {
    position: "absolute",
    zIndex: 1000, // Add a high z-index value
    ...position, // Apply the position styles
  };

  return (
    <div
      className={`relative bg-white p-6 rounded-lg border border-blue-800 shadow-lg max-w-md w-full ${className}`}
      style={overlayStyles}
    >
      <div className="flex items-start">
        <img
          src={AmikaFace}
          alt="Amika Face"
          className="w-10 h-10 mt-1 rounded-full mr-4 mb-4"
        />
        <p className="mb-4">{instructions[step]}</p>
      </div>
      <button
        onClick={onSkip}
        className="absolute bottom-2 left-2 bg-pink-400 text-white text-xs px-2 py-1 rounded"
      >
        Exit X
      </button>
      <button
        onClick={onNext}
        className="absolute bottom-2 right-2 bg-blue-500 text-white text-md px-2 py-1 rounded"
      >
        Next &gt;
      </button>
    </div>
  );
}
