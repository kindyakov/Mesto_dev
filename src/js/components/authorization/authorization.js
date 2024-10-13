import { Loader } from '../../modules/myLoader.js'

import api from '../../settings/api.js'
import { outputInfo } from '../../utils/outputinfo.js'

import { validateAuth } from './validate.js'

class Authorization {
  constructor(options) {
    let defaultOptions = {
      wrapperSelector: '.content-authorization',
      redirect: null,
      onAuth: () => { }
    }

    this.options = Object.assign(defaultOptions, options)

    this.wrapper = document.querySelector(this.options.wrapperSelector)
    this.urlParams = new URLSearchParams(window.location.search)

    this.form = document.querySelector('.form-authorization')
    if (!this.form) return

    this.validator = validateAuth(this.form)
    this.loader = new Loader(this.wrapper)

    this.isAuth = false
    this.resData = null

    this.username = this.urlParams.get('username')

    if (this.username) {
      this.form.querySelector('input[name="username"]').value = this.username.slice(1)
    }

    this.events()
  }

  events() {
    this.form && this.form.addEventListener('submit', this.submit.bind(this))
  }

  submit() {
    if (!this.validator.isValid) return
    const formData = new FormData(this.form)
    formData.set('username', formData.get('username').replace(/[+() -]/g, ''))

    this.auth(formData)
  }

  async auth(formData) {
    try {
      this.loader.enable()
      const response = await api.post('/_login_', formData)

      if (response.status !== 200) return

      const { msg, msg_type, access_token, expiration_time } = this.resData = response.data

      outputInfo(response.data)

      if (msg_type === 'success') {
        this.isAuth = true
        document.cookie = `token=Bearer ${access_token}; max-age=${expiration_time}; path=/`;
        this.options.onAuth()

        if (this.options.redirect) {
          document.location.pathname = this.options.redirect
        }
      }
    } catch (error) {
      console.error('Ошибка при регистрации', error.message)
    } finally {
      this.loader.disable()
    }
  }
}

export default Authorization