import cardInfo from '../utils/cardInfo.json';
import * as _ from 'lodash';

/* Populate cards when the game starting */
export const populateOneSuitCards = () => {
  let cards = [],
    decks;
  /* Create cards array with 8x13 = 104 spade cards */
  cardInfo['rank'].forEach((rank) => {
    for (let i = 1; i <= 8; i++) {
      cards.push({
        rank: rank,
        suit: 'spade',
        deck: i,
        isDown: true,
        isSelected: false,
        isHighlighted: false,
      });
    }
  });
  /* Create decks */
  let shuffledCards = _.shuffle(cards);
  shuffledCards = _.shuffle(shuffledCards);
  /* Create 10 arrays that each has 5 cards from first 50 cards */
  decks = _.chunk(shuffledCards.slice(0, 50), 5);
  /* last 54 cards are placed decks[10] for using as stock */
  decks[10] = shuffledCards.slice(50);
  /* Faced-up last cards of arrays */
  for (let i = 0; i <= 9; i++) {
    decks[i][decks[i].length - 1].isDown = false;
  }
  /* return decks and cards in order to use at state */
  return {
    decks: decks,
    cards: shuffledCards,
  };
};

/* Check selected card/cards can be movable or not */
export const checkMovable = (card, deck) => {
  let tempDeck = [...deck];

  /* Get card list that is trying to be select  */
  let movingCards = tempDeck.slice(deck.indexOf(card));

  /* Get ranks of movingCards */
  const ranks = movingCards.map((card) => getRank(card));

  let currentRank = getRank(card);
  /* If selected card is last card of its deck if placed below
  turn false because of (number - undefined !== 1)
  */
  for (let i = 1; i < ranks.length; i++) {
    if (currentRank - ranks[i] !== 1) return false;
    currentRank = ranks[i];
  }
  return true;
};

/* Get card rank as number */
const getRank = (card) => {
  switch (card.rank) {
    case 'A':
      return 1;
    case 'J':
      return 11;
    case 'Q':
      return 12;
    case 'K':
      return 13;
    default:
      return parseInt(card.rank);
  }
};

/* Remove all selections from game state */
export const removeSelection = (game, setGame) => {
  ('object');
  if (game.SelectCard !== '' || game.highligtedCard !== '') {
    let tempDecks = [...game.decks];
    tempDecks.forEach((deck) => {
      for (let i = 0; i < deck.length; i++) {
        deck[i].isSelected = false;
        deck[i].isHighlighted = false;
      }
    });
    setGame((prev) => ({
      ...prev,
      selected: [],
      decks: tempDecks,
      selectedCard: '',
      selectedDeck: '',
      highlightedCard: '',
      highlightedDeck: '',
    }));
  }
};

/* Check move is valid or not? */
export const checkMove = (card, deck, game) => {
  const toCard = card;
  const fromCard = game.selectedCard;

  if (
    getRank(toCard) - getRank(fromCard) === 1 &&
    toCard.suit === fromCard.suit &&
    deck.indexOf(toCard) === deck.length - 1
  ) {
    return true;
  }

  return false;
};

export const moveCard = (fromCard, fromDeck, toDeck, game, setGame) => {
  let tempDecks = [...game.decks];
  let toDeckIndex = tempDecks.indexOf(toDeck);
  let fromDeckIndex = tempDecks.indexOf(fromDeck);
  let fromCardIndex = tempDecks[fromDeckIndex].indexOf(fromCard);

  /* Get selected cards to transfer and delete them from old deck */
  let selectedCards = tempDecks[fromDeckIndex].splice(fromCardIndex);

  /* Transfer selected cards to new deck */
  selectedCards.forEach((card) => {
    tempDecks[toDeckIndex].push(card);
  });

  /* Face up last card of old deck */
  if (tempDecks[fromDeckIndex].length !== 0) {
    tempDecks[fromDeckIndex][
      tempDecks[fromDeckIndex].length - 1
    ].isDown = false;
  }

  /* Set the new state to game */
  setGame((prev) => ({
    ...prev,
    decks: tempDecks,
  }));
};

export const dealingStockCards = (game, setGame) => {
  if (game.decks[10].length !== 0) {
    let totalFaceUpCard = 0;
    game.decks.forEach((deck) =>
      deck.forEach((card) =>
        card.isDown === false ? (totalFaceUpCard += 1) : totalFaceUpCard
      )
    );
    let totalEmptyHolder = 0;
    game.decks.forEach((deck) =>
      _.isEmpty(deck) ? totalEmptyHolder + 1 : totalEmptyHolder
    );
    if (totalEmptyHolder > totalFaceUpCard) {
      alert('All slots must have at least one card to dealing!');
      return;
    }
    const tempDecks = [...game.decks];
    for (let i = 0; i <= 9; i++) {
      if (tempDecks[10].length > 0) {
        let tempCard = tempDecks[10].pop();
        tempCard.isDown = false;
        tempDecks[i].push(tempCard);
      }
      checkCompleted(game.decks[i], game, setGame);
    }
    setGame((prev) => ({
      ...prev,
      decks: tempDecks,
    }));
  }
};

export const checkDeck = (deck) => {
  const ranks = deck.map((card) => getRank(card));
  const expectedDeck = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  if (_.isEqual(expectedDeck, ranks.slice(-13))) {
    return ranks.length - 13;
  }
  return false;
};

export const checkCompleted = (deck, game, setGame) => {
  const completedLen = checkDeck(deck);
  if (completedLen !== false) {
    let tempDecks = [...game.decks];
    let tempDeckInx = game.decks.indexOf(deck);
    tempDecks[tempDeckInx].splice(completedLen);
    let currentHand = game.hands + 1;
    if (tempDecks[tempDeckInx].length !== 0)
      tempDecks[tempDeckInx][tempDecks[tempDeckInx].length - 1].isDown = false;
    setGame((prev) => ({
      ...prev,
      decks: tempDecks,
      hands: currentHand,
    }));
    if (currentHand === 8) {
      alert('WIN!');
    }
  }
};

export const selectCard = (card, deck, holder, game, setGame) => {
  let tempCard = card;
  if (game.selectedCard === '') {
    /* Selected card state is empty. Check and then add card/cards to selected state */

    /* Check the status of card trying to select (is down? or is holder?)  */
    if (holder) {
      return;
    }
    if (card.isDown) {
      return;
    }
    /* Card is not down or holder. Mark it as selected */
    if (checkMovable(card, deck)) {
      tempCard.isSelected = true;
      let tempDeck = [...deck];
      let selectedCards = tempDeck.slice(deck.indexOf(card));
      selectedCards.forEach((card) => (card.isSelected = true));
      setGame((prev) => ({
        ...prev,
        selected: selectedCards,
        selectedCard: card,
        selectedDeck: deck,
      }));
    }
  } else {
    /* Selected card state is not empty.
    Check then move cards properly */
    if (holder) {
      /* Move cards to empty holder */
      moveCard(game.selectedCard, game.selectedDeck, deck, game, setGame);
      checkCompleted(deck, game, setGame);
      removeSelection(game, setGame);
    } else {
      /* Check move is valid and then move them to new deck */
      if (checkMove(card, deck, game)) {
        /* MoveCard */
        moveCard(game.selectedCard, game.selectedDeck, deck, game, setGame);
        checkCompleted(deck, game, setGame);
      }
      removeSelection(game, setGame);
    }
  }
};
