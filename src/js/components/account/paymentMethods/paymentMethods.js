import { Tabs } from "../../../modules/myTabs.js"
import { Loader } from "../../../modules/myLoader.js"
import { Accordion } from "../../../modules/myAccordion.js"

import { validateLinkNewBankingDetails } from "./validate.js"

import { apiWithAuth } from "../../../settings/api.js"
import { outputInfo } from "../../../utils/outputinfo.js"

import { getClientTotalData } from "../request.js"
import { cardHtml } from "./html.js"

import Cards from "../../cards/cards.js"

class PaymentMethods {
  constructor() {
    this.accountPaymentMethods = document.querySelector('.account-payment-methods')

    this.paymentMethodsTabs = new Tabs('account-tabs', {
      btnSelector: '.payment-methods-tabs-btn',
      contentSelector: '.payment-methods-tabs-content',
      // activeIndexTab: 1,
    })
    this.accordion = new Accordion('.account-payment-methods')

    this.loader = new Loader(document.querySelector('.main'), {
      isHidden: false, customSelector: 'custom-loader', position: 'fixed', id: 'payment-methods-loader'
    })

    this.cards = new Cards(this.accountPaymentMethods.querySelector('.payment-methods-tabs-content'), { isLinkCard: false })

    this.tabsButtons = document.querySelector('.payment-methods-tabs-buttons')

    this.formLinkNewBankingDetails = document.querySelectorAll('.form-link-new-banking-details')

    this.paymentBankTransfer = this.accountPaymentMethods.querySelector('.payment-bank-transfer')

    this.events()
  }

  events() {
    this.formLinkNewBankingDetails.length && this.formLinkNewBankingDetails.forEach(form => {
      const validator = validateLinkNewBankingDetails(form)

      form.addEventListener('submit', e => {
        if (validator.isValid) {
          const formData = new FormData(e.target)
          this.addRequisites(formData).then(data => {
            if (data.msg_type === 'success') {
              form.reset()
              validator.refresh()
            }
          })
        }
      })
    })

    this.accountPaymentMethods.addEventListener('click', e => {
      if (e.target.closest('.btn-link-card')) {
        const formData = new FormData()
        formData.append('return_url', location.href)
        this.attachCard(formData)
      }
    })

    document.addEventListener('change', e => {
      if (e.target.name === 'requisites') {
        this.makeRequisitesActive(e.target.value)
      }
    })
  }

  async addRequisites(formData) {
    try {
      this.loader.enable()
      const response = await apiWithAuth.post('/_add_requisites_', formData)

      if (response.status !== 200) return
      outputInfo(response.data)
      if (response.data.msg_type = 'success') {
        this.renderPaymentMethods()
      }
      return response.data
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async renderPaymentMethods({ clientTotalData }) {
    try {
      this.loader.enable()
      const clientCardsList = await this.cards.render()

      if (!clientTotalData) return
      const { client, requisites } = clientTotalData

      this.paymentBankTransfer.innerHTML = ''

      if (client.user_type === 'f') {
        this.tabsButtons.classList.add('_none')
        this.paymentMethodsTabs.switchTabs(document.querySelector('.payment-methods-tabs-btn[data-tabs-btn="account-tabs-0"]'))
      } else if (client.user_type === 'u') {
        this.tabsButtons.classList.add('_none')
        this.paymentMethodsTabs.switchTabs(document.querySelector('.payment-methods-tabs-btn[data-tabs-btn="account-tabs-1"]'))
      } else {
        this.tabsButtons.classList.remove('_none')
      }

      requisites?.length && requisites.forEach(requisite => {
        this.paymentBankTransfer.insertAdjacentHTML('beforeend', cardHtml(requisite))
      })
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async makeRequisitesActive(requisites_id) {
    try {
      this.loader.enable()
      const response = await apiWithAuth.post(`/_make_requisites_active_/${requisites_id}`)

      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async attachCard(formData) {
    try {
      this.loader.enable()
      const response = await apiWithAuth.post('/_attach_card_', formData)

      if (response.status !== 200) return
      if (response.data.msg_type === 'success') {
        location.href = response.data.payment_url
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default PaymentMethods