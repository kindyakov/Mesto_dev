import { Loader } from '../../modules/myLoader.js'

import api, { apiWithAuth } from '../../settings/api.js'
import { outputInfo } from '../../utils/outputinfo.js'

import { validatesInput } from '../../settings/validates.js'
import { validateReg } from './validate.js'

class Registration {
  constructor(options) {
    let defaultOptions = {
      wrapperSelector: '.content-registration',
      redirect: null,
      onReg: () => { }
    }

    this.options = Object.assign(defaultOptions, options)

    this.wrapper = document.querySelector(this.options.wrapperSelector)

    this.formSendPhone = this.wrapper.querySelector('.form-send-phone')
    this.formSendCode = this.wrapper.querySelector('.form-send-code')
    this.formRegistration = this.wrapper.querySelector('.form-registration')
    if (!this.formSendPhone || !this.formSendCode || !this.formRegistration) return

    this.validatorPhone = validatesInput.username(this.formSendPhone)
    this.validatorCode = validatesInput.code(this.formSendCode)
    this.validatorReg = validateReg(this.formRegistration)

    this.loader = new Loader(this.wrapper)

    this.isReg = false
    this.resData = null
    this.phone = null
    this.code = null

    this.timerStarted = false

    this.events()
  }

  events() {
    this.formSendPhone && this.formSendPhone.addEventListener('submit', this.submitFormPhone.bind(this))
    this.formSendCode && this.formSendCode.addEventListener('submit', this.submitFormCode.bind(this))
    this.formRegistration && this.formRegistration.addEventListener('submit', this.submitRegistration.bind(this))
  }

  submitFormPhone(e) {
    if (!this.validatorPhone.isValid || this.timerStarted) return
    const formData = new FormData(this.formSendPhone)
    this.phone = formData.get('username').replace(/[+() -]/g, '')
    formData.set('username', this.phone)

    this.startCountdown(e.submitter)
    this.getCode(formData)
  }

  submitFormCode() {
    if (!this.validatorCode.isValid) return
    const formData = new FormData(this.formSendCode)
    formData.append('phone', this.phone)

    this.sendCode(formData)
  }

  submitRegistration() {
    if (!this.validatorReg.isValid) return
    const formData = new FormData(this.formRegistration)
    formData.set('username', this.phone)
    formData.delete('privacy_policy')

    this.reg(formData)
  }

  removeDisabled(form) {
    if (!form) return
    form.classList.remove('_disabled')
    form.elements.length && Array.from(form.elements).forEach(el => {
      el.removeAttribute('disabled')
    });
  }

  startCountdown(timerElement) {
    if (this.timerStarted) {
      return;
    }

    const form = timerElement.closest('form');

    // Устанавливаем, что таймер начался
    this.timerStarted = true;
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
        this.timerStarted = false; // Таймер закончен
        form.classList.remove('_disabled');
        timerElement.querySelector('span').textContent = 'Получить код';
      }
    }, 1000); // Запускать каждую секунду
  }

  async getCode(formData) {
    try {
      this.loader.enable()
      const response = await api.post('/_get_code_register_', formData)

      if (response.status !== 200) return
      const { msg, msg_type } = response.data
      outputInfo({ msg, msg_type })

      if (msg_type === 'success') {
        this.removeDisabled(this.formSendCode)
      }
    } catch (error) {
      console.error("Ошибка при получение кода", error.message)
    } finally {
      this.loader.disable()
    }
  }

  async sendCode(formData) {
    try {
      this.loader.enable()
      const response = await api.post('/_send_code_register_', formData)

      if (response.status !== 200) return
      const { msg, msg_type } = response.data
      outputInfo({ msg, msg_type })

      if (msg_type === 'success') {
        this.removeDisabled(this.formRegistration)
      }
    } catch (error) {
      console.error('Ошибка при отправки кода:', error.message)
    } finally {
      this.loader.disable()
    }
  }

  async reg(formData) {
    try {
      this.loader.enable()
      const response = await api.post('/_register_', formData)

      if (response.status !== 200) return
      const { msg, msg_type, access_token, expiration_time } = this.resData = response.data
      outputInfo({ msg, msg_type })

      if (msg_type === 'success') {
        this.isReg = true
        document.cookie = `token=Bearer ${access_token}; max-age=${expiration_time}; path=/`;
        this.options.onReg()
        this.sendApproveEmail(access_token)
        setTimeout(() => {
          if (this.options.redirect) {
            document.location.pathname = this.options.redirect
          }
        }, 200)
      }
    } catch (error) {
      console.error('Ошибка при отправки кода:', error.message)
    } finally {
      this.loader.disable()
    }
  }

  async sendApproveEmail(access_token) {
    try {
      apiWithAuth.defaults.headers.Authorization = `Bearer ${access_token}`
      const response = await apiWithAuth.post('/_send_approve_email_')
    } catch (error) {
      console.error(error)
    }
  }
}

export default Registration