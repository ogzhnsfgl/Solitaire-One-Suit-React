import React, { useEffect, useState } from 'react';

const CardHolder = ({ isHighligted }) => {
  const [isHighligtedState, setHighligted] = useState('');

  useEffect(() => {
    isHighligted ? setHighligted('highligted') : setHighligted('');
  }, [isHighligted]);

  return <div className={`cardholder ${isHighligtedState}`}></div>;
};

export default CardHolder;
