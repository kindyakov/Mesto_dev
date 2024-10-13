import api, { checkAuth } from "../../../settings/api.js";
import { Modal } from "../../../modules/myModal.js";
import { Loader } from "../../../modules/myLoader.js";
import { outputInfo } from "../../../utils/outputinfo.js";
import { сallTouch } from '../../сallTouch.js'

import { validate } from "./validate.js";
import { validatesInput } from '../../../settings/validates.js'

export function modalArrangeGuestVisit() {
  const modal = new Modal('.modal-arrange-guest-visit', {
    modalBtnActive: '.btn-arrange-guest-visit'
  })
  if (!modal.modal) return

  const formSendPhone = modal.modal.querySelector('.form-send-phone')
  const formSendPhoneValidator = validate(formSendPhone)
  const formSendCode = modal.modal.querySelector('.form-send-code')

  const formSendCodeValidator = validatesInput.code(formSendCode)
  const loader = new Loader(modal.modal.querySelector('.modal__body'))
  const isAuth = checkAuth()
  let room_id, username, timerStarted = false, data

  formSendPhone.addEventListener('submit', (e) => {
    if (!formSendPhoneValidator.isValid) return
    const formData = new FormData(e.target)
    data = {}

    username = formData.get('username').replace(/[+() -]/g, '')
    formData.set('username', username)

    Array.from(formData).forEach(arr => data[arr[0]] = arr[1])

    test_room({ username: data.username, email: data.email, room_id }).then(() => {
      startCountdown(e.submitter)
    })
  })

  formSendCode.addEventListener('submit', (e) => {
    if (!formSendCodeValidator.isValid) return
    const formData = new FormData(e.target)

    formData.set('username', username)
    formData.set('password', formData.get('code'))
    formData.delete('code')

    сallTouch({ ...data, form: e.target })
    login(formData)
  })

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

  function removeDisabled(form) {
    if (!form) return
    form.classList.remove('_disabled')
    form.elements.length && Array.from(form.elements).forEach(el => {
      el.removeAttribute('disabled')
    });
  }

  async function test_room(data) {
    try {
      loader.enable()
      const response = await api.post('/_test_room_', data)
      if (response.status !== 200) return false
      outputInfo(response.data)
      if (response.data.msg_type === 'success') {
        removeDisabled(formSendCode)
      }
      return response.data
    } catch (error) {
      console.log(error.message)
      throw error
    } finally {
      loader.disable()
    }
  }

  async function login(formData) {
    try {
      loader.enable()
      const response = await api.post('/_login_', formData)
      if (response.status !== 200) return
      const { access_token, expiration_time } = response.data
      outputInfo(response.data)
      if (response.data.msg_type === 'success') {
        ym(97074608, 'reachGoal', 'gostevoi')
        document.cookie = `token=Bearer ${access_token}; max-age=${expiration_time}; path=/`;
        location.pathname = 'account.html'
      }
    } catch (error) {
      console.log(error.message)
      throw error
    } finally {
      loader.disable()
    }
  }

  modal.options.onOpen = (e) => {
    const btn = e.target.closest(modal.options.modalBtnActive)
    room_id = +btn.getAttribute('data-room-id')
    !room_id && modal.close()
  }
}