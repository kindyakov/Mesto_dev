import AirDatepicker from "air-datepicker";

import { Tabs } from "../../modules/myTabs.js";
import { Loader } from "../../modules/myLoader.js"
import { Modal } from "../../modules/myModal.js";

import api, { apiWithAuth, checkAuth } from "../../settings/api.js";

import Authorization from "../authorization/authorization.js";
import Registration from "../authorization/registration.js";

import { validatePaymentOnline, validatePaymentInvoice, validateAgreementConclusion } from "./validate.js";
import { roomHtml, formDetailsModal, formInfoModal } from "./html.js";

import { buildQueryParams } from "../../utils/buildQueryParams.js";
import { formattingPrice } from "../../utils/formattingPrice.js";
import { getFormattedDate } from "../../utils/getFormattedDate.js";
import { getCookie } from "../../utils/cookie.js";

import { sendFormAgreementInvoice, sendFormNewAgreement } from "./requests.js";
import { payBeforeAgreement, downloadBill } from "../../settings/request.js"

import Cards from "../cards/cards.js";

import { addDaysToDate, formatAsYYYYMMDD } from "./dateUtils.js";
import PromoCode from "./PromoCode.js";

class RentRoom {
  constructor() {
    this.rentRoom = document.querySelector('.rent-room')
    if (!this.rentRoom) return

    this.urlParams = new URLSearchParams(window.location.search)
    this.roomIds = this.urlParams.get('ids') ? JSON.parse(this.urlParams.get('ids')) : []

    if (!this.roomIds.length) return

    this.loader = new Loader(document.querySelector('.main'), {
      isHidden: false, customSelector: 'custom-loader', position: 'fixed'
    })

    this.authorizationTabs = new Tabs('authorization-rent-room-tabs', { activeIndexTab: 1 })
    this.authorization = new Authorization({ wrapperSelector: '.authorization-rent-room' })
    this.registration = new Registration({ wrapperSelector: '.authorization-rent-room' })
    this.promoCode = new PromoCode({ loader: this.loader, roomIds: this.roomIds })

    this.initModals()
    this.cards = new Cards(this.rentRoom.querySelector('.form-payment-online'))

    this.isAuth = checkAuth()
    this.stepProgress = this.rentRoom.querySelectorAll('.step-progress')
    this.scaleProgress = this.rentRoom.querySelector('.scale-progress')
    this.steps = this.rentRoom.querySelectorAll('.rent-room-step')
    this.activeIndexStep = 0
    this.scaleValues = [35, 65, 100]

    this.initSwiper()

    this.rooms = this.rentRoom.querySelector('.rooms-rent-room')

    this.formPaymentOnline = this.rentRoom.querySelector('.form-payment-online')
    this.validatorPaymentOnline = validatePaymentOnline(this.formPaymentOnline)

    this.formPaymentInvoice = this.rentRoom.querySelector('.form-payment-invoice')
    this.validatorPaymentInvoice = validatePaymentInvoice(this.formPaymentInvoice)

    this.formAgreementConclusion = this.rentRoom.querySelector('.form-agreement-conclusion')
    this.validatorAgreementConclusion = validateAgreementConclusion(this.formAgreementConclusion)

    this.month = this.urlParams.get('num_monthes') ? JSON.parse(this.urlParams.get('num_monthes')) : null
    this.agrBegDate = this.urlParams.get('agrbegdate') ? JSON.parse(this.urlParams.get('agrbegdate')) : null
    this.agreementData = null
    this.user = null
    this.formDataPaymentInvoice = null

    this.payment = this.rentRoom.querySelector('.payment-rent-room')
    this.paymentTabs = new Tabs('payment-rent-room-tabs')
    this.inputFile = this.rentRoom.querySelector('.input-file')

    this.event = new Event('submit', { cancelable: true })

    this.resultPriceRooms = this.rentRoom.querySelectorAll('.result-price-room')

    this.initDatePickers()
    this.events()
    this.init()
  }

  initModals() {
    this.modalCheckingDetailsForm = new Modal('.modal-checking-details-form', { modalBtnClose: '.btn-modal-close' })
    this.modalCheckingInfoForm = new Modal('.modal-checking-info-form', { modalBtnClose: '.btn-modal-close', })
  }

  initSwiper() {
    this.roomsSlider = new Swiper('.rooms-slider-rent-room', {
      spaceBetween: 10,
      observeSlideChildren: true,
      observer: true,
      pagination: {
        el: '.paging-slider-rent-rooms',
      },
      navigation: {
        nextEl: '.btn-slider-rent-rooms-next',
        prevEl: '.btn-slider-rent-rooms-prev',
      },
    })
  }

  initDatePickers() {
    this.inputDate = this.rentRoom.querySelector('.input-date');
    this.inputMonth = this.rentRoom.querySelector('.input-month');

    if (this.inputDate) {
      this.inputDate.value = getFormattedDate('DD-MM-YYYY');
      this.agrBegDatePicker = new AirDatepicker(this.inputDate, {
        dateFormat: 'dd-MM-yyyy',
        position: 'bottom center',
        startDate: new Date(),
        autoClose: true,
        minDate: formatAsYYYYMMDD(addDaysToDate(new Date(), 0)),
        maxDate: formatAsYYYYMMDD(addDaysToDate(new Date(), 30)),
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
        onSelect: ({ date, datepicker }) => {
          datepicker.$el.classList.remove('just-validate-error-field');
          this.agrBegDate = getFormattedDate('YYYY-MM-DD', date);
        }
      });

      if (!this.agrBegDate) {
        this.agrBegDate = getFormattedDate('YYYY-MM-DD')
      }
    }
  }

  events() {
    if (!this.rentRoom || !this.roomIds.length) return

    document.addEventListener('click', e => {
      if (e.target.closest('.tab-registration')) {
        e.preventDefault()
        this.authorizationTabs.switchTabs(this.authorizationTabs.tabs.querySelector('.btn-registration'))
      }

      if (e.target.closest('.tab-authorization')) {
        e.preventDefault()
        this.authorizationTabs.switchTabs(this.authorizationTabs.tabs.querySelector('.btn-authorization'))
      }

      if (e.target.closest('.item-month')) {
        const itemMonth = e.target.closest('.item-month')
        const month = +itemMonth.getAttribute('data-month')
        const itemMonthActive = this.rentRoom.querySelector('.item-month._active')
        if (!month) return

        const [price, deposit] = this.calculatePriceAndDepositByMonth(month, this.agreementData)

        this.inputMonth.classList.remove('just-validate-error-field')
        this.inputMonth.value = month
        this.month = month

        itemMonthActive && itemMonthActive.classList.remove('_active')
        itemMonth && itemMonth.classList.add('_active')

        this.payment.scrollIntoView({ behavior: "smooth", block: "start" })

        this.changePriceSum(price, deposit)
      }

      if (e.target.closest('.button-send-form-payment-invoice')) {
        this.formDataPaymentInvoice && sendFormAgreementInvoice(this.formDataPaymentInvoice, this.loader).then(data => {
          if (!data) return
          this.modalCheckingInfoForm.modal.querySelector('.btn-download-invoice')?.setAttribute('data-bill-id', data.bill_id)
          this.modalCheckingInfoForm.modal.querySelector('.content').innerHTML = formInfoModal({ ...data, email: this.user.email })
          this.modalCheckingInfoForm.open()
        })
      }

      if (e.target.closest('.btn-download-invoice')) {
        const btn = e.target.closest('.btn-download-invoice')
        const bill_id = btn.getAttribute('data-bill-id')
        if (bill_id) {
          downloadBill(bill_id, this.loader, '/account.html')
        }
      }
    })

    this.inputFile && this.inputFile.addEventListener('change', e => {
      if (e.target.files.length) {
        e.target.parentElement.classList.remove('_error')
        this.inputFile.parentElement.querySelector('b').innerHTML = e.target.files[0].name
      } else {
        e.target.parentElement.classList.add('_error')
        this.inputFile.parentElement.querySelector('b').innerHTML = ''
      }
    })

    this.inputMonth && this.inputMonth.addEventListener('input', e => {
      const itemMonthActive = this.rentRoom.querySelector('.item-month._active')
      const itemMonthCurrent = this.rentRoom.querySelector(`.item-month[data-month="${this.inputMonth.value}"]`)
      const value = this.inputMonth.value
      this.month = value

      if (+value === 0) {
        this.inputMonth.value = ''
      } else if (this.inputMonth.value.length > 2) {
        this.inputMonth.value = value.slice(0, 2)
      } else {
        this.inputMonth.value = value.replace(/[^0-9]/g, '')
      }

      const [price, deposit] = this.calculatePriceAndDepositByMonth(value, this.agreementData)

      if (+value.slice(0, 1) !== 1 && this.inputMonth.value.length === 1 || this.inputMonth.value.length > 1) {
        e.target.blur()
        this.payment.scrollIntoView({ behavior: "smooth", block: "start" })
      }

      this.inputMonth.classList.remove('just-validate-error-field')

      itemMonthActive && itemMonthActive.classList.remove('_active')
      itemMonthCurrent && itemMonthCurrent.classList.add('_active')

      this.changePriceSum(price, deposit)
    })

    this.formPaymentOnline && this.formPaymentOnline.addEventListener('submit', this.submitPaymentOnline.bind(this))
    this.formPaymentInvoice && this.formPaymentInvoice.addEventListener('submit', this.submitPaymentInvoice.bind(this))
    this.formAgreementConclusion && this.formAgreementConclusion.addEventListener('submit', this.submitAgreementConclusion.bind(this))

    this.authorization.options.onAuth = () => this.onAuth()
    this.registration.options.onReg = () => this.onAuth('register')

    this.promoCode.onApply = (data) => {
      this.updatePriceDisplay(data)
      this.changePriceSum(data.amount_1m, data.deposit_1m)
      this.promocode = data.promocode
    }
  }

  onAuth(auth = 'auth') {
    apiWithAuth.defaults.headers.Authorization = getCookie('token');
    ym(97074608, 'reachGoal', auth)
    this.swapStep(this.activeIndexStep = 1);
    this.getUser();
  }

  init() {
    if (!this.rentRoom || !this.roomIds.length) return

    if (this.isAuth) {
      this.activeIndexStep = this.urlParams.get('step') ? +this.urlParams.get('step') : 1
      this.swapStep(this.activeIndexStep)
      this.getUser()
      if (this.activeIndexStep == 2) {
        ym(97074608, 'reachGoal', 'order')
      }
    }

    if (this.roomIds.length) {
      this.renderRooms(buildQueryParams({ room_ids: JSON.stringify(this.roomIds) }))
    }
  }

  swapStep(index) {
    if (!this.steps.length || !this.stepProgress.length) return
    const activeStepProgress = this.rentRoom.querySelector('.step-progress._active')
    const activeStep = this.rentRoom.querySelector('.rent-room-step._step-active')

    activeStepProgress && activeStepProgress.classList.remove('_active')
    this.stepProgress[index].classList.add('_active')

    activeStep && activeStep.classList.remove('_step-active')
    this.steps[index].classList.add('_step-active')

    if (this.scaleProgress) {
      this.scaleProgress.style.width = this.scaleValues[index] + '%'
    }

    if (index == 1) {
      this.cards.render(this.loader)
      this.payment.classList.remove('_none')
    } else {
      this.payment.classList.add('_none')
    }
  }

  submitPaymentOnline(e) {
    if (!this.agrBegDate) {
      this.inputDate.classList.add('just-validate-error-field')
      this.scrollToErrInput(this.inputDate)
      return
    } else {
      this.inputDate.classList.remove('just-validate-error-field')
    }

    if (!this.month) {
      this.inputMonth.classList.add('just-validate-error-field')
      this.scrollToErrInput(this.inputMonth)
      return
    } else {
      this.inputMonth.classList.remove('just-validate-error-field')
    }

    if (!this.validatorPaymentOnline.isValid) return

    const formData = new FormData(e.target)

    formData.delete('card-number')
    formData.delete('exp-date')
    formData.delete('cvc')
    formData.delete('privacy-policy')

    formData.set('room_ids', JSON.stringify(this.roomIds))
    formData.set('user_type', 'f')
    formData.set('num_monthes', this.month)
    formData.set('agrbegdate', this.agrBegDate)
    formData.set('autopay', formData.get('auto-payments') ? 1 : 0)
    formData.set('return_url', location.href + `&step=2&num_monthes=${this.month}&agrbegdate=${this.agrBegDate}`)

    if (this.promocode) {
      formData.set('promocode', this.promocode)
    }

    formData.delete('auto-payments')

    payBeforeAgreement(formData, this.loader)
  }

  submitPaymentInvoice(e) {
    e.preventDefault()
    if (!this.agrBegDate) {
      this.inputDate.classList.add('just-validate-error-field')
      this.scrollToErrInput(this.inputDate)
      return
    } else {
      this.inputDate.classList.remove('just-validate-error-field')
    }

    if (!this.month) {
      this.inputMonth.classList.add('just-validate-error-field')
      this.scrollToErrInput(this.inputMonth)
      return
    } else {
      this.inputMonth.classList.remove('just-validate-error-field')
    }

    if (this.validatorPaymentInvoice.isValid) {
      const formData = new FormData(e.target)
      let data = {}

      formData.set('room_ids', JSON.stringify(this.roomIds))
      formData.set('num_monthes', this.month)
      formData.set('agrbegdate', this.agrBegDate)
      formData.set('user_type', 'u')
      formData.set('rent_or_test', 'rent')

      if (this.promocode) {
        formData.set('promocode', this.promocode)
      }

      formData.delete('privacy-policy')

      Array.from(formData).forEach(arr => data[arr[0]] = arr[1])

      data.price = this.sumPriceCells
      data.email = this.user.email
      data.fio = `${this.user.familyname} ${this.user.firstname} ${this.user.patronymic}`

      this.formDataPaymentInvoice = formData

      this.modalCheckingDetailsForm.modal.querySelector('.content').innerHTML = formDetailsModal(data)
      this.modalCheckingDetailsForm.open()
    } else {
      this.scrollToErrInput(this.formPaymentInvoice.querySelector('.just-validate-error-field'))
    }
  }

  submitAgreementConclusion(e) {
    e.preventDefault()

    if (!this.user.approved) {
      if (this.inputFile.files.length) {
        this.inputFile.parentElement.classList.remove('_error')
      } else {
        this.inputFile.parentElement.classList.add('_error')
        return
      }
    }

    if (this.validatorAgreementConclusion.isValid) {
      const formData = new FormData(this.formAgreementConclusion)

      formData.set('room_ids', JSON.stringify(this.roomIds))
      formData.set('user_type', 'f')
      formData.set('num_monthes', this.month)
      formData.set('agrbegdate', this.agrBegDate)
      formData.set('rent_or_test', 'rent')

      if (this.promocode) {
        formData.set('promocode', this.promocode)
      }

      sendFormNewAgreement(formData, this.loader)
    } else {
      this.scrollToErrInput(this.formAgreementConclusion.querySelector('.input.just-validate-error-field'))
    }
  }

  async renderRooms(queryParams) {
    try {
      this.loader.enable()
      const response = await api.get(`/_form_new_agreement_get_${queryParams}`)

      if (response.status !== 200) return
      this.agreementData = response.data
      const { rooms, amount_1m, deposit_1m } = response.data
      const bottomRoomsSlider = this.rentRoom.querySelector('.bottom-rooms-slider-rent-room')

      if (!rooms || !rooms?.length) return
      this.rooms.innerHTML = ''

      rooms.forEach(room => {
        this.rooms.insertAdjacentHTML('beforeend', roomHtml(room))
      });

      if (bottomRoomsSlider && rooms.length === 1) {
        bottomRoomsSlider.classList.add('_none')
      }

      this.updatePriceDisplay(response.data)
      this.changePriceSum(amount_1m, deposit_1m)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  updatePriceDisplay(data) {
    const dataAmount = this.rentRoom.querySelectorAll('[data-amount]');
    dataAmount.length && dataAmount.forEach(amount => {
      const itemMonth = amount.closest('.item-month');
      const price = data[amount.getAttribute('data-amount')];
      itemMonth.setAttribute('data-price', price);
      amount.textContent = `от ${formattingPrice(price)}`;
    });
  }

  async getUser() {
    try {
      this.loader.enable()
      const response = await api.get('/_profile_', {
        headers: {
          Authorization: getCookie('token'),
        },
      })

      if (response.status !== 200) return
      const inputsAgreementConclusion = this.rentRoom.querySelectorAll('.input-agreement-conclusion')
      const inputsU = this.rentRoom.querySelectorAll('.rent-room__payment_input')
      const { user } = response.data
      this.user = user

      inputsAgreementConclusion.length && inputsAgreementConclusion.forEach(input => {
        input.value = user[input.name] ? user[input.name] : ''
      })

      inputsU.length && inputsU.forEach(input => {
        input.value = user[input.name] ? user[input.name] : ''
      })

      if (user.user_type === 'f') {
        document.querySelector('.rent-room__payment_tabs').classList.add('_none')
        this.paymentTabs.switchTabs(document.querySelector('[data-tabs-btn="payment-rent-room-tabs-0"]'))
      } else if (user.user_type === 'u') {
        document.querySelector('.rent-room__payment_tabs').classList.add('_none')
        this.paymentTabs.switchTabs(document.querySelector('[data-tabs-btn="payment-rent-room-tabs-1"]'))
      } else {
        document.querySelector('.rent-room__payment_tabs').classList.remove('_none')
      }

      if (this.activeIndexStep == 2 && this.user.approved) {
        const formData = new FormData()

        formData.set('room_ids', JSON.stringify(this.roomIds))
        formData.set('user_type', 'f')
        formData.set('num_monthes', this.month)

        sendFormNewAgreement(formData, this.loader)
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  scrollToErrInput(input) {
    if (!input) return
    if (input.name === 'privacy-policy') {
      this.formPaymentInvoice.querySelector('.privacy-policy').scrollIntoView({ behavior: "smooth", block: "center" })
    } else {
      input.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  calculatePriceAndDepositByMonth(month, agreementData) {
    let price = 0, deposit = 0
    if (month < 6) {
      price = agreementData.amount_1m
      deposit = agreementData.deposit_1m
    } else if (month >= 6 && month <= 10) {
      price = agreementData.amount_6m
      deposit = agreementData.deposit_6m
    } else if (month > 10) {
      price = agreementData.amount_11m
      deposit = agreementData.deposit_11m
    }

    return [price, deposit]
  }

  changePriceSum(priceSum, deposit) {
    const infoPaymentRentRoom = this.rentRoom.querySelector('.info-payment-rent-room')
    infoPaymentRentRoom.innerHTML = `<span>Арендный платеж за первый месяц</span><b style="text-align: right;">${formattingPrice(+priceSum)}</b>
                       <span>Депозит (вернется после окончания аренды)</span><b style="text-align: right;">${formattingPrice((+deposit))}</b>`

    this.resultPriceRooms.length && this.resultPriceRooms.forEach((el, i) => {
      el.textContent = formattingPrice(+priceSum + +deposit) + '/мес'
    })
  }
}

export default RentRoom 