import { apiWithAuth } from "../../settings/api.js"
import { cardHtml, linkCardHtml } from "./html.js"
import { cardHtml as requisiteCardHtml } from "../account/paymentMethods/html.js"

class Cards {
  constructor(wrapper, options) {
    if (!wrapper) return
    this.wrapper = wrapper
    this.paymentCards = null
    this.cards = []
    this.cardsPayment = []
    this.userType = 'f'
    this.requisites = []
    this.cardId = null
    const defaultOptions = {
      isLinkCard: true
    }

    this.options = Object.assign(defaultOptions, options)

    if (this.options.isLinkCard) {
      // this.paymentCardsAccordion = new Accordion('body', {})
    }

    this.init()
  }

  init() {
    this.paymentCards = this.wrapper.querySelector('.payment-cards')
    if (!this.paymentCards) {
      this.paymentCards = document.createElement('div')
      this.paymentCards.classList.add('payment-cards')
      this.wrapper.appendChild(this.paymentCards)
    }
  }

  event() {
    if (this.paymentCards) {
      const inputs = this.paymentCards.querySelectorAll('input[type="radio"]')
      inputs.length && inputs.forEach(input => {
        input.addEventListener('change', () => {
          this.cardId = input.value || null
        })
      })
    }
  }

  getNumberCard(cardId) {
    if (!cardId || !this.cards.length) return
    const [card] = this.cards.filter(card => +card.card_id === +cardId)
    this.cardId = cardId
    return card ? card.pan : null
  }

  setCheckedInput(index = 0) {
    if (index > this.cardsPayment.length - 1) return
    const card = this.cardsPayment[index]
    const input = card.querySelector('input[name="card_id"]')

    if (input) {
      input.checked = true
      this.cardId = input.value || null
      return input
    } else {
      return null
    }
  }

  async render(loader) {
    try {
      loader && loader.enable()
      const response = await apiWithAuth.get('/_get_client_cards_list_')

      if (response.status !== 200) return
      const { cards } = response.data

      this.paymentCards.innerHTML = ''

      if (cards && cards.length) {
        cards.forEach(card => {
          this.paymentCards.insertAdjacentHTML('beforeend', cardHtml(card))
        })

        this.cardsPayment = this.paymentCards.querySelectorAll('.card-payment')

        this.cards = cards

        this.setCheckedInput()
        this.event()
      } else {
        this.paymentCards.insertAdjacentHTML('afterbegin', `<span class="payment-cards__is-no-linked-card">У Вас нет привязанной карты</span>`)
      }

      if (this.options.isLinkCard) {
        this.paymentCards.insertAdjacentHTML('beforeend', linkCardHtml())
        if (!cards.length) {
          this.paymentCards.querySelector('.input-link-card').checked = true
        }
        // this.paymentCardsAccordion.init()
      }

      if (this.userType === 'u') {
        this.paymentCards.innerHTML = ''
        this.requisites.length && this.requisites.forEach(requisite => {
          this.paymentCards.insertAdjacentHTML('beforeend', requisiteCardHtml(requisite))
        })
      }
      return cards
    } catch (error) {
      console.error(error)
    } finally {
      loader && loader.disable()
    }
  }
}

export default Cards