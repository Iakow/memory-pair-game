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
      alert([
        'It\'s time to learn to distinguish between masks!',
        'Well you know what to do... :)'
      ].join('\n\n'))
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
      card.style.boxShadow = '';

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
  const increment = -1;
  let opacity = 100;

  cards.forEach((card) => card.style.boxShadow = "0px 0px 48px 16px rgba(54,49,255,0.33), 0px 0px 28px 3px rgba(0,0,0,0.4)")

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
    }, 8);

    delay ? setTimeout(goAnimate, delay) : goAnimate();
  })
}
////////////////////  HANDLER  //////////////////////////////////////////

function getHandler() {
  const pickedCards = [];
  const discardedCards = [];
  let moves = 0;
  let startTime = Date.now();
  let bestScore = 0;

  const checkMatch = () => {
    return pickedCards[0].style.backgroundImage === pickedCards[1].style.backgroundImage
  }

  const checkWin = () => {
    if (discardedCards.length === 12) {
      const time = new Date(Date.now() - startTime);
      const currentScore = Math.round(100000000 / (moves * time));
      
      let comment;
      let pastBestScore = bestScore;

      if (!bestScore) {
        bestScore = currentScore;
        comment = 'Congratulations!'
      } else {
        if (bestScore > currentScore) {
          comment = 'You can better...'
        } else {
          comment = 'This is your new record!!!' /////////////
          bestScore = currentScore;
        }
      }

      setTimeout(() => {
        alert([
          pastBestScore ? `Best result: ${pastBestScore}` : '',
          '',
          comment,
          `Moves: ${moves}`,
          `Time: ${time.getMinutes()}min ${time.getSeconds()}sec`,
          `Score: ${currentScore}`
        ].join('\n'));

        discardedCards.length = 0;
        moves = 0;

        setNewGame();
        startTime = Date.now();
      }, 20);
    };
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
    

    discardedCards.push(...pickedCards);
    pickedCards.length = 0;

    moves++;

    return animateDiscard(100, firstCard, secondCard);
  }

  return (e) => {
    if (e.target.className !== 'card') return;
    if (discardedCards.some(card => card === e.target)) return;
    if (pickedCards.some((card) => card === e.target)) return;
    if (pickedCards.length === 2) return;
    window.navigator.vibrate(50);

    pickedCards.push(e.target);

    if (pickedCards.length === 1) { // а если discardedCards === 10, надо найти и открыть вторую
      openCard(pickedCards[0]);
      return;
    }

    if (pickedCards.length === 2) {
      openCard(pickedCards[1])
        .then(() => checkMatch()
          ? discardСards().then(() => checkWin())
          : closeCards());
    }
  }
}

document.querySelector('.container').addEventListener('click', getHandler());
