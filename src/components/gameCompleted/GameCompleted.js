import React, { useEffect } from 'react';
import './index.scss';

const GameCompleted = ({ minutes, seconds, reset, pause }) => {
  const handleReset = () => {
    reset();
    window.location.reload();
  };

  useEffect(() => {
    pause();
  }, []);
  return (
    <div className="completed-container">
      <div className="completed-wrapper">
        <div className="completed-text">Congratulations! Game Completed! </div>
        <div className="completed-text">
          Total time: {minutes / 10 >= 1 && <span>{minutes}</span>}
          {minutes / 10 < 1 && <span>0{minutes}</span>}:
          {seconds / 10 >= 1 && <span>{seconds}</span>}
          {seconds / 10 < 1 && <span>0{seconds}</span>}{' '}
        </div>
        <div className="completed-btn">
          <button onClick={handleReset}>Restart</button>
        </div>
      </div>
    </div>
  );
};

export default GameCompleted;
