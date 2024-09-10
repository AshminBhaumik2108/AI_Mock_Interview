import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const MicLevelProgressBar = ({ level }) => {
  return (
    <div className="w-full max-w-md">
      <ProgressBar now={level * 100} />
    </div>
  );
};

export default MicLevelProgressBar;
