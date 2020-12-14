'use strict'

/* CACH HACK */
const src = document.scripts[0].src;
document.scripts[0].setAttribute('src', src + `?v=${new Date().toISOString()}`)

/* All the images */
const images = [
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
const cardBack = `none`;

/* preload */
const preloadImages = () => {
  const addLink = (href) => {
    const link = document.createElement('link');

    link.setAttribute('rel', 'preload');
    link.setAttribute('href', href);
    link.setAttribute('as', 'image');

    document.head.appendChild(link);
  }

  images.forEach(item => addLink(item));
};

preloadImages();

///////////////////////////////// DOM ///////////////////////////////////////

const newImgSelection = () => {
  const randomImgSet = [...images].sort(() => 0.5 - Math.random()).slice(0, 6);

  const shuffledImgSet = randomImgSet.concat(randomImgSet).sort(() => 0.5 - Math.random());

  return shuffledImgSet;
}
/* newGame должна перенастраивать SETTING а не клепать новые элементы */

const SETTING = new Map();

let startTime;

/* монтируем сразу в дом и в Мап как сейчас */

const mountCads = () => {
  const cardFaces = newImgSelection();

  const createCard = () => {
    const cardPlace = document.createElement('div');
    cardPlace.className = 'cardPlace';

    const card = document.createElement('div');
    card.className = 'card';
    card.style.transform = `rotateY(0deg)`;
    card.style.backgroundImage = cardBack;

    cardPlace.appendChild(card);
    return cardPlace;
  }

  const container = document.querySelector('.container');
  container.innerHTML = ''; //удалить

  const fragment = document.createDocumentFragment();
  cardFaces.forEach((img, index) => {
    const newCard = createCard(index);

    fragment.appendChild(newCard);
    SETTING.set(newCard.firstChild, `url("${img}")`);
  });


  container.appendChild(fragment);

  startTime = Date.now();
}

mountCads();

const newGame = () => {
  mountCads();
};



//////////////////////  ANIMATION ///////////////////////////////////////////

const animateFlip = (delay, freq, ...cards) => {
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
      if (card.style.backgroundImage === cardBack) {
        card.style.backgroundImage = SETTING.get(card);
      } else {
        card.style.backgroundImage = cardBack;
      }
    })
  }

  const animateFrame = () => {
    cards.forEach(card => card.style.transform = `rotateY(${angle}deg)`);
    angle += angleIncrement;
  }

  return new Promise((resolve, reject) => {
    console.log(cards)

    
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

const animateDiscard = (delay, ...cards) => {
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

const getHandler = () => {
  const pickedCards = [];
  const discardedCardsArr = [];
  let moves = 0;

  const pickCard = (card) => {
    pickedCards.push(card);
  }

  const checkMatch = () => {
    return pickedCards[0].style.backgroundImage === pickedCards[1].style.backgroundImage
  }

  const checkWin = () => {
    if (discardedCardsArr.length === 12) win(); // возможно здесь проблема, т.к. нет 12
  }

  const win = () => { // alert and newGame
    const endTime = Date.now();
    const time = new Date(endTime - startTime);
    const seconds = time.getSeconds();
    const mins = time.getMinutes();

    setTimeout(() => {
      alert(`Congratulations!\n` +
        `Moves: ${moves}\n` +
        `Time: ${mins}min ${seconds}sec`);

      discardedCardsArr.length = 0;
      newGame();
    }, 20)
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
    moves++;
    discardedCardsArr.push(...pickedCards);
    pickedCards.length = 0;

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
