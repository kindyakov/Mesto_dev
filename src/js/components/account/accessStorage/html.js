<<<<<<< HEAD
import { formattingPrice } from '../../../utils/formattingPrice.js'

export function storageRoomHtml(data) {
	return `<div class="txt-content-product" data-room-id="${
		data.room_id ? data.room_id : ''
	}">
                    <div class="top-row">
                      <p class="title">${
												data.room_name ? 'Кладовка ' + data.room_name : ''
											}</p>
                      <p class="price">${
												data.price
													? 'от ' + formattingPrice(data.price) + '/мес.'
													: ''
											}</p>
=======
import { formattingPrice } from "../../../utils/formattingPrice.js";

export function storageRoomHtml(data) {
  return `<div class="txt-content-product" data-room-id="${data.room_id ? data.room_id : ''}">
                    <div class="top-row">
                      <p class="title">${data.room_id ? 'Кладовка ' + data.room_id : ''}</p>
                      <p class="price">${data.price ? 'от ' + formattingPrice(data.price) + '/мес.' : ''}</p>
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
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
<<<<<<< HEAD
                        <p class="value-attribute">${
													data.area ? data.area + ' м²' : ''
												}</p>
                      </div>
                      <div class="row">
                        <p class="title-attribute">Объём</p>
                        <p class="value-attribute">${
													data.volume ? data.volume + ' м³' : ''
												}</p>
                      </div>
                      <div class="row">
                        <p class="title-attribute">Размер кладовки (ДхШхВ)</p>
                        <p class="value-attribute">${
													data.dimensions ? data.dimensions : ''
												}</p>
=======
                        <p class="value-attribute">${data.area ? data.area + ' м²' : ''}</p>
                      </div>
                      <div class="row">
                        <p class="title-attribute">Объём</p>
                        <p class="value-attribute">${data.volume ? data.volume + ' м³' : ''}</p>
                      </div>
                      <div class="row">
                        <p class="title-attribute">Размер кладовки (ДхШхВ)</p>
                        <p class="value-attribute">${data.dimensions ? data.dimensions : ''}</p>
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
                      </div>
                    </div>
                  </div>`
}

export function rooms2Html(data) {
<<<<<<< HEAD
	return `
  <div class="agreement2__container-bottom__row__block room-bottom account-storerooms-rooms__slider-slide swiper-slide" data-room-id="${
		data.room_id ? data.room_id : ''
	}">
                <div class="agreement2__container-bottom__row__block__row-1 account-storerooms-rooms__slider-slide_top">
                  <h4 style="line-height: 70%;">${
										data.room_name
											? 'Кладовка ' +
											  data.room_name +
											  `<br><span style="font-size: 14px;">${data.warehouse_name}</span>`
											: ''
									}</h4>
=======
  return `
  <div class="agreement2__container-bottom__row__block room-bottom account-storerooms-rooms__slider-slide swiper-slide" data-room-id="${data.room_id ? data.room_id : ''}">
                <div class="agreement2__container-bottom__row__block__row-1 account-storerooms-rooms__slider-slide_top">
                  <h4>${data.room_id ? 'Кладовка ' + data.room_id : ''}</h4>
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
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
<<<<<<< HEAD
                ${
									data.rented === 1
										? `<button class="btn-complete-lease button" data-room-id="${
												data.room_id ? data.room_id : ''
										  }"><span>Завершить аренду</span></button>`
										: ''
								}
                ${
									data.rented === 0.75
										? `<button class="button btn-open-room-modal btn-modal-close" data-room-id="${
												data.room_id ? data.room_id : ''
										  }"><span>Открыть</span></button>`
										: `<button class="btn-payment btn-modal-payments-room-open button" data-room-id="${
												data.room_id ? data.room_id : ''
										  }" data-agreement-id="${
												data.agrid ? data.agrid : ''
										  }" data-months="${
												data.rent_period ? data.rent_period : ''
										  }"><span>Оплатить</span></button>`
								}
=======
                ${data.rented === 1 ? `<button class="btn-complete-lease button" data-room-id="${data.room_id ? data.room_id : ''}"><span>Завершить аренду</span></button>` : ''}
                ${data.rented === 0.75 ? `<button class="button btn-open-room-modal btn-modal-close" data-room-id="${data.room_id ? data.room_id : ''}"><span>Открыть</span></button>` : `<button class="btn-payment btn-modal-payments-room-open button" data-room-id="${data.room_id ? data.room_id : ''}" data-agreement-id="${data.agrid ? data.agrid : ''}" data-months="${data.rent_period ? data.rent_period : ''}"><span>Оплатить</span></button>`}
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
                </div>
              </div>`
}
// <!--<button class="btn-download-agreement button-3" data-room-id="${data.room_id ? data.room_id : ''}"><span>Скачать договор</></button>-->

export function warehouseModalHtml(data) {
<<<<<<< HEAD
	return `
  <div class="modal-select-warehouse__warehouse btn-modal-close" data-warehouse-id="${
		data.warehouse_id ? data.warehouse_id : ''
	}">
            <div class="modal-select-warehouse__warehouse_img">
              <img src="${
								window.app.directory
							}/assets/img/warehouse-2.png" alt="Картинка">
=======
  return `
  <div class="modal-select-warehouse__warehouse btn-modal-close" data-warehouse-id="${data.warehouse_id ? data.warehouse_id : ''}">
            <div class="modal-select-warehouse__warehouse_img">
              <img src="img/warehouse-2.png" alt="Картинка">
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
            </div>
            <div class="modal-select-warehouse__warehouse_content">
              <h6>${data.warehouse_name ? data.warehouse_name : ''}</h6>
              <address>
                <svg class='icon icon-placemark'>
<<<<<<< HEAD
                  <use xlink:href='${
										window.app.directory
									}/assets/img/svg/sprite.svg#placemark'></use>
                </svg>
                <span>${
									data.warehouse_address ? data.warehouse_address : ''
								}</span>
=======
                  <use xlink:href='img/svg/sprite.svg#placemark'></use>
                </svg>
                <span>${data.warehouse_address ? data.warehouse_address : ''}</span>
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
              </address>
            </div>
          </div>`
}

export function roomModalHtml(data) {
<<<<<<< HEAD
	return `<div class="modal-select-room-access__room" data-room-id="${
		data.room_id ? data.room_id : ''
	}">
            <h6>${
							data.room_name
								? `Кладовка ${data.room_name}<br><span style="font-size:14px;">(${data.warehouse_name})</span>`
								: ''
						}</h6>
=======
  return `<div class="modal-select-room-access__room" data-room-id="${data.room_id ? data.room_id : ''}">
            <h6>${data.room_id ? 'Кладовка ' + data.room_id : ''}</h6>
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
            <div>
              <span>${data.volume ? data.volume + ' м³' : ''}</span>
              <span>${data.floor ? data.floor + ' ярус' : ''}</span>
            </div>
<<<<<<< HEAD
            <button class="button btn-open-room-modal btn-modal-close" data-room-id="${
							data.room_id ? data.room_id : ''
						}"><span>Открыть</span></button>
          </div>`
}
=======
            <button class="button btn-open-room-modal btn-modal-close" data-room-id="${data.room_id ? data.room_id : ''}"><span>Открыть</span></button>
          </div>`
}
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
