//import './styles/index.css'; 
import {
  getUserInfo,
  getCards,
  updateUserInfo,
  updateAvatar,
  addCard,
  deleteCard,
  changeLike,
} from './components/api.js';
import { openModal, closeModal } from './components/modal.js';
import { createCard, isCardLiked, updateLikeUI } from './components/card.js';
import { enableValidation, clearValidation } from './components/validate.js';

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible',
};

const cardsContainer = document.querySelector('.places__list');
const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileImage = document.querySelector('.profile__image');
const editProfileModal = document.querySelector('.popup_type_edit');
const avatarModal = document.querySelector('.popup_type_avatar');
const addCardModal = document.querySelector('.popup_type_new-card');
const imageModal = document.querySelector('.popup_type_image');
const removeModal = document.querySelector('.popup_type_remove-card');
const infoModal = document.querySelector('.popup_type_info');
const popupImage = imageModal.querySelector('.popup__image');
const popupCaption = imageModal.querySelector('.popup__caption');
const profileForm = editProfileModal.querySelector('.popup__form');
const avatarForm = avatarModal.querySelector('.popup__form');
const cardForm = addCardModal.querySelector('.popup__form');
const removeForm = removeModal.querySelector('.popup__form');
const nameInput = editProfileModal.querySelector('.popup__input_type_name');
const jobInput = editProfileModal.querySelector('.popup__input_type_description');
const avatarInput = avatarModal.querySelector('.popup__input_type_url');
const cardNameInput = addCardModal.querySelector('.popup__input_type_card-name');
const cardLinkInput = addCardModal.querySelector('.popup__input_type_url');
const confirmRemoveBtn = removeForm.querySelector('.popup__button_confirm');
const editProfileBtn = document.querySelector('.profile__edit-button');
const avatarEditBtn = document.querySelector('.profile__image');
const addCardBtn = document.querySelector('.profile__add-button');

let currentUserId = null;

function setButtonLoading(button, isLoading, defaultText, loadingText) {
  if (isLoading) {
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = defaultText;
    button.disabled = false;
  }
}

// Единственное объявление handleLikeClick
function handleLikeClick(cardId, likeButton, likeCountSpan) {
  const isLikedNow = isCardLiked(likeButton);
  changeLike(cardId, isLikedNow)
    .then(updatedCard => {
      updateLikeUI(likeButton, likeCountSpan, updatedCard.likes.length, !isLikedNow);
    })
    .catch(err => console.error('Ошибка при лайке:', err));
}

function handleDeleteClick(cardElement, cardId) {
  openModal(removeModal);
  removeForm.dataset.cardId = cardId;
  removeForm.dataset.cardElement = cardElement;
}

function handleImageClick(link, name) {
  popupImage.src = link;
  popupImage.alt = name;
  popupCaption.textContent = name;
  openModal(imageModal);
}

function handleRemoveConfirm(evt) {
  evt.preventDefault();
  const cardId = removeForm.dataset.cardId;
  const cardElement = removeForm.dataset.cardElement;
  if (!cardId || !cardElement) return;
  setButtonLoading(confirmRemoveBtn, true, 'Да', 'Удаление...');
  deleteCard(cardId)
    .then(() => {
      removeCardElement(cardElement);   // 👈 заменили
      closeModal(removeModal);
    })
    .catch(err => console.error('Ошибка удаления:', err))
    .finally(() => setButtonLoading(confirmRemoveBtn, false, 'Да', 'Удаление...'));
}

// Статистика (кнопка "i") – функции formatDate, createInfoItem, createUserPreview, handleInfoClick
const infoDefinitionTemplate = document.querySelector('#popup-info-definition-template').content;
const infoUserTemplate = document.querySelector('#popup-info-user-preview-template').content;
const infoListContainer = infoModal.querySelector('.popup-info__list');
const userPreviewContainer = infoModal.querySelector('.popup-info__users-preview');

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
}

function createInfoItem(key, value) {
  const item = infoDefinitionTemplate.cloneNode(true);
  item.querySelector('.popup-info__definition-key').textContent = key;
  item.querySelector('.popup-info__definition-value').textContent = value;
  return item;
}

function createUserPreview(user) {
  const userElement = infoUserTemplate.cloneNode(true);
  const avatar = userElement.querySelector('.popup-info__user-avatar');
  const nameEl = userElement.querySelector('.popup-info__user-name');
  avatar.src = user.avatar;
  avatar.alt = user.name;
  nameEl.textContent = user.name;
  return userElement;
}

async function handleInfoClick(cardId) {
  try {
    const cards = await getCards();
    const card = cards.find(c => c._id === cardId);
    if (!card) throw new Error('Карточка не найдена');
    infoListContainer.innerHTML = '';
    userPreviewContainer.innerHTML = '';
    infoListContainer.append(
      createInfoItem('Название', card.name),
      createInfoItem('Дата создания', formatDate(card.createdAt))
    );
    if (card.likes.length === 0) {
      const noLikesItem = document.createElement('p');
      noLikesItem.textContent = 'Нет лайков';
      noLikesItem.classList.add('popup-info__no-likes');
      userPreviewContainer.appendChild(noLikesItem);
    } else {
      card.likes.forEach(user => userPreviewContainer.appendChild(createUserPreview(user)));
    }
    openModal(infoModal);
  } catch (err) {
    console.error('Ошибка при открытии статистики:', err);
  }
}

// Обработчики форм
function handleProfileSubmit(evt) {
  evt.preventDefault();
  const submitBtn = profileForm.querySelector('.popup__button');
  setButtonLoading(submitBtn, true, 'Сохранить', 'Сохранение...');
  updateUserInfo({ name: nameInput.value, about: jobInput.value })
    .then(userData => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModal(editProfileModal);
    })
    .catch(err => console.error(err))
    .finally(() => setButtonLoading(submitBtn, false, 'Сохранить', 'Сохранение...'));
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = avatarForm.querySelector('.popup__button');
  setButtonLoading(submitBtn, true, 'Сохранить', 'Сохранение...');
  updateAvatar(avatarInput.value)
    .then(userData => {
      profileImage.style.backgroundImage = `url(${userData.avatar})`;
      closeModal(avatarModal);
      avatarForm.reset();
      clearValidation(avatarForm, validationConfig);
    })
    .catch(err => console.error(err))
    .finally(() => setButtonLoading(submitBtn, false, 'Сохранить', 'Сохранение...'));
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitBtn = cardForm.querySelector('.popup__button');
  setButtonLoading(submitBtn, true, 'Создать', 'Создание...');
  addCard({ name: cardNameInput.value, link: cardLinkInput.value })
    .then(newCard => {
      const cardElement = createCard(
        newCard,
        currentUserId,
        handleLikeClick,
        handleDeleteClick,
        handleImageClick,
        handleInfoClick
      );
      cardsContainer.prepend(cardElement);
      closeModal(addCardModal);
      cardForm.reset();
      clearValidation(cardForm, validationConfig);
    })
    .catch(err => console.error(err))
    .finally(() => setButtonLoading(submitBtn, false, 'Создать', 'Создание...'));
}

// Инициализация
Promise.all([getUserInfo(), getCards()])
  .then(([user, cards]) => {
    profileTitle.textContent = user.name;
    profileDescription.textContent = user.about;
    profileImage.style.backgroundImage = `url(${user.avatar})`;
    currentUserId = user._id;
    cards.forEach(card => {
      const cardElement = createCard(
        card,
        currentUserId,
        handleLikeClick,
        handleDeleteClick,
        handleImageClick,
        handleInfoClick
      );
      cardsContainer.append(cardElement);
    });
  })
  .catch(err => console.error('Ошибка загрузки начальных данных:', err));

// Слушатели
editProfileBtn.addEventListener('click', () => {
  nameInput.value = profileTitle.textContent;
  jobInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModal(editProfileModal);
});
avatarEditBtn.addEventListener('click', () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModal(avatarModal);
});
addCardBtn.addEventListener('click', () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModal(addCardModal);
});
removeForm.addEventListener('submit', handleRemoveConfirm);
profileForm.addEventListener('submit', handleProfileSubmit);
avatarForm.addEventListener('submit', handleAvatarSubmit);
cardForm.addEventListener('submit', handleAddCardSubmit);

enableValidation(validationConfig);
