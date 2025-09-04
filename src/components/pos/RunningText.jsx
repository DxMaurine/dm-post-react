import './RunningText.css';
import React from 'react';

const RunningText = ({ text, bgColor, textColor, className }) => {
  // Jika tidak ada teks, jangan render marquee untuk menghemat resource.
  if (!text) {
    return <div className={`running-text-container ${className}`}></div>;
  }

  // Duplikasi teks agar efek marquee terlihat mulus
  const extendedText = (text + ' • ').repeat(5);

  return (
    <div className={`running-text-container ${className} ${bgColor} ${textColor}`}>
      <div className="running-text-content">
        <p>{extendedText}</p>
      </div>
    </div>
  );
};

export default RunningText;