import cardInfo from '../utils/cardInfo.json';
import _ from 'lodash';

export const startGame = (cards, decks) => {
  const shuffledCards = _.shuffle(cards);
  let lastIndex = 0;
  for (let i = 0; i < 7; i++) {
    let tempDeck = shuffledCards.slice(lastIndex, lastIndex + i + 1);
    tempDeck.forEach((card) => (card.deck = i));
    decks[i] = tempDeck;
    lastIndex += i + 1;
  }

  decks[7] = shuffledCards.slice(28);
  for (let i = 0; i < 7; i++) {
    decks[i][decks[i].length - 1].isDown = false;
  }

  return { decks, cards };
};

export const createCards = () => {
  const cards = [];
  const decks = [];

  cardInfo['rank'].forEach((rank) =>
    cardInfo['suit'].forEach((suit) => {
      switch (suit) {
        case 'heart':
        case 'diamond':
          cards.push({
            rank,
            color: 'red',
            isDown: true,
            isSelected: false,
            suit,
            deck: 7,
            place: 'normal',
          });
          break;

        case 'club':
        case 'spade':
          cards.push({
            rank,
            color: 'black',
            isDown: true,
            isSelected: false,
            suit,
            deck: 7,
            place: 'normal',
          });
          break;
        default:
          break;
      }
    })
  );
  const value = startGame(cards, decks);
  return value;
};

export const cardSelect = (card, game, setGame, deckId, cardId) => {
  let tempDeck = [...game.decks];
  let tempSelected = [...game.selectedCards];
  let tempDealing = [...game.dealingCards];

  if (tempSelected.indexOf(card) !== -1) {
    removeSelection(game, setGame);
    return;
  }

  if (card.place === 'dealing') {
    tempDealing[tempDealing.length - 1].isSelected = true;
    tempSelected.push(card);
  } else {
    let selected = tempDeck[deckId][cardId];
    if (selected.isDown === false) {
      selected.isSelected = !selected.isSelected;
      tempSelected.push(card);
    }
  }

  // ;
  let fromDeck;
  if (tempSelected[0] !== undefined && tempSelected[0].place !== 'dealing') {
    fromDeck = game.decks[tempSelected[0].deck];
    if (
      fromDeck[fromDeck.length - 1] !== tempSelected[0] &&
      game.selectedCards.length !== 0
    ) {
      const selectedCardIndex = fromDeck.indexOf(tempSelected[0]);
      const cardList = fromDeck.slice(selectedCardIndex);

      cardList.forEach((card, index) => {
        // ;
        checkMove(game, setGame, tempSelected);
        tempSelected[0] = cardList[index + 1];
        tempSelected[1] = cardList[index];
      });
      return;
    }
  }

  if (tempSelected.length === 2) {
    checkMove(game, setGame, tempSelected);
  } else {
    setGame((prev) => ({
      ...prev,
      decks: tempDeck,
      selectedCards: tempSelected,
      dealingCards: tempDealing,
    }));
  }
};

const checkMove = (game, setGame, tempSelected) => {
  const fromCard = tempSelected[0];
  const toCard = tempSelected[1];
  const fromRank = getRank(fromCard);
  const toRank = getRank(toCard);
  const toDeck = game.decks[toCard.deck];

  if (toDeck[toDeck.length - 1] !== toCard) {
    return;
  }

  // if (fromRank - toRank === 1 && toCard.suit === fromCard.suit) {
  const toDeckIndex = toCard.deck;
  const fromDeckIndex = fromCard.deck;
  MoveCard(fromCard, game, setGame, fromDeckIndex, toDeckIndex);
  removeSelection(game, setGame);
  // }
};

const removeSelection = (game, setGame) => {
  let tempDecks = [...game.decks];
  for (let i = 0; i < tempDecks.length; i++) {
    for (let j = 0; j < tempDecks[i].length; j++) {
      tempDecks[i][j].isSelected = false;
    }
  }
  const emptyArr = [];
  setGame((prev) => ({ ...prev, decks: tempDecks, selectedCards: emptyArr }));
};

const MoveCard = (fromCard, game, setGame, fromDeckIndex, toDeckIndex) => {
  if (toDeckIndex === 7 || game.selectedCards[0].place === 'foundation') {
    return;
  }

  try {
    let newDecks = [...game.decks];
    let fromCardIndex = game.decks[fromDeckIndex].indexOf(fromCard);

    newDecks[fromDeckIndex].splice(fromCardIndex, 1);

    if (newDecks[fromDeckIndex].length !== 0) {
      newDecks[fromDeckIndex][
        newDecks[fromDeckIndex].length - 1
      ].isDown = false;
    }
    fromCard.deck = toDeckIndex;
    newDecks[toDeckIndex].push(fromCard);
    if (fromDeckIndex === 7) {
      let tempDealing = [...game.dealingCards];
      tempDealing.pop();
      newDecks[toDeckIndex][newDecks[toDeckIndex].length - 1].place = 'normal';
      setGame((prev) => ({
        ...prev,
        decks: newDecks,
        dealingCards: tempDealing,
      }));
    } else {
      setGame((prev) => ({ ...prev, decks: newDecks }));
    }
  } catch (error) {}
};

const getRank = (card) => {
  switch (card.rank) {
    case 'A':
      return 1;
      break;
    case 'J':
      return 11;
      break;
    case 'Q':
      return 12;
      break;
    case 'K':
      return 13;
      break;

    default:
      return parseInt(card.rank);
      break;
  }
};

export const dealCardFromStock = (game, setGame) => {
  let tempStock = [...game.stock];
  let tempDeailingCards = [...game.dealingCards];

  if (tempStock.length === 0 && tempDeailingCards.length > 0) {
    tempDeailingCards.reverse();
    tempStock = tempDeailingCards;
    tempDeailingCards = [];
    tempDeailingCards.push(tempStock[tempStock.length - 1]);
    tempStock.pop();
    tempStock.forEach((card) => (card.place = 'stock'));
  } else {
    tempStock[0].place = 'dealing';
    tempDeailingCards.push(tempStock[0]);
    tempDeailingCards[tempDeailingCards.length - 1].isDown = false;
    tempStock.shift();
  }

  setGame((prev) => ({
    ...prev,
    dealingCards: tempDeailingCards,
    stock: tempStock,
  }));
};

export const foundationSelect = (game, setGame, foundationIndex) => {
  if (game.selectedCards.length < 1) {
    return;
  }

  let selectedCard = game.selectedCards[0];
  const fromDeck = game.decks[selectedCard.deck];

  if (
    _.isEmpty(game.foundation[foundationIndex]) &&
    selectedCard.rank === 'A'
  ) {
    if (selectedCard.deck !== 7 && fromDeck[fromDeck - 1 !== selectedCard]) {
      const selectedCardIndex = fromDeck.indexOf(selectedCard);
      const cardList = fromDeck.slice(selectedCardIndex);
      cardList.forEach((card, index) => {
        let selectedCard = card;
        moveCardFoundation(game, setGame, foundationIndex, selectedCard);
      });
    } else {
      moveCardFoundation(game, setGame, foundationIndex, selectedCard);
    }
  } else if (!_.isEmpty(game.foundation[foundationIndex])) {
    let cardAtFoundation = game.foundation[foundationIndex];
    let selectedRank = getRank(selectedCard);
    let foundationCardRank = getRank(cardAtFoundation);
    if (
      foundationCardRank < selectedRank &&
      cardAtFoundation.suit === selectedCard.suit
    ) {
      if (selectedCard.deck !== 7 && fromDeck[fromDeck - 1 !== selectedCard]) {
        const selectedCardIndex = fromDeck.indexOf(selectedCard);
        const cardList = fromDeck.slice(selectedCardIndex);
        cardList.forEach((card, index) => {
          let selectedCard = card;
          moveCardFoundation(game, setGame, foundationIndex, selectedCard);
        });
      } else {
        moveCardFoundation(game, setGame, foundationIndex, selectedCard);
      }
    }
  }
};

function moveCardFoundation(game, setGame, foundationIndex, selectedCard) {
  const newFoundation = [...game.foundation];
  let oldPlaceOfCard = selectedCard.place;
  selectedCard.place = 'foundation';
  newFoundation[foundationIndex] = selectedCard;
  let tempDecks = [...game.decks];
  let tempDealingCards = [...game.dealingCards];
  removeSelection(game, setGame);
  try {
    switch (oldPlaceOfCard) {
      case 'normal':
        tempDecks[selectedCard.deck].pop();
        tempDecks[selectedCard.deck][
          tempDecks[selectedCard.deck].length - 1
        ].isDown = false;
        break;
      case 'foundation':
        tempDealingCards.pop();
        break;

      default:
        break;
    }
  } catch (error) {
    console.log(error);
  }

  const selectedCards = [];
  setGame((prev) => ({
    ...prev,
    foundation: newFoundation,
    selectedCards,
    decks: tempDecks,
    dealingCards: tempDealingCards,
  }));
  checkWin(game);
}

export const checkWin = (game) => {
  if (game.decks.forEach((item) => _.isEmpty(item))) {
    alert('Tebrikler');
  }
};
