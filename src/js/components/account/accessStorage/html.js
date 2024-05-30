import { formattingPrice } from "../../../utils/formattingPrice.js";

export function storageRoomHtml(data) {
  return `<div class="txt-content-product" data-room-id="${data.room_id ? data.room_id : ''}">
                    <div class="top-row">
                      <p class="title">${data.room_id ? 'Кладовка ' + data.room_id : ''}</p>
                      <p class="price">${data.price ? 'от ' + formattingPrice(data.price) + '/мес.' : ''}</p>
                    </div>
                    <div class="row-2">
                      <p class="main-attribute">Электромеханический замок</p>
                      <div class="right-block">
                        <p>${data.volume ? data.volume + ' м³' : ''}</p>
                        <p>${data.floor ? data.floor : ''} ярус</p>
                      </div>
                    </div>
                    <div class="container-attributes">
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
                    </div>
                  </div>`
}

export function rooms2Html(data) {
  return `
  <div class="agreement2__container-bottom__row__block room-bottom account-storerooms-rooms__slider-slide swiper-slide" data-room-id="${data.room_id ? data.room_id : ''}">
                <div class="agreement2__container-bottom__row__block__row-1 account-storerooms-rooms__slider-slide_top">
                  <h4>${data.room_id ? 'Кладовка ' + data.room_id : ''}</h4>
                  <p>
                    <span>${data.volume ? data.volume + ' м³' : ''}</span>
                    <span>${data.floor ? data.floor : ''} этаж</span>
                  </p>
                </div>
                <div class="agreement2__container-bottom__row__block__row-2 account-storerooms-rooms__slider-slide_content">
                  <span>${data.dimensions ? data.dimensions : ''}</span>
                  <b>${data.price_1m ? formattingPrice(data.price) : ''}</b>
                </div>
                <div class="agreement2__container-bottom__row__block__row-3 container-bottom-grid account-storerooms-rooms__slider-slide_bottom">
                ${data.rented === 1 ? `<button class="btn-complete-lease button" data-room-id="${data.room_id ? data.room_id : ''}"><span>Завершить аренду</span></button>` : ''}
                  <button class="btn-payment btn-modal-payments-room-open button" data-room-id="${data.room_id ? data.room_id : ''}" data-agreement-id="${data.agrid ? data.agrid : ''}" data-months="${data.rent_period ? data.rent_period : ''}"><span>Оплатить</span></button>
                  <!--<button class="btn-download-agreement button-3" data-room-id="${data.room_id ? data.room_id : ''}"><span>Скачать договор</></button>-->
                </div>
              </div>`
}

export function warehouseModalHtml(data) {
  return `
  <div class="modal-select-warehouse__warehouse btn-modal-close" data-warehouse-id="${data.warehouse_id ? data.warehouse_id : ''}">
            <div class="modal-select-warehouse__warehouse_img">
              <img src="img/warehouse-2.png" alt="Картинка">
            </div>
            <div class="modal-select-warehouse__warehouse_content">
              <h6>${data.warehouse_name ? data.warehouse_name : ''}</h6>
              <address>
                <svg class='icon icon-placemark'>
                  <use xlink:href='img/svg/sprite.svg#placemark'></use>
                </svg>
                <span>${data.warehouse_address ? data.warehouse_address : ''}</span>
              </address>
            </div>
          </div>`
}

export function roomModalHtml(data) {
  return `<div class="modal-select-room-access__room" data-room-id="${data.room_id ? data.room_id : ''}">
            <h6>${data.room_id ? 'Кладовка ' + data.room_id : ''}</h6>
            <div>
              <span>${data.volume ? data.volume + ' м³' : ''}</span>
              <span>${data.floor ? data.floor + ' ярус' : ''}</span>
            </div>
            <button class="button btn-open-room-modal btn-modal-close" data-room-id="${data.room_id ? data.room_id : ''}"><span>Открыть</span></button>
          </div>`
}