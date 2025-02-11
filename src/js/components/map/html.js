import { declOfNum } from '../../utils/declOfNum.js'
import { formattingPrice } from '../../utils/formattingPrice.js'

export function markerContent(data) {
	return `
  <div class="marker__content">
    <img src="${
			window.app.directory
		}/assets/img/icons/map-marker.png" alt="Иконка" class="marker__img img-default">
    <img src="${
			window.app.directory
		}/assets/img/icons/map-marker-2.png" alt="Иконка" class="marker__img img-active">
    <span class="marker__price">от ${formattingPrice(data.min_price)}</span>
    <span class="marker__rooms">${data.cnt_free}</span>
  </div>`
}

export function modalWarehouse(data) {
	return `
  <div class="map__modal_warehouse">
    <div class="map__modal_warehouse-content">
      <h6 class="map__modal_warehouse-name">
        <span>${
					data.warehouse_metro ? data.warehouse_metro : 'Скоро открытие'
				}</span>
        <div class="map__modal_warehouse-distance">
          <img src="${
						window.app.directory
					}/assets/img/icons/m.png" alt="Иконка">
          <span>1 км</span>
        </div>
      </h6>
      <address class="map__modal_warehouse-address">${
				data.warehouse_address ? data.warehouse_address : 'Адрес уточняется'
			}</address>
      <span class="map__modal_warehouse-work">Круглосуточно</span>
    </div>
    <div class="map__modal_warehouse-block">
      <span>
      ${`${data.cnt_free ? data.cnt_free : 'Нет данных'}
        ${data.cnt_free &&
					declOfNum(data.cnt_free, ['свободная', 'свободных', 'свободных'])} 
        ${data.cnt_free &&
					declOfNum(data.cnt_free, ['кладовка', 'кладовки', 'кладовок'])}`}
      </span>
    <a href="${location.origin}/warehouse/${
		data.warehouse_id
	}" class="map__modal_warehouse-link button">
      <span>${
				data.min_price
					? 'от ' + formattingPrice(data.min_price)
					: 'Забронировать'
			}</span>
    </a>
    </div>
  </div>`
}

export function modalWarehouseCurrent(data) {
	return `
    <div class="map__modal_close modal__close">
    <span></span>
    <span></span>
  </div>
  <div class="modal-info-warehouse__top">
    <h6 class="modal-info-warehouse__metro">${
			data.warehouse_metro ? data.warehouse_metro : 'Скоро открытие'
		}</h6>
    <address class="modal-info-warehouse__address">${
			data.warehouse_address ? data.warehouse_address : 'Адрес уточняется'
		}</address>
  </div>

  <ul class="modal-info-warehouse__location">
    <li>м. ${data.warehouse_metro ? `${data.warehouse_metro} (1 км)` : ''}</li>
  </ul>

  ${
		wpData.phone
			? `<a href="tel:+${wpData.phone.replace(
					/\D/g,
					''
			  )}" class="modal-info-warehouse__phone">${wpData.phone}</a>`
			: ''
	}

  <ul class="modal-info-warehouse__info">
    <li>
      ${data.cnt_free ? data.cnt_free : 'Нет данных'}
      ${data.cnt_free &&
				declOfNum(data.cnt_free, ['свободная', 'свободных', 'свободных'])} 
      ${data.cnt_free &&
				declOfNum(data.cnt_free, ['кладовка', 'кладовки', 'кладовок'])}
    </li>
    <li>Круглосуточно</li>
    <li>Без выходных</li>
  </ul>

  <div class="modal-info-warehouse__bottom">
    <a href="${location.origin}/warehouse/${
		data.warehouse_id
	}" class="modal-info-warehouse__link button">
      <span>Выбрать кладовку</span>
    </a>
  </div>`
}
// <span class="modal-info-warehouse__rating">4.4 балла из 5</span>

export function warehouseList(data) {
	return `
    <div class="map__warehouse">
    <div class="map__warehouse_top">
      <h6 class="map__warehouse_metro">${
				data.warehouse_metro ? data.warehouse_metro : 'Скоро открытие'
			}</h6>
      <address class="map__warehouse_address">${
				data.warehouse_address ? data.warehouse_address : 'Адрес уточняется'
			}</address>
    </div>
    <div class="map__warehouse_row">
      <div class="map__warehouse_location">
        <img src="${
					window.app.directory
				}/assets/img/icons/m-2.png" alt="Иконка">
        <span>1 км</span>
      </div>
      <span class="map__warehouse_rooms">
        ${data.cnt_free ? data.cnt_free : 'Нет данных'} из ${
		data.cnt_all ? data.cnt_all : 'Нет данных'
	} 
        ${data.cnt_free &&
					declOfNum(data.cnt_free, ['кладовка', 'кладовки', 'кладовок'])} 
        ${data.cnt_free &&
					declOfNum(data.cnt_free, ['свободная', 'свободных', 'свободных'])}
      </span>
    </div>
    <a href="${location.origin}/warehouse/${
		data.warehouse_id
	}" class="map__warehouse_link button">
      <span>${
				data.min_price ? 'от ' + formattingPrice(data.min_price) : 'Нет данных'
			}</span>
    </a>
  </div>`
}
