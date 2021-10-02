import React, { useEffect, useState } from 'react';
import './card.scss';
import cardTemplate from '../../utils/cardInfo.json';

const Card = ({ card, isSelected, isDown, isHighlighted }) => {
  const [isSelectedState, setSelected] = useState('');
  const [isDownState, setDown] = useState('');
  const [isHighlightedState, setHighlighted] = useState('');

  useEffect(() => {
    isDown ? setDown('card__down') : setDown('card-faceup ' + card.suit);
    isSelected ? setSelected('card__selected') : setSelected('');
    isHighlighted ? setHighlighted('card__highlighted') : setHighlighted('');
  }, [card.suit, isSelected, isHighlighted, isDown]);

  return (
    <div
      className={`card ${isDownState} ${isSelectedState} ${isHighlightedState}`}
    >
      <div className={`card__content card__rank card__rank-left`}>
        {card.rank}
      </div>
      <div className={`card__content card__suite card__suite-left`}>
        {cardTemplate['icon'][card.suit]}
      </div>
      <div className={`card__content card__rank card__rank-right`}>
        {card.rank}
      </div>
      <div className={`card__content card__suite card__suite-right`}>
        {cardTemplate['icon'][card.suit]}
      </div>
    </div>
  );
};

export default Card;
