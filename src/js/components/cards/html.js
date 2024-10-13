function checkCardIcon(cardNumber) {
  if (!cardNumber) return
  // Определяем тип карты
  let cardType = '';
  if (/^4/.test(cardNumber)) {
    cardType = 'visa.png';
  } else if (/^5[0-5]/.test(cardNumber)) {
    cardType = 'mastercard.png';
  } else if (/^2([2-7]|6(3|7))/.test(cardNumber)) {
    cardType = 'mir.svg';
  } else {
    cardType = 'card.png'
  }
  // Возвращаем ссылку на иконку
  return cardType
}

export function cardHtml(data) {
  return `<label class="payment-cards__card card-payment">
                    <div class="payment-cards__card_img"><img src="img/icons/${checkCardIcon(data.pan)}" alt="Иконка"></div>
                    <span>• • ${data.pan ? data.pan.slice(-4) : ''}</span>
                    <input type="radio" name="card_id" class="rent-room__payment_input-radio input-radio" id="card_id-${data.card_id ? data.card_id : ''}" value="${data.card_id ? data.card_id : ''}">
                    <label for="card_id-${data.card_id ? data.card_id : ''}" class="rent-room__payment_label label-radio"></label>
                  </label>`
}

export function linkCardHtml() {
  return `<label class="payment-cards__card card-payment">
                    <img src="img/icons/card.png" alt="Иконка">
                    <span>Привязать карту</span>
                    <input type="radio" name="card_id" class="rent-room__payment_input-radio input-radio input-link-card" id="card_id-9фыв" value="null">
                    <label for="card_id-9фыв" class="rent-room__payment_label label-radio"></label>
                  </label>`
}
`<div class="payment-cards-accordion _my-accordion">
                      <div class="payment-cards-accordion__control rent-room__payment_card _my-accordion-control">
                        <img src="img/icons/card.png" alt="Иконка">
                        <span>Привязать карту</span>
                        <svg class='icon icon-arrow-right'>
                          <use xlink:href='img/svg/sprite.svg#arrow-right'></use>
                        </svg>
                      </div>
                      <div class="payment-cards-accordion__content _my-accordion-content">
                        <div class="payment-cards-accordion__content_top">
                          <b>Привязка карты</b>
                          <p>Для проверки карты, мы спишем небольшую сумму и сразу вернем.</p>
                        </div>
                        <div class="payment-cards-accordion__content_row">
                          <input type="text" name="cardnumber" placeholder="Номер карты" class="input"
                            autocomplete="cc-number">
                          <input type="text" name="expdate" placeholder="ММ/ГГ" class="input" autocomplete="cc-exp">
                          <input type="text" name="cvv" placeholder="CVV/CVC" class="input" autocomplete="cc-csc">
                          <button class="button-4"><span>Привязать</span></button>
                        </div>
                      </div>
                    </div>`