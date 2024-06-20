import { formattingPrice } from "../../../utils/formattingPrice.js";

function formattingMonthDDMMYYYY(date) {
  if (!date) return
  const arr = date.split('-')
  return `${arr[2]}-${arr[1]}-${arr[0]}`
}

export function agreementHtml(agreement, { rooms }) {
  const totalPrice = rooms.reduce((acc, room) => {
    if (room.agrid === agreement.agrid) {
      return acc + +room.price;
    } else {
      return acc;
    }
  }, 0);
  const currentRoomsNames = rooms.length ? rooms
    .map((room, i) => {
      if (room.agrid === agreement.agrid) {
        return i > 0 ? 'Кладовка ' + room.room_id : 'Кладовка ' + room.room_id
      } else return ''
    })
    .filter(roomName => roomName !== '') : []

  const currentRooms = rooms.length ? rooms.filter(room => room.agrid === agreement.agrid) : []

  return `
  <div class="account-storerooms__agreement agreement-account-storerooms agreement-accordion _my-accordion" data-agreement-id="${agreement.agrid ? agreement.agrid : ''}">
  <div class="account-storerooms__agreement_control agreement-accordion-control _my-accordion-control">
    <h2 class="agreement2__row__right-col__title">${agreement.agrid ? `Оферта ${agreement.agrid}` : ''}</h2>
    <span>${currentRoomsNames.length ? currentRoomsNames.join(' • ') : 'Нет ячеек'}</span>
    <svg class='icon icon-arrow-left'>
      <use xlink:href='img/svg/sprite.svg#arrow-left'></use>
    </svg>
  </div>
  <div class="account-storerooms__agreement_content agreement-accordion-content _my-accordion-content">
  <div class="agreement2__row__right-col__block-desc">
    <p>Стоимость: <span> ${totalPrice ? formattingPrice(totalPrice) : ''}</span></p>
    <p>Осталось дней: <span> ${agreement.days_left ? agreement.days_left : ''}</span></p>
    <p>Дата следующего платежа: <span>${agreement.next_payment_date ? formattingMonthDDMMYYYY(agreement.next_payment_date) : ''}</span></p>
    <p>Плановая дата окончания: <span> ${agreement.agrplanenddate ? formattingMonthDDMMYYYY(agreement.agrplanenddate) : ''}</span></p>
  </div>
  <!--<div class="account-storerooms__agreement_row">
    <button class="account-storerooms__agreement_button-download btn-download-agreement" data-agreement-id="${agreement.agrid ? agreement.agrid : ''}" 
    data-room-id="${currentRooms.length ? currentRooms[0].room_id : ''}">
      <img src="img/icons/pdf.png" alt="Иконка">
      <span>Скачать договор</span>
    </button>
  </div>-->
  <div class="agreement2__row__right-col__block-cards account-storerooms__agreement_form-payment form-payment-account-storerooms">
    <div class="row-price">
      <p class="p1">К оплате</p>
      <p class="p1 price">${totalPrice ? formattingPrice(totalPrice) : ''}</p>
    </div>
    <div class="flex-buttons" style="margin-top: 10px;">
    <button style="flex: 1 1 50%;" class="agreement2__row__right-col__btn account-storerooms__agreement_button-payment btn-payment btn-modal-payments-room-open button-2" data-agreement-id="${agreement.agrid ? agreement.agrid : ''}" data-months="${rooms[0]?.rent_period}" data-room-ids="${agreement.room_ids.length ? agreement.room_ids.join(',') : ''}"><span>Оплатить</span></button>
    <button style="flex: 1 1 50%;" class="agreement2__row__right-col__btn account-storerooms__agreement_button-payment btn-cancel-autopayments button-2" data-agreement-id="${agreement.agrid ? agreement.agrid : ''}"><span>Отменить автоплатежи</span></button> 
    </div>
  </div>
  <div class="account-storerooms__agreement_total-info-data">
    <h4>Всего по оферте</h4>
    <span>Кладовки, ${currentRoomsNames.length} шт</span>
    <b>Итого ${totalPrice ? formattingPrice(totalPrice) : ''}</b>
  </div>
  <div class="account-storerooms__rooms">
  ${rooms.length ? rooms.map(room => {
    if (room.agrid === agreement.agrid) {
      return roomsHtml(room)
    } else return ''
  }).join('') : ''}
  </div>
  </div>
  </div>`
}

