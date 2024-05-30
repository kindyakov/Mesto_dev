import { Loader } from "../../../modules/myLoader.js";
import { Modal } from "../../../modules/myModal.js";
import api, { apiWithAuth } from "../../../settings/api.js";

import { validatesInput } from '../../../settings/validates.js'
import { outputInfo } from "../../../utils/outputinfo.js";
import { validatePasswordRecovery } from "./validate.js";

export function modalPasswordRecovery() {
  const modalPasswordRecovery = new Modal('.modal-password-recovery', {
    modalBtnActive: '.btn-modal-password-recovery-open'
  })

  if (!modalPasswordRecovery.modal) return

  const loader = new Loader(modalPasswordRecovery.modal.querySelector('.modal__body'))

  const formSendPhone = modalPasswordRecovery.modal.querySelector('.form-send-phone')
  const formSendCode = modalPasswordRecovery.modal.querySelector('.form-send-code')
  const formSendPassword = modalPasswordRecovery.modal.querySelector('.form-send-password')

  if (!formSendPhone || !formSendCode || !formSendPassword) return

  const validatorPhone = validatesInput.username(formSendPhone)
  const validatorCode = validatesInput.code(formSendCode)
  const validatorPassword = validatePasswordRecovery(formSendPassword)

  let phone = null, userId = null, accessToken = null, timerStarted = false

  events()

  function events() {
    formSendPhone.addEventListener('submit', submitFormPhone)
    formSendCode.addEventListener('submit', submitFormCode)
    formSendPassword.addEventListener('submit', submitFormPassword)

    modalPasswordRecovery.options.onClose = () => {
      validatorPhone.refresh()
      validatorCode.refresh()
      validatorPassword.refresh()

      modalPasswordRecovery.modal.querySelectorAll('form').forEach(form => {
        form.reset()

        if (!form.classList.contains('form-send-phone')) {
          addDisabled(form)
        }
      })
    }
  }

  function submitFormPhone(e) {
    if (!validatorPhone.isValid) return
    const formData = new FormData(e.target)
    phone = formData.get('username').replace(/[+() -]/g, '')
    formData.set('username', phone)
    startCountdown(e.submitter)
    getCode(formData)
  }

  function submitFormCode(e) {
    if (!validatorCode.isValid) return
    const formData = new FormData(e.target)
    formData.append('user_id', userId)

    sendCode(formData)
  }

  function submitFormPassword(e) {
    if (!validatorPassword.isValid) return
    const formData = new FormData(e.target)

    changePassword(formData)
  }

  function removeDisabled(form) {
    if (!form) return
    form.classList.remove('_disabled')
    form.elements.length && Array.from(form.elements).forEach(el => {
      el.removeAttribute('disabled')
    });
  }

  function addDisabled(form) {
    if (!form) return
    form.classList.add('_disabled')
    form.elements.length && Array.from(form.elements).forEach(el => {
      el.disabled = true
      el.setAttribute('disabled', '')
    });
  }

  function startCountdown(timerElement) {
    if (timerStarted) {
      return;
    }

    const form = timerElement.closest('form');

    // Устанавливаем, что таймер начался
    timerStarted = true;
    form.classList.add('_disabled');

    let secondsRemaining = 120;

    // Обновляем DOM-элемент с оставшимися секундами
    const updateTimerDisplay = () => {
      const minutes = Math.floor(secondsRemaining / 60); // Получаем количество минут
      const seconds = secondsRemaining % 60; // Получаем оставшиеся секунды
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes; // Добавляем нуль, если минут меньше 10
      const displaySeconds = seconds < 10 ? `0${seconds}` : seconds; // Добавляем нуль, если секунд меньше 10
      timerElement.querySelector('span').textContent = `${displayMinutes}:${displaySeconds}`;
    };

    // Обновляем дисплей перед началом отсчета
    updateTimerDisplay();

    // Функция, которую будем запускать каждую секунду
    const timer = setInterval(() => {
      secondsRemaining -= 1;
      updateTimerDisplay();

      // Когда время истекло, останавливаем таймер
      if (secondsRemaining <= 0) {
        clearInterval(timer);
        timerStarted = false; // Таймер закончен
        form.classList.remove('_disabled');
        timerElement.querySelector('span').textContent = 'Получить код';
      }
    }, 1000); // Запускать каждую секунду
  }

  async function getCode(formData) {
    try {
      loader.enable()
      const response = await api.post('/_get_code_', formData)

      if (response.status !== 200) return
      outputInfo(response.data)

      const { user_id, msg_type } = response.data
      userId = user_id

      if (msg_type === 'success') {
        removeDisabled(formSendCode)
      }
    } catch (error) {
      console.error(error)
    } finally {
      loader.disable()
    }
  }

  async function sendCode(formData) {
    try {
      loader.enable()
      const response = await api.post('/_send_code_', formData)
      if (response.status !== 200) return
      outputInfo(response.data)

      const { access_token, msg_type } = response.data
      accessToken = access_token

      if (msg_type === 'success') {
        removeDisabled(formSendPassword)
      }
    } catch (error) {
      console.error(error)
    } finally {
      loader.disable()
    }
  }

  async function changePassword(formData) {
    try {
      loader.enable()
      const response = await apiWithAuth.post('/_set_password_', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        }
      })

      if (response.status !== 200) return
      outputInfo(response.data)
      if (response.data.msg_type === 'success') {
        modalPasswordRecovery.close()
      }
    } catch (error) {
      console.error(error)
    } finally {
      loader.disable()
    }
  }
}