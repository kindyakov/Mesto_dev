import { Modal } from "../../modules/myModal.js"
import { Accordion } from "../../modules/myAccordion.js"
import Cards from "../cards/cards.js"

import { Loader } from "../../modules/myLoader.js"
import { formattingPrice } from "../../utils/formattingPrice.js"
import { apiWithAuth } from "../../settings/api.js"
import { outputInfo } from "../../utils/outputinfo.js"
import { payAfterAgreement, payBeforeAgreement } from "../../settings/request.js"
import { validateLinkNewBankingDetails } from "./paymentMethods/validate.js"

import { modalOpening } from "../modals/modalOpening.js"
import { isTimeInRange } from "../../utils/isTimeInRange.js"
import { replaceRoomForClient } from "../../settings/request.js"

class FormNewAgreement {
  constructor() {
    this.modalPaymentsRoom = new Modal('.modal-payments-room', {
      modalBtnClose: '.btn-modal-close',
      modalBtnActive: '.btn-modal-payments-room-open',
      isHidden: true
    })
    if (!this.modalPaymentsRoom.modal) return

    this.accordion = new Accordion('.modal-payments-room')

    this.loader = new Loader(this.modalPaymentsRoom.modal.querySelector('.modal__body'))

    this.urlParams = new URLSearchParams(window.location.search)

    this.cards = new Cards(this.modalPaymentsRoom.modal.querySelector('.account-storerooms__agreement_form-payment'), { isLinkCard: true })

    this.form = this.modalPaymentsRoom.modal.querySelector('.modal-payments-room__form')
    this.btnPaymentModal = this.modalPaymentsRoom.modal.querySelector('.btn-payment-modal')
    this.priceResult = this.form.querySelector('.price-result')
    this.inputMonth = this.form.querySelector('input[name="num_monthes"]')
    this.itemsMonth = this.form.querySelectorAll('.item-month')
    this.inputAutoPayments = this.form.querySelector('input[name="auto-payments"]')

    this.submitEvent = new Event('submit');

    this.allRooms = null
    this.clientData = null
    this.profile = null

    this.priceRoom = null
    this.agrId = null
    this.roomId = null
    this.month = null
    this.oldRoomId = null
    this.newRoomId = null

    this.typePayment = 'before'

    this.events()
  }

  events() {
    if (!this.form) return

    this.modalPaymentsRoom.options.onOpen = (e) => {
      const btn = e.target?.closest(this.modalPaymentsRoom.options.modalBtnActive)
      const agrId = btn.getAttribute('data-agreement-id')
      const roomIds = btn.getAttribute('data-room-ids')
      const roomId = btn.getAttribute('data-room-id')

      const oldRoomId = btn.getAttribute('data-old-room-id')
      const newRoomId = btn.getAttribute('data-new-room-id')

      let price = 0

      // ! Заглушка
      if (isTimeInRange()) {
        this.modalPaymentsRoom.close()
        modalOpening.open()
        return
      }

      // Если кликнули на кнопку "Арендовать" то редирект
      if (btn.classList.contains('btn-rent-room')) {
        location.href = `${location.origin}/rent-room.html?ids=${encodeURIComponent(JSON.stringify([roomId]))}`
        return
      }

      this.clientData.rooms = this.clientData.rooms.filter((room, index, self) =>
        index === self.map(_room => _room.room_id).indexOf(room.room_id)
      )

      // Если не определен клиент то редирект
      if (!this.clientData.client.user_type) {
        let ids = []

        if (agrId) {
          const [currentAgreement] = this.clientData.agreements.filter(agreement => +agreement.agrid === +agrId)
          ids = currentAgreement.room_ids
        } else {
          ids = [roomId]
        }

        location.href = `${location.origin}/rent-room.html?ids=${encodeURIComponent(JSON.stringify(ids))}`
        return
      }

      // Если у текущей ячейки rented == 0.4 то редирект
      if (this.clientData.agreements) {
        let currentRoom, currentAgreement

        if (agrId) {
          [currentAgreement] = this.clientData.agreements.filter(agreement => agreement.agrid == agrId)
          currentRoom = this.clientData.rooms.filter(room => +room.room_id === +currentAgreement.room_ids[0])
        } else {
          [currentRoom] = this.clientData.rooms.filter(room => +room.room_id === +roomId)
          [currentAgreement] = this.clientData.agreements.filter(agreement => agreement.agrid == currentRoom.agrid)
        }

        if (currentAgreement && currentRoom[0]?.rented == 0.4) {
          location.href = `${location.origin}/rent-room.html?ids=${encodeURIComponent(JSON.stringify(currentAgreement.room_ids))}`
          return
        }
      }

      this.modalPaymentsRoom.modal.classList.add('_active')

      if (oldRoomId && newRoomId) {
        // const [currentNewRoom] = this.allRooms.filter(room => +room.room_id === +newRoomId)
        // const [currentOldRoom] = this.allRooms.filter(room => +room.room_id === +oldRoomId)

        price = +btn.getAttribute('data-difference')

        this.oldRoomId = oldRoomId
        this.newRoomId = newRoomId
        this.typePayment = 'replace'
      } else if (agrId) {
        const [currentRoom] = this.clientData.rooms.filter(room => room.agrid === agrId)
        const [currentAgreement] = this.clientData.agreements.filter(agreements => agreements.agrid == agrId)
        price = currentRoom.price

        if (currentAgreement.recurrent_payments) {
          this.modalPaymentsRoom.modal.querySelector('.privacy-policy').classList.add('_none')
        } else {
          this.modalPaymentsRoom.modal.querySelector('.privacy-policy').classList.remove('_none')
        }

        this.typePayment = 'after'
        this.month = currentRoom.rent_period
      } else {
        const [currentRoom] = this.allRooms.filter(room => +room.room_id === +roomId)
        price = currentRoom.price
        this.typePayment = 'before'
      }

      this.roomId = roomId
      this.agrId = agrId
      this.renderModal({ price, roomId })
    }

    this.form.addEventListener('click', e => {
      if (e.target.closest('.item-month')) {
        const itemMonth = e.target.closest('.item-month')
        const month = itemMonth.getAttribute('data-month')
        const itemMonthActive = this.form.querySelector('.item-month._active')
        const price = +itemMonth.getAttribute('data-price')

        if (!month || !price) return

        this.inputMonth.classList.remove('just-validate-error-field')
        this.inputMonth.value = month
        this.month = month

        itemMonthActive && itemMonthActive.classList.remove('_active')
        itemMonth && itemMonth.classList.add('_active')

        this.priceResult.innerHTML = formattingPrice(price)
      }
    })

    this.inputMonth && this.inputMonth.addEventListener('input', e => {
      const itemMonthActive = this.form.querySelector('.item-month._active')
      const itemMonthCurrent = this.form.querySelector(`.item-month[data-month="${this.inputMonth.value}"]`)
      const value = this.inputMonth.value

      if (this.inputMonth.value.length > 2) {
        this.inputMonth.value = value.slice(0, 2)
      } else {
        this.inputMonth.value = value.replace(/[^0-9]/g, '')
      }

      this.month = value

      if (value < 6) {
        this.sumPriceDiscCells = this.priceRoom
      } else if (+value >= 6 && +value <= 10) {
        this.sumPriceDiscCells = this.priceRoom - (this.priceRoom * 5 / 100).toFixed(0)
      } else if (value > 10) {
        this.sumPriceDiscCells = this.priceRoom - (this.priceRoom * 10 / 100).toFixed(0)
      }

      this.inputMonth.classList.remove('just-validate-error-field')

      itemMonthActive && itemMonthActive.classList.remove('_active')
      itemMonthCurrent && itemMonthCurrent.classList.add('_active')

      this.priceResult.innerHTML = formattingPrice(this.sumPriceDiscCells)
    })

    this.btnPaymentModal.addEventListener('click', e => {
      e.preventDefault()
      if (!this.month && this.typePayment !== 'replace') {
        this.inputMonth.classList.add('just-validate-error-field')
        return
      }

      const formData = new FormData()

      formData.set('autopay', this.inputAutoPayments.checked ? 1 : 0)
      formData.set('user_type', this.clientData.client.user_type)
      formData.set('num_monthes', this.month)

      formData.delete('auto-payments')
      formData.delete('promo-code')

      if (this.clientData.client.user_type === 'f') {
        if (this.typePayment === 'replace') {
          let data = {
            user_type: this.clientData.client.user_type,
            agrid: this.agrId,
            old_room_id: this.oldRoomId,
            new_room_id: this.newRoomId,
            autopay: this.inputAutoPayments.checked ? 1 : 0,
            card_id: formData.get('card_id'),
            return_url: location.href
          }

          replaceRoomForClient(data, this.loader)
        } else if (this.typePayment === 'before') {
          formData.set('return_url', location.href + `?room_id=${this.roomId}&num_monthes=${this.month}`)
          formData.set('room_ids', JSON.stringify([this.roomId]))

          payBeforeAgreement(formData, this.loader)
        } else {
          formData.set('return_url', location.href)
          formData.set('agrid', this.agrId)

          payAfterAgreement(formData, this.loader)
        }
      } else if (this.clientData.client.user_type === 'u') {
        if (this.typePayment === 'replace') {
          let data = {
            user_type: this.clientData.client.user_type,
            agrid: this.agrId,
            old_room_id: this.oldRoomId,
            new_room_id: this.newRoomId,
          }

          replaceRoomForClient(data, this.loader).finally(() => {
            this.modalPaymentsRoom.close()
          })
        } else if (this.typePayment === 'before') {
          this.createAgreement({ profile: this.profile, roomId: this.roomId, num_monthes: this.month })
        } else {
          formData.set('return_url', location.href)
          formData.set('agrid', this.agrId)
          payAfterAgreement(formData, this.loader).finally(() => {
            this.modalPaymentsRoom.close()
          })
        }
      }

      this.agrId = null
      this.month = null
      this.roomId = null
    })
  }

  renderItemsMonth(priceSum) {
    this.itemsMonth.length && this.itemsMonth.forEach(item => {
      const month = +item.dataset.month
      const price = item.querySelector('b')
      let calcPrice = priceSum
      if (!month) return

      if (month == 6) {
        calcPrice = priceSum - (priceSum * 5 / 100).toFixed(0)
      } else if (month == 11) {
        calcPrice = priceSum - (priceSum * 10 / 100).toFixed(0)
      }

      price.innerHTML = `от ${formattingPrice(calcPrice)}/м`
      item.setAttribute('data-price', calcPrice)
    })
  }

  renderModal({ price, roomId }) {
    this.roomId = roomId
    this.priceRoom = +price

    this.renderItemsMonth(price)
    this.priceResult.innerHTML = formattingPrice(price)

    if (this.agrId) {
      this.modalPaymentsRoom.modal.querySelector('.rent-room__tariffs').classList.add('_none')
    } else {
      this.modalPaymentsRoom.modal.querySelector('.rent-room__tariffs').classList.remove('_none')
    }

    if (this.clientData.client.user_type === 'f') {
      this.modalPaymentsRoom.modal.querySelector('.payment-method-accordion').classList.add('_none')
    } else if (this.clientData.client.user_type === 'u') {
      this.modalPaymentsRoom.modal.querySelector('.payment-method-accordion').classList.remove('_none')
    }

    this.cards.userType = this.clientData.client.user_type
    this.cards.requisites = this.clientData.requisites
    this.cards.render(this.loader)
  }

  createAgreement({ profile, roomId, num_monthes }) {
    const formData = new FormData()

    formData.set('num_monthes', num_monthes)
    formData.set('room_ids', JSON.stringify(Array.isArray(roomId) ? roomId : [roomId]))
    formData.set('user_type', profile.user_type)
    formData.set('rent_or_test', 'rent')

    formData.set('familyname', profile.familyname)
    formData.set('firstname', profile.firstname)
    formData.set('address', profile.address)

    if (profile.user_type === 'f') {
      formData.set('patronymic', profile.patronymic)
      formData.set('birthday', profile.birthday)
      formData.set('series', profile.series)
      formData.set('no', profile.no)
      formData.set('issue_date', profile.issue_date)
      formData.set('subdivision', profile.subdivision)
      formData.set('issued_by', profile.issued_by)
    } else if (profile.user_type === 'u') {
      formData.set('bik', profile.bik)
      formData.set('inn', profile.inn)
      formData.set('kpp', profile.kpp)
      formData.set('bank', profile.bank)
      formData.set('rs', profile.rs)
      formData.set('ks', profile.ks)
    }

    console.log(Array.from(formData))

    // this.formNewAgreement(formData)
  }

  async formNewAgreement(formData) {
    try {
      this.loader.enable();
      const response = await apiWithAuth.post('/_form_new_agreement_', formData)

      if (response.status !== 200) return null
      outputInfo(response.data)

      if (response.data.msg_type === 'success') {
        history.replaceState(null, "", "/account.html");
        location.href = location.origin + '/account.html'
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.disable()
    }
  }
}

export default FormNewAgreement