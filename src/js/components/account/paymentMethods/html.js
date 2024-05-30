export function cardHtml(data) {
  return `<label class="payment-cards__card">
                    <span>${data.bank ? data.bank : ''} ${data.rs ? data.rs : ''}</span>
                    <p>Основной способ</p>
                    <input type="radio" name="requisites" class="rent-room__payment_input-radio input-radio"
                      id="card-payment-${data.requisites_id ? `${data.requisites_id}-${new Date().getTime()}` : ''}" value="${data.requisites_id ? data.requisites_id : ''}">
                    <label for="card-payment-${data.requisites_id ? `${data.requisites_id}-${new Date().getTime()}` : ''}" class="rent-room__payment_label label-radio"></label>
                  </label>`
}