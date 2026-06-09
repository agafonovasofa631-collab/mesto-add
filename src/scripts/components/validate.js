// src/scripts/components/validate.js
export function enableValidation(config) {
  const forms = document.querySelectorAll(config.formSelector);
  forms.forEach((form) => {
    const inputs = Array.from(form.querySelectorAll(config.inputSelector));
    const button = form.querySelector(config.submitButtonSelector);
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        checkInputValidity(form, input, config);
        toggleButtonState(inputs, button, config);
      });
    });
  });
}

function checkInputValidity(form, input, config) {
  const errorElement = form.querySelector(`.${input.id}-error`);
  if (input.validity.valid) {
    input.classList.remove(config.inputErrorClass);
    if (errorElement) errorElement.textContent = '';
  } else {
    input.classList.add(config.inputErrorClass);
    if (errorElement) errorElement.textContent = input.validationMessage;
  }
}

function toggleButtonState(inputs, button, config) {
  const isValid = inputs.every((input) => input.validity.valid);
  if (isValid) {
    button.classList.remove(config.inactiveButtonClass);
    button.disabled = false;
  } else {
    button.classList.add(config.inactiveButtonClass);
    button.disabled = true;
  }
}

export function clearValidation(form, config) {
  const inputs = Array.from(form.querySelectorAll(config.inputSelector));
  const button = form.querySelector(config.submitButtonSelector);
  inputs.forEach((input) => {
    input.classList.remove(config.inputErrorClass);
    const errorElement = form.querySelector(`.${input.id}-error`);
    if (errorElement) errorElement.textContent = '';
  });
  toggleButtonState(inputs, button, config);
}