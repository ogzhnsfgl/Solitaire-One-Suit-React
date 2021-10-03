import './header.scss';
import React from 'react';

const Header = ({ minutes, seconds, reset }) => {
  const handleReset = () => {
    reset();
    window.location.reload();
  };

  return (
    <header>
      <div className="header-wrapper">
        <h1 className="header-wrapper-title">ONE SUIT SOLITAIRE</h1>
        <div className="control-group">
          <div className="timer-zone">
            <div className="timer-icon">
              <i class="fas fa-hourglass-half"></i>
            </div>
            {minutes / 10 >= 1 && <span>{minutes}</span>}
            {minutes / 10 < 1 && <span>0{minutes}</span>}:
            {seconds / 10 >= 1 && <span>{seconds}</span>}
            {seconds / 10 < 1 && <span>0{seconds}</span>}
          </div>
          <div className="btn-res" onClick={handleReset}>
            <i class="fas fa-sync-alt"></i>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
