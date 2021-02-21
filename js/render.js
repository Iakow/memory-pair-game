import { handler } from "./controller.js";
import { GAME_SIZE, IMAGES } from "./config.js";

(function preloadImages() {
  IMAGES.forEach((image) => addLink(`img/${image}`));

  function addLink(path) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = path;
    link.as = "image";

    document.head.appendChild(link);
  }
})();

const cardCheckingPause = 600;

// анимации должны очищать все

function greeting() {
  setTimeout(() => {
    alert(
      "It's time to learn to distinguish between masks!\n\n " +
        "Well you know what to do... :)"
    );
  }, 500);
}

function mountGame() {
  const gameContainer = document.querySelector(".container");
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < GAME_SIZE; i++) {
    fragment.appendChild(createCard(i));
  }

  gameContainer.appendChild(fragment);
  gameContainer.addEventListener("click", handler);

  function createCard(id) {
    const cardPlace = document.createElement("div");
    cardPlace.classList.add("cardPlace");

    const card = document.createElement("div");
    card.classList.add("card");
    card.id = id;
    cardPlace.appendChild(card);

    return cardPlace;
  }
}

function showResults(time, moves, score, bestScore) {
  let comment;

  if (bestScore === 0) {
    comment = "Congratulations! Now try to improve your result!";
  } else {
    if (bestScore > score) {
      comment = "You can better...";
    } else {
      comment = "This is your new record!!!";
    }
  }

  alert(
    [
      `Best result: ${bestScore}`,
      "",
      comment,
      `Moves: ${moves}`,
      `Time: ${time.getMinutes()}min ${time.getSeconds()}sec`,
      `Score: ${score}`,
    ].join("\n")
  );
}

function showCards() {
  document
    .querySelectorAll(".card")
    .forEach((card) => card.removeAttribute("style"));
}

function animateOpen(cardID, image) {
  const card = document.getElementById(cardID);
  card.classList.add("open");
  card.style.backgroundImage = `none, url("./img/${image}")`;
}

function animateClose(...cardsID) {
  return new Promise((resolve) => {
    const pause = setTimeout(() => {
      resolve();

      cardsID.forEach((cardID) => {
        const card = document.getElementById(cardID);

        card.classList.add("closing");
        card.classList.remove("open");
        card.addEventListener("transitionend", clear);
      });

      function clear(e) {
        if (e.propertyName === "transform") {
          e.target.classList.remove("closing");
          e.target.removeAttribute("style");
          e.target.removeEventListener("transitionend", clear);
          clearInterval(pause);
        }
      }
    }, cardCheckingPause);
  });
}

function animateDiscard(...cardsID) {
  return new Promise((resolve) => {
    const interval = setTimeout(() => {
      cardsID.forEach((cardID) => {
        resolve();

        const openedCard = document.getElementById(cardID);

        openedCard.classList.add("hiding");
        openedCard.classList.remove("open");
        openedCard.addEventListener("transitionend", removeCard);

        function removeCard(e) {
          if (e.propertyName === "opacity") {
            openedCard.style.display = "none";
            openedCard.classList.remove("hiding");
            openedCard.removeEventListener("transitionend", removeCard);
            clearInterval(interval);
          }
        }
      });
    }, cardCheckingPause);
  });
}

export {
  animateOpen,
  mountGame,
  animateClose,
  animateDiscard,
  showCards,
  greeting,
  showResults,
};
