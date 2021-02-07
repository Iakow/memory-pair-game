import { renderNewGame, animateOpen, animateClose, animateDiscard} from "./render.js";
import {IMAGES, GAME_SIZE} from "./config.js"

let closedCards;
let openedCards;

setNewGame();

function setNewGame () {
  selectNewImages();
  renderNewGame();
  openedCards = [];

  function selectNewImages() {
    const randomImgSet = [...IMAGES]
    .sort(() => 0.5 - Math.random())
    .slice(0, GAME_SIZE / 2);
    
    closedCards = [...randomImgSet, ...randomImgSet].sort(() => 0.5 - Math.random());
  }
}

function openCard(index) {
  openedCards.push(closedCards[index]);
  animateOpen(index, closedCards[index]);
  // а как я узнаю, что осталась одна?
}

function closePair() {
  animateClose(openedCards[0]);
  animateClose(openedCards[1]);
  openedCards = []; // когда анимашка закончится
}

function discardPair() {
  animateDiscard();
  closedCards = closedCards.filter(card => card !== openedCards[0]);
  openedCards = []; // когда анимашка закончится
}

function pickCard(index) {
  if (openedCards.length < 2) {
    openCard(index);
    if(openedCards.length === 2) {
      if (openedCards[0] !== openedCards[1]) {
        setTimeout(closePair, 600);
      } else {
        setTimeout(discardPair, 300)
      }
    }
    
  } else if (openedCards.length === 2) {
    // чекаем: перевернуть или отбросить
    
    console.log(openedCards);
    console.log(openedCards[0] === openedCards[1]);
  }
}

export { pickCard };
