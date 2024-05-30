import { Loader } from "../../../modules/myLoader.js"
import { apiWithAuth } from "../../../settings/api.js"
import { outputInfo } from "../../../utils/outputinfo.js"

import { validate, validateCreatePassword } from "./validate.js"

class ChangePassword {
  constructor({ accountTabs }) {
    this.loader = new Loader(document.querySelector('.main'), {
      isHidden: false, customSelector: 'custom-loader', position: 'fixed', id: 'change-password-loader'
    })

    this.form = document.querySelector('.form-change-password')
    this.validator = validate(this.form)
    this.accountTabs = accountTabs

    this.isCreatePassword = false

    this.events()
  }

  events() {
    this.form && this.form.addEventListener('submit', e => {
      this.validator.revalidate().then(isValid => {
        if (!isValid) return
        const formData = new FormData(this.form)

        this.sendForm(formData)
      })
    })
  }

  renderForm() {
    if (!this.form) return

    if (this.form.classList.contains('create-password')) {
      this.form.querySelector('h2').textContent = 'Создайте пароль'
      this.form.querySelector('input[name="current_password"]')?.closest('.wrap-input')?.remove()
      this.form.querySelector('button[type="submit"]').insertAdjacentHTML('beforebegin', '<p style="text-align: center; margin-bottom: 10px;">* Длина пароля не менее 5 знаков</p>')
      this.isCreatePassword = true
      this.validator = validateCreatePassword(this.form)
    }
  }

  async sendForm(formData) {
    try {
      this.loader.enable()
      const response = await apiWithAuth.post(this.isCreatePassword ? '/_set_password_' : '/_change_password_', formData)

      if (response.status !== 200) return
      this.form.reset()
      this.validator.refresh()
      outputInfo(response.data)
      this.isCreatePassword && location.reload()
      // if (this.accountTabs.tabsBtns.length) {
      //   this.accountTabs.tabsBtns.forEach(btn => btn.classList.remove('_none'))

      //   this.accountTabs.switchTabs(this.accountTabs.tabs.querySelector('.account-tabs-btn-change-password'))
      // }
    } catch (error) {
      console.error('Ошибка при смене пароля:', error);
    } finally {
      this.loader.disable()
    }
  }
}

export default ChangePassword