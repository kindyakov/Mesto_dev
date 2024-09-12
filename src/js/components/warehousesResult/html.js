import { declOfNum } from "../../utils/declOfNum.js"
import { formattingPrice } from "../../utils/formattingPrice.js"

export function warehousesResultAccordion({ data, isRooms = true, rangeData }) {
	const depth = location.pathname.split('/').length - 2
	const pathPrefix = depth > 0 ? '../'.repeat(depth) : ""
	let queryParams = ''

	if (rangeData) {
		if (rangeData.volume) {
			queryParams = `?volume_start=${rangeData.volume}#schemes`
		}
	}

	return `
  <div class="warehouses-result__accordion _my-accordion ${isRooms ? '' : '_only-warehouse'}" data-warehouse-id="${data.warehouse_id}">
		<div class="warehouses-result__accordion_control _my-accordion-control">
			<div class="warehouses-result__accordion_icon-control">
				<img src="${pathPrefix}img/icons/warehouses-icon-control.png" alt="Иконка">
			</div>
			<div class="warehouses-result__accordion_content-control">
				<div class="warehouses-result__accordion_names">
					<span>Кладовки</span>
					<h4>${data.warehouse_address ? data.warehouse_address : 'Нет данных'}</h4>
				</div>
			<div class="warehouses-result__accordion_info">
				<b class="warehouse-count-rooms">${isRooms ? data.num_of_rooms : data.cnt_free
		} ${declOfNum(isRooms ? data.num_of_rooms : data.cnt_free, ['кладовка', 'кладовки', 'кладовок'])}</b>
				<span class="warehouse-price">от ${formattingPrice(data.min_price)}/мес.</span>
			</div>
		</div>
			<svg class='icon icon-arrow-left'>
				<use xlink:href='${pathPrefix}img/svg/sprite.svg#arrow-right'></use>
			</svg>
		</div>
		<a href="${pathPrefix}warehouse/${data.warehouse_id}.html${queryParams}" class="warehouses-result__accordion_button button-2" data-warehouse-id="${data.warehouse_id ? data.warehouse_id : ''}"><span>Выбрать кладовку</span></a>
		${isRooms ? `
		<div class="warehouses-result__accordion_content _my-accordion-content">
      ${data.rooms?.length ? data.rooms.map(room => warehousesResultRoom(room, pathPrefix)).join('') : ''}
    </div>` : ''}
	</div>`
}

export function warehousesResultRoom(data, pathPrefix = '') {
	return `
  <div class="warehouses-result__accordion_room" data-room-id="${data.room_id}">
		<div class="warehouses-result__accordion_icon-room">
			<img src="${pathPrefix}img/icons/warehouses-icon-room.png" alt="Иконка">
		</div>
		<h5 class="warehouses-result__accordion_name-room">${data.room_name ? 'Кладовка ' + data.room_name : ''}</h5>
		<ul class="warehouses-result__accordion_content-room">
			<li class="volume">
				<span>Объем</span>
				<b>${data.volume} м³</b>
				</li>	
			<li class="area">
				<span>Площадь</span>
				<b>${data.area} м²</b>
			</li>
			<li class="dimensions">
				<span>Размеры</span>
				<b>${data.dimensions}</b>
			</li>
			<li class="price">
				<span>Стоимость</span>
				<b>от ${formattingPrice(data.price_11m)}/мес.</b>
			</li>
		</ul>
		<a href="${pathPrefix}room.html?id=${data.room_id}" class="warehouses-result__accordion_link-room button-2"><span>Подробнее</span>
			<svg class='icon icon-more'>
				<use xlink:href='${pathPrefix}img/svg/sprite.svg#more'></use>
			</svg>
		</a>
	</div>`
}