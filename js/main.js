{/* <link rel="preload" href="./img/Alfa_Romeo_158-159.jpg" as="image"></link> */}
const imagesConfig = [
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
  'img/mask16.png',
].sort(() => 0.5 - Math.random());

const shufleImages = [...imagesConfig.slice(0, 6), ...imagesConfig.slice(0, 6)];

const createCard = (src, id) => {
  const cardPlace = document.createElement('div');
  cardPlace.className = 'cardPlace'

  const card = document.createElement('div');
  card.className = 'card';
  card.id = `card-${id}`;
  card.cardData = { 'link': src, isFace: false };

  cardPlace.appendChild(card);

  return cardPlace;
}

const container = document.querySelector('.container');

const mountCards = () => {
  shufleImages.forEach((src, index) => {
    /* переделать чтобы без рефлоу сто раз */
    container.appendChild(createCard(src, index))
  })
}

mountCards();

const mountLink = (href) => {
  const link = document.createElement('link');
  link.setAttribute('rel', 'preload');
  link.setAttribute('href', href);
  link.setAttribute('as', 'image');
  document.head.appendChild(link);
}

shufleImages.forEach(item => mountLink(item))



/* не лучше ли раздавать классы? */


const animateFlip = (delay, freq, revertDirection, ...cards) => {
  return new Promise((resolve, reject) => {
    /* const isSameFaces = cards.every((card => card.cardData.isFace == cards[0].cardData.isFace));

    if (!isSameFaces) reject(); */

    let angle = cards[0].cardData.isFace ? 180 : 0;

    const direction = revertDirection ? -1 : 1;

    const angleIncrement = 5 * direction;

    const toggleBackgroundImg = (card) => {
      const { link, isFace } = card.cardData;
      if (isFace) {
        card.style.backgroundImage = 'none';
        card.cardData.isFace = false;
        card.style.boxShadow = '-3px 3px 3px 0px rgba(0, 0, 0, 0.75)';
      } else {
        card.style.backgroundImage = `url(${link})`;
        card.cardData.isFace = true;
        card.style.boxShadow = '3px 3px 3px 0px rgba(0, 0, 0, 0.75)';
      }
    }

    const animateFrame = (card) => {
      angle += angleIncrement;
      card.style.transform = `rotateY(${angle}deg)`;
    }

    const goAnimate = () => {
      const interval = setInterval(() => {
        cards.forEach(card => animateFrame(card));

        if (Math.abs(angle) === 90 || Math.abs(angle) === 270) {
          cards.forEach(card => toggleBackgroundImg(card));
        }

        if (Math.abs(angle) % 180 === 0) {
          clearInterval(interval);
          resolve(cards[0]);
        };
      }, freq);
    };

    delay ? setTimeout(goAnimate, delay) : goAnimate();
  })
}


const getHandler = () => {
  let pickedCards = [];

  const pickCard = (card) => {
    pickedCards.push(card);
  }

  const checkMatch = () => {
    return pickedCards[0].cardData.link === pickedCards[1].cardData.link
  }

  const openCard = (card) => {
    return animateFlip(0, 6, false, card);
  }

  const closeCards = () => {
    const [firstCard, secondCard] = pickedCards;
    animateFlip(500, 30, true, firstCard, secondCard);
    pickedCards.length = 0;
  }

  const discardСards = () => {
    const [firstCard, secondCard] = pickedCards;

    setTimeout(() => {
      firstCard.style.display = 'none';
      secondCard.style.display = 'none';
    }, 500)

    pickedCards.length = 0;
  }

  return (e) => {
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

container.addEventListener('click', getHandler());
