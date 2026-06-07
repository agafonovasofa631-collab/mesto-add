export const initialCards = [
    {
      name: "Архыз",
      link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/arkhyz.jpg",
    },
    {
      name: "Челябинская область",
      link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/chelyabinsk-oblast.jpg",
    },
    {
      name: "Иваново",
      link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/ivanovo.jpg",
    },
    {
      name: "Камчатка",
      link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/kamchatka.jpg",
    },
    {
      name: "Холмогорский район",
      link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/kholmogorsky-rayon.jpg",
    },
    {
      name: "Байкал",
      link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/baikal.jpg",
    },
];
// src/scripts/components/card.js
export function createCard(cardData, currentUserId, handleLikeClick, handleDeleteClick, handleImageClick, handleInfoClick) {
  const cardTemplate = document.querySelector('#card-template').content;
  const cardElement = cardTemplate.cloneNode(true);
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCountSpan = cardElement.querySelector('.card__like-count');
  const deleteButton = cardElement.querySelector('.card__delete-button');
  const infoButton = cardElement.querySelector('.card__control-button_type_info');

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCountSpan.textContent = cardData.likes.length;

  const isLiked = cardData.likes.some(user => user._id === currentUserId);
  if (isLiked) likeButton.classList.add('card__like-button_is-active');

  likeButton.addEventListener('click', () => handleLikeClick(cardData._id, likeButton, likeCountSpan));

  if (cardData.owner._id === currentUserId) {
    deleteButton.style.display = 'block';
    deleteButton.addEventListener('click', () => handleDeleteClick(cardElement, cardData._id));
  } else {
    deleteButton.style.display = 'none';
  }

  infoButton.addEventListener('click', () => handleInfoClick(cardData._id));
  cardImage.addEventListener('click', () => handleImageClick(cardData.link, cardData.name));

  return cardElement;
}
export function isCardLiked(likeButton) {
  return likeButton.classList.contains('card__like-button_is-active');
}
export function updateLikeUI(likeButton, likeCountSpan, likesCount, isLiked) {
  if (isLiked) {
    likeButton.classList.add('card__like-button_is-active');
  } else {
    likeButton.classList.remove('card__like-button_is-active');
  }
  likeCountSpan.textContent = likesCount;
}
