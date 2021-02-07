import { handler } from "./controller.js";
import {GAME_SIZE, OPEN_DURATION, CLOSING_DURATION, HIDING_DURATION} from "./config.js"

const container = document.querySelector('.container');
container.style.setProperty('--open-duration', OPEN_DURATION + 'ms');
container.style.setProperty('--closing-duration', CLOSING_DURATION + 'ms');
container.style.setProperty('--hiding-duration', HIDING_DURATION + 'ms')

function renderNewGame() {
  const gameContainer = document.querySelector(".container");
  gameContainer.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (let i = 1; i <= GAME_SIZE; i++) {
    const newCard = createCard();
    fragment.appendChild(newCard);
  }

  gameContainer.appendChild(fragment);
  gameContainer.addEventListener("click", handler);

  function createCard() {
    const cardPlace = document.createElement("div");
    cardPlace.className = "cardPlace";

    const card = document.createElement("div");
    card.className = "card";
    cardPlace.appendChild(card);

    return cardPlace;
  }
}

function animateOpen(cardIndex, image) {
  const card = document.querySelectorAll(".card")[cardIndex];
  card.classList.add("open");

  card.style.backgroundImage = `none, url("./img/${image}")`;
}

function animateClose(image) {
  const card = [...document.querySelectorAll(".card")].find((item) =>
    item.style.backgroundImage.includes(image)
  );

  card.classList.add("closing");
  card.classList.remove("open");

  function closeCard(e) {
    if (e.propertyName === "transform") {
      e.target.classList.remove("closing");
      e.target.removeAttribute("style");
      e.target.removeEventListener("transitionend", closeCard);
    }
  }

  card.addEventListener("transitionend", closeCard);
}

function animateDiscard() {
  /* хуево опираться на класс */
  const openedCards = document.querySelectorAll(".open");

  openedCards.forEach((openedCard) => {
    openedCard.classList.add("hiding");
    openedCard.addEventListener("transitionend", removeCard);

    function removeCard(e) {
      if (e.propertyName === "opacity") {
        //openedCard.style.display = "none";
        //openedCard.classList.remove("hiding");
        //openedCard.removeEventListener("transitionend", removeCard);
        openedCard.remove();
      }
    }

  });
}

export { animateOpen, renderNewGame, animateClose, animateDiscard };
