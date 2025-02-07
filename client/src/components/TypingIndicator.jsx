// For chat visual effect, when waiting for OpenAI Assistant API to respond, show three dot "waiting" animation
import React from "react";

const TypingIndicator = () => {
  return (
    <div className="flex space-x-1">
      <div className="animate-appear-delay1 text-lg">.</div>
      <div className="animate-appear-delay2 text-lg">.</div>
      <div className="animate-appear-delay3 text-lg">.</div>
    </div>
  );
};

export default TypingIndicator;
