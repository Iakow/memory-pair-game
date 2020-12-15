'use strict';

(function disableCache() {
  const thisScript = [...document.scripts].find((script) => script.src.match(/main.js/));
  thisScript.src += `?v=${new Date().toISOString()}`;
}());

/* All the images */
const IMAGES = [
  'img/mask1.png',
  'img/mask2.png',
  'img/mask3.png',
  'img/mask4.png',
  'img/mask5.png',
  'img/mask6.png',
  'img/mask7.png',
  'img/mask9.png',
  'img/mask10.png',
  'img/mask11.png',
  'img/mask12.png',
  'img/mask13.png',
  'img/mask14.png',
  'img/mask15.png',
  'img/mask16.png'
];

// must be css value
const CARD_BACK = `none`;

/* preload */
(function preloadImages() {
  const addLink = (href) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'image';

    document.head.appendChild(link);
  }

  IMAGES.forEach(item => addLink(item));
}());

const MAPPING = new Map();


function setNewGame() {
  if (MAPPING.size) {
    setNewMaping();
  } else {
    mountGame();
    setNewMaping();

    setTimeout(() => {
      alert('Время разбиратся в масках')
    }, 600);
  }

  function mountGame() {
    function createCard() {
      const cardPlace = document.createElement('div');
      cardPlace.className = 'cardPlace';

      const card = document.createElement('div');
      card.className = 'card';

      cardPlace.appendChild(card);
      return cardPlace;
    }

    const mountPoint = document.querySelector('.container');
    const fragment = document.createDocumentFragment();

    for (let i = 1; i <= 12; i++) {
      const newCard = createCard();

      fragment.appendChild(newCard);
      MAPPING.set(newCard.firstChild, null);
    }

    mountPoint.appendChild(fragment);
  }

  function setNewMaping() {
    function getImgSelection() {
      const randomImgSet = [...IMAGES].sort(() => 0.5 - Math.random()).slice(0, 6);

      const shuffledImgSet = randomImgSet.concat(randomImgSet).sort(() => 0.5 - Math.random());

      return shuffledImgSet;
    }

    function resetAnimatedCardProps(card) {
      card.style.transform = `rotateY(0deg)`;
      card.style.backgroundImage = CARD_BACK;
      card.style.visibility = 'visible';
      card.style.opacity = '100%';

      return card;
    }

    const newImgSet = getImgSelection();

    MAPPING.forEach((value, card, map) => {
      map.set(card, `url("${newImgSet.pop()}")`);
      resetAnimatedCardProps(card);
    })
  }
}

setNewGame();

//////////////////////  ANIMATION ///////////////////////////////////////////

function animateFlip(delay, freq, ...cards) {
  const getCardAngle = (card) => {
    const transformStr = card.style.transform;
    const angle = transformStr.split('(')[1].split('deg')[0];
    return +angle;
  }

  let angle = getCardAngle(cards[0]); // cards must have the same state
  const rotateDirection = angle === 0 ? 1 : -1;
  const angleIncrement = 5 * rotateDirection;

  const toggleBGimage = () => {
    cards.forEach((card) => {
      if (card.style.backgroundImage === CARD_BACK) {
        card.style.backgroundImage = MAPPING.get(card);
      } else {
        card.style.backgroundImage = CARD_BACK;
      }
    })
  }

  const animateFrame = () => {
    angle += angleIncrement;
    cards.forEach(card => card.style.transform = `rotateY(${angle}deg)`);
  }

  return new Promise((resolve, reject) => {
    const goAnimate = () => {
      const interval = setInterval(() => {
        animateFrame();

        if (Math.abs(angle) === 90) toggleBGimage();

        if (Math.abs(angle) % 180 === 0) {
          clearInterval(interval);
          resolve();
        };
      }, freq);
    };

    delay ? setTimeout(goAnimate, delay) : goAnimate();
  })
}

function animateDiscard(delay, ...cards) {
  const increment = -5;
  let opacity = 100;

  return new Promise((resolve, regect) => {
    const goAnimate = setInterval(() => {
      opacity += increment;

      cards.forEach(card => {
        card.style.opacity = `${opacity}%`
      });

      if (opacity == 0) {
        clearInterval(goAnimate);

        cards.forEach(card => {
          card.style.visibility = 'hidden';
          card.style.opacity = '100%';
        });

        resolve();
      }
    }, 10);

    delay ? setTimeout(goAnimate, delay) : goAnimate();
  })
}
////////////////////  HANDLER  //////////////////////////////////////////

function getHandler() {
  const pickedCards = [];
  const discardedCardsArr = [];
  let moves = 0;
  let startTime = Date.now();

  const pickCard = (card) => {
    pickedCards.push(card);
  }

  const checkMatch = () => {
    return pickedCards[0].style.backgroundImage === pickedCards[1].style.backgroundImage
  }

  const checkWin = () => {
    if (discardedCardsArr.length === 12) win();
  }

  const win = () => {
    const endTime = Date.now();
    const time = new Date(endTime - startTime);
    /* const seconds = time.getSeconds();
    const mins = time.getMinutes(); */
    
    setTimeout(() => {
      alert(`Congratulations!\n` +
      `Moves: ${moves}\n` +
      `Time: ${time.getMinutes()}min ${time.getSeconds()}sec`);
      
      discardedCardsArr.length = 0;
      moves = 0;
      setNewGame();
      startTime = Date.now();
    }, 20);

  }

  const openCard = (card) => {
    return animateFlip(0, 6, card);
  }

  const closeCards = () => {
    const [firstCard, secondCard] = pickedCards;
    moves++;

    animateFlip(300, 10, firstCard, secondCard)
      .then(() => {
        pickedCards.length = 0;
      });
  }

  const discardСards = () => {
    const [firstCard, secondCard] = pickedCards;

    discardedCardsArr.push(...pickedCards);
    pickedCards.length = 0;

    moves++;

    animateDiscard(100, firstCard, secondCard).then(() => checkWin());
  }

  return (e) => {
    if (e.target.className !== 'card') return;
    if (discardedCardsArr.some(card => card === e.target)) return;
    if (pickedCards.some((card) => card === e.target)) return;
    if (pickedCards.length === 2) return;

    pickCard(e.target);

    if (pickedCards.length === 1) {
      openCard(pickedCards[0]);
      return;
    }

    if (pickedCards.length === 2) {
      openCard(pickedCards[1])
        .then(() => checkMatch() ? discardСards() : closeCards());
    }
  }
}

document.querySelector('.container').addEventListener('click', getHandler());
