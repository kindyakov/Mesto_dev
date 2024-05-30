export function departureTabsHtml(data, i) {
  return `
  <div class="payment-method__row__right-col__row-top__block account-departures-tab"  data-room-id="${data.room_id ? data.room_id : ''}">
                  <p class="num">№${data.room_id ? data.room_id : ''}</p>
                  <div class="payment-method__row__right-col__row-top__block__row-bottom">
                    <p>${data.volume ? data.volume + ' м<sup>3</sup>' : ''}</p>
                    <p>${data.floor} ярус</p>
                  </div>
                </div>`
}

export function departuresRoomHtml(data) {
  return `<div class="payment-method__row__right-col__content account-departures__room account-departures-room"
                  id="payment-method__row__right-col__content-2" data-room-id="${data.room_id ? data.room_id : ''}">
                  <div class="payment-method__row__right-col__content-2__row-top">
                    <p class="p1">Дата выезда</p>
                    <label class="payment-method__row__right-col__content-2__row-top__block-data wrap-input">
                      <input type="text" name="leave_date" placeholder="ДД.ММ.ГГ" class="input not-icon-date" autocomplete="off" readonly>
                      <svg class='icon icon-calendar'>
                        <use xlink:href='img/svg/sprite.svg#calendar'></use>
                      </svg>
                    </label>
                    <button class="payment-method__row__right-col__content-2__row-top__btn btn-to-leave button-4">
                      <span>Выехать</span>
                    </button>
                  </div>
                  <div class="payment-method__row__right-col__product">
                    <h2 class="title-product">${data.room_name ? data.room_name : ''}</h2>
                    <div class="container-attributes">
                      <div class="row">
                        <p class="title-attribute">Площадь</p>
                        <p class="value-attribute">${data.area ? data.area + ' м<sup>2</sup>' : ''}</p>
                      </div>
                      <div class="row">
                        <p class="title-attribute">Объём</p>
                        <p class="value-attribute">${data.volume ? data.volume + ' м<sup>3</sup>' : ''}</p>
                      </div>
                      <div class="row">
                        <p class="title-attribute">Размер кладовки (ДхШхВ)</p>
                        <p class="value-attribute">${data.dimensions ? data.dimensions : ''}</p>
                      </div>
                    </div>
                  </div>
                  <p class="payment-method__row__right-col__content__p-bottom">
                    <span>Шаг 1: </span> Выберите кладовку и дату
                  </p>
                </div>`
}