export function roomsHtml(data, className = '') {
  return `
  <div class="agreement2__row__right-col__product account-storerooms__room room-account-storerooms room-accordion _my-accordion ${className}" data-room-id="${data.room_id && data.room_id}">
    <div class="account-storerooms__room_control room-accordion-control _my-accordion-control">
      <h2 class="title-product">${data.room_id ? 'Кладовка ' + data.room_id : ''}</h2>
      <p>${data.volume && '<span>' + data.volume + ' м³</span>'}${data.floor && '<span>' + data.floor + ' ярус</span>'}</p>
      <b>${data.price ? formattingPrice(data.price) : ''}</b>
      <svg class='icon icon-arrow-left'>
        <use xlink:href='img/svg/sprite.svg#arrow-left'></use>
      </svg>
    </div>  
    <div class="container-attributes account-storerooms__room_content room-accordion-content _my-accordion-content">
      <div class="row">
        <p class="title-attribute">Площадь</p>
        <p class="value-attribute">${data.area ? data.area + ' м²' : ''}</p>
      </div>
      <div class="row">
        <p class="title-attribute">Объём</p>
        <p class="value-attribute">${data.volume ? data.volume + ' м³' : ''}</p>
      </div>
      <div class="row">
        <p class="title-attribute">Размер кладовки (ДхШхВ)</p>
        <p class="value-attribute">${data.dimensions ? data.dimensions : ''}</p>
      </div>
      <button class="btn-payment btn-modal-payments-room-open button-2" data-room-id="${data.room_id ? data.room_id : ''}" data-agreement-id="${data.agrid ? data.agrid : ''}"><span>Оплатить</span></button>
    </div>
  </div>`
}

export function roomHtml2(data) {
  return `<div class="scheme-room scheme-room-old" data-room-id="${data.room_id ? data.room_id : ''}">
                <div class="scheme-room__top">
                  <h5>${data.room_id ? 'Кладовка ' + data.room_id : ''}</h5>
                  <p>${data.dimensions ? data.dimensions : ''}</p>
                  <div>
                    <span>${data.volume ? data.volume + ' м³' : ''}</span>
                    <span>${data.floor && data.floor + ' ярус'}</span>
                  </div>
                </div>
                <div class="scheme-room__bottom">
                  <button class="btn-complete-lease button" data-room-id="${data.room_id ? data.room_id : ''}"><span>Завершить аренду</span></button>
                  <button class="btn-payment button btn-modal-payments-room-open" data-room-id="${data.room_id ? data.room_id : ''}" data-agreement-id="${data.agrid ? data.agrid : ''}" data-months="${data.rent_period ? data.rent_period : ''}"><span>Оплатить</span></button>
                  <!--<button class="account-storerooms__agreement_button-download btn-download-agreement" data-room-id="${data.room_id ? data.room_id : ''}">
                    <img src="img/icons/pdf.png" alt="Иконка">
                    <span>Скачать договор</span>
                  </button>-->
                </div>
              </div>`
}

export function roomHtml3(data, isReplace = true) {
  return `<div class="scheme-room scheme-room-new" data-room-id="${data.room_id && data.room_id}">
                <div class="scheme-room__top">
                  <h5>${data.room_id ? 'Кладовка ' + data.room_id : ''}</h5>
                  <p>${data.dimensions ? data.dimensions : ''}</p>
                  <div>
                    <span>${data.volume ? data.volume + ' м³' : ''}</span>
                    <span>${data.floor && data.floor + ' ярус'}</span>
                  </div>
                </div>
                <div class="scheme-room__bottom">
                  <b>от ${data.price_11m ? formattingPrice(data.price_11m) : ''
    }</b>
  <button class="button btn-rent-room btn-modal-payments-room-open link-rent-storage-room" data-room-id="${data.room_id && data.room_id}">
    <span>Арендовать</span>
  </button>
                  ${isReplace ? `<button class="button btn-replace-room" data-room-id="${data.room_id && data.room_id}">
                    <span>Заменить</span>
                  </button>`: ''
    }                  
                </div>
              </div>`
}

export function roomModalHtml(data) {
  return `
  <div class="warehouse__rooms_room room-modal" data-room-id="${data.room_id && data.room_id}">
              <div class="warehouse__rooms_room-content">
                <span class="warehouse__rooms_room-num">${data.room_id && "№" + data.room_id}</span>
                <span class="warehouse__rooms_room-area">${data.area ? data.area + ' м²' : ''}</span>
                <div class="warehouse__rooms_room-block dimensions">
                  <span>размер кладовки</span>
                  <b>${data.dimensions ? data.dimensions : ''} м</b>
                </div>
                <div class="warehouse__rooms_room-block floor">
                  <span>ярус</span>
                  <b>${data.floor ? data.floor : ''}</b>
                </div>
              </div>
              <button class="warehouse__rooms_room-link button btn-replace-room-modal btn-modal-close" data-room-id="${data.room_id && data.room_id}">
                <span>Заменить</span>
              </button>
            </div>`
}