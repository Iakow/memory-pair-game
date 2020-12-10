const imagesConfig = [
  'img/avia.png',
  'img/cloud.png',
  'img/drink.png',
  'img/earth.png',
  'img/food.png',
  'img/learn.png'
];

const shufleImages = [...imagesConfig, ...imagesConfig].sort(() => 0.5 - Math.random());

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


const flipCard = (el, start, done) => {

  if (start) start();
  const { link, isFace } = el.cardData;

  let angle = isFace ? 180 : 0;

  const toggleCardBG = () => {
    if (isFace) {
      el.style.backgroundImage = 'none';
      el.cardData.isFace = false;
    } else {
      el.style.backgroundImage = `url(${link})`;
      el.cardData.isFace = true;
    }
  }

  const goAnimate = setInterval(() => {
    angle += 5;
    el.style.transform = `rotateY(${angle}deg)`;

    if (angle % 90 === 0) toggleCardBG();

    if (angle % 180 === 0) {
      clearInterval(goAnimate);
      if (done) done(el);
    };
  }, 10);
}

const getHandler = () => {
  let checkedCard = null;

  let enableHandle = true;

  const done = (el) => {
    enableHandle = true;
    
    if (!checkedCard) {
      checkedCard = el;
    } else {
      if (checkedCard.cardData.link === el.cardData.link) {
        el.style.display = 'none';
        checkedCard.style.display = 'none';
        checkedCard = null;
      } else {
        flipCard(el);
        flipCard(checkedCard);
        checkedCard = null;
      }
    }
  }

  const start = () => {
    enableHandle = false
  }

  return (e) => {
    if (e.target.className !== 'card') return;
    if (!enableHandle) return;
    flipCard(e.target, start, done);
  }
}

container.addEventListener('click', getHandler());
