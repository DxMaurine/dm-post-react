import React from 'react';
import './LineProgressBar.css';

const LineProgressBar = ({ loading }) => {
  return (
    <div className="line-progress-container">
      {loading && <div className="line-progress-bar line-progress-bar--indeterminate"></div>}
    </div>
  );
};

export default LineProgressBar;
