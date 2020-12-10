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

const flipCard = (...cards) => { // вторая карта сюда попадает с другим isFace
  return new Promise((resolve, reject) => {
    const isSameFaces = cards.every((card => card.cardData.isFace == cards[0].cardData.isFace));

    if (!isSameFaces) {
      reject();
    }

    let angle = cards[0].cardData.isFace ? 180 : 0;

    const toggleBackgroundImg = (card) => {
      const { link, isFace } = card.cardData;
      if (isFace) {
        card.style.backgroundImage = 'none';
        card.cardData.isFace = false;
      } else {
        card.style.backgroundImage = `url(${link})`;
        card.cardData.isFace = true;
      }
    }

    const goSingleFrame = (card) => {
      angle += 5;
      card.style.transform = `rotateY(${angle}deg)`;
    }

    const goAnimate = setInterval(() => {
      cards.forEach(card => goSingleFrame(card));

      if (angle === 90 || angle === 270) {
        cards.forEach(card => toggleBackgroundImg(card));
      }

      if (angle % 180 === 0) {
        clearInterval(goAnimate);
        resolve(cards[0]);
      };
    }, 10);
  })
}


const getNewHandler = () => {
  let shownCard = null;
  let clickIsEnable = true;

  const addCardToOpen = (card) => {
    if (!shownCard) {
      shownCard = card;
      clickIsEnable = true
    } else {
      if (shownCard.cardData.link === card.cardData.link) {
        shownCard.style.display = 'none';
        card.style.display = 'none';
        shownCard = null;
        clickIsEnable = true
      } else {
        console.log('need pause');
        
        flipCard(card, shownCard).then(() => clickIsEnable = true);
        shownCard = null;
      }
    }
  }


  return (e) => {
    if (e.target.className !== 'card') return;
    if (!clickIsEnable) return;
    if (e.target === shownCard) return;

    clickIsEnable = false;
    flipCard(e.target)
      .then(addCardToOpen)
  }
}

container.addEventListener('click', getNewHandler());
