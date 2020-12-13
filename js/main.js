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
// must be css 
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
////////////////////////////////////////////////////////////////////////



/* newGame должна перенастраивать SETTING а не клепать новые элементы */



const SETTING = new Map();

let startTime;

const newGame = () => {
  const getImgSelection = () => {
    const randomImgSet = [...images].sort(() => 0.5 - Math.random()).slice(0, 6);

    const shuffledImgSet = randomImgSet.concat(randomImgSet).sort(() => 0.5 - Math.random());

    return shuffledImgSet;
  }

  cardFaces = getImgSelection();

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
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();

  cardFaces.forEach((img, index) => {
    const newCard = createCard(index);

    fragment.appendChild(newCard);
    SETTING.set(newCard.firstChild, `url("${img}")`);
  });

  container.appendChild(fragment);

  startTime = Date.now();
}

newGame();

//////////////////////  ANIMATION ///////////////////////////////////////////

const animateFlip = (delay, freq, ...cards) => {
  const getCardAngle = (card) => {
    const transformStr = card.style.transform;
    const angle = transformStr.split('(')[1].split('deg')[0];
    return +angle;
  }

  let angle = getCardAngle(cards[0]); // мож чекнуть?
  const direction = angle === 0 ? 1 : -1;
  const angleIncrement = 5 * direction;

  const toggleBGimage = () => {
    cards.forEach((card) => {
      if (card.style.backgroundImage === cardBack) {
        card.style.backgroundImage = SETTING.get(card);
      } else {
        card.style.backgroundImage = cardBack;
      }
    })
  }

  return new Promise((resolve, reject) => {
    const animateFrame = () => {
      angle += angleIncrement;
      cards.forEach(card => card.style.transform = `rotateY(${angle}deg)`);
    }

    const goAnimate = () => {
      const interval = setInterval(() => {
        cards.forEach(card => animateFrame(card));

        if (Math.abs(angle) === 90) {
          toggleBGimage();
        }

        if (Math.abs(angle) % 180 === 0) {
          clearInterval(interval);
          resolve();
        };
      }, freq);
    };

    delay ? setTimeout(goAnimate, delay) : goAnimate();
  })
}

const animateDiscard = (...cards) => {
  return new Promise((resolve, regect) => {
    increment = -5;
    opacity = 100;

    const interval = setInterval(() => {
      opacity += increment;
      cards.forEach(card => card.style.opacity = `${opacity}%`);

      if (opacity == 0) {
        clearInterval(interval);
        cards.forEach(card => {
          card.style.display = 'none';
          card.style.opacity = '100%';
        });
        resolve();
      }
    }, 20);
  })
}



////////////////////  HANDLER  //////////////////////////////////////////


const getHandler = () => {
  let pickedCards = [];

  let discardedCards = 0;
  let moves = 0;

  const pickCard = (card) => {
    pickedCards.push(card);
  }

  const checkMatch = () => {
    /* надо сравнивать  */
    return pickedCards[0].style.backgroundImage === pickedCards[1].style.backgroundImage
  }

  const checkWin = () => {
    if (discardedCards === 12) win(); // возможно здесь проблема, т.к. нет 12
  }

  const win = () => {
    const endTime = Date.now();

    const time = new Date(endTime - startTime);

    const seconds = time.getSeconds();
    const mins = time.getMinutes();

    alert(`Congratulations!\n` +
      `Moves: ${moves}\n` +
      `Time: ${mins}min ${seconds}sec`);

    newGame();
  }

  const openCard = (card) => {
    return animateFlip(0, 6, card);
  }
/* должна быть возможность нажать на другую карту, пока эти закрываются, но не на одну из этих, т.е. нельзя анимировать карту, у которой угол в [0:180] */
  const closeCards = () => {
    const [firstCard, secondCard] = pickedCards;

    animateFlip(300, 10, firstCard, secondCard)
      .then(() => {
        pickedCards.length = 0;
        moves++;

      });
  }

  const discardСards = () => {
    const [firstCard, secondCard] = pickedCards;
    animateDiscard(firstCard, secondCard)
      .then(() => {
        /* здесь надо разблочивать не все карты, кроме анимируемых */
        discardedCards += 2;
        pickedCards.length = 0;

      })
      .then(() => checkWin());
  }

  return (e) => {
    /* как только pickedCards обнулен, карту можно пикать снова */
    if (e.target.className !== 'card') return;
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
