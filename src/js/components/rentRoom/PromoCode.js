import { apiWithAuth } from "../../settings/api.js";

class PromoCode {
  constructor({ loader, roomIds }) {
    this.button = document.querySelector('.btn-promo-code')
    this.input = document.querySelector('.input-promo-code')
    this.loader = loader
    this.roomIds = roomIds

    this.initEventListeners()
  }

  initEventListeners() {
    this.button.addEventListener('click', () => this.handleClickBtn())
    this.input.addEventListener('input', () => this.input.classList.remove('just-validate-error-field'))
  }

  handleClickBtn() {
    if (this.button.classList.contains('_applied')) return
    if (!this.input.value) {
      this.input.classList.add('just-validate-error-field')
      return
    }

    this.input.classList.remove('just-validate-error-field')

    const formData = new FormData()
    let promocode = this.input.value
    formData.set('promocode', promocode)
    formData.set('room_ids', JSON.stringify(this.roomIds))

    this.applyPromoCode(formData, promocode).then(() => {
      this.button.classList.add('_applied')
    })
  }

  onApply() {

  }

  async applyPromoCode(formData, promocode) {
    try {
      this.loader.enable()
      const response = await apiWithAuth.post('/_apply_promocode_', formData)
      if (response.status !== 200) return
      this.onApply({ ...response.data, promocode })
    } catch (error) {
      console.log(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default PromoCode