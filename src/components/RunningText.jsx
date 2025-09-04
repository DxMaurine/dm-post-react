import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';
import React from 'react';

const RunningText = ({ className }) => {
  const { settings } = useContext(SettingsContext);
  const { 
    runningText, 
    runningTextBgColor, 
    runningTextTextColor, 
    runningTextSpeed 
  } = settings;

  if (!runningText) {
    return null;
  }

  const containerStyle = {
    backgroundColor: runningTextBgColor,
    padding: '8px 0',
    margin: '0 16px',
    borderRadius: '4px',
  };
  
  const textStyle = {
    color: runningTextTextColor,
    animationDuration: `${runningTextSpeed || 20}s`,
  };

  return (
    <div 
      className={`relative flex overflow-hidden ${className}`}
      style={containerStyle}
    >
      <p 
        className="animate-marquee whitespace-nowrap px-4"
        style={textStyle}
      >
        {runningText}
      </p>
      <p 
        className="animate-marquee2 absolute top-0 whitespace-nowrap px-4"
        style={textStyle}
      >
        {runningText}
      </p>
    </div>
  );
};

export default RunningText;