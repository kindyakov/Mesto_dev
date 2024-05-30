import { formattingPrice } from "../../utils/formattingPrice.js"

export function warehouseRoom(data, isSelected = false) {
  return `
  <div class="warehouse__rooms_room room-warehouse ${isSelected ? '_selected' : ''}" data-room-id="${data.room_id && data.room_id}" data-warehouse-id="${data.warehouse_id && data.warehouse_id}">
    <div class="warehouse__rooms_room-content">
      <span class="warehouse__rooms_room-num">${data.room_id ? '№' + data.room_id : ''}</span>
      <span class="warehouse__rooms_room-area">${data.volume ? data.volume + ' м<sup>3</sup>' : ''}</span>
      <div class="warehouse__rooms_room-block dimensions">
        <span>размер кладовки</span>
        <b>${data.dimensions ? data.dimensions + ' м' : ''}</b>
      </div>
      <div class="warehouse__rooms_room-block floor">
        <span>ярус</span>
        <b>${data.floor ? data.floor : ''}</b>
      </div>
    </div>
    <a href="../room.html?id=${data.room_id}" class="warehouse__rooms_room-link button link-rent-storage-room">
      <span>${data.price_11m ? 'от ' + formattingPrice(data.price_11m) : ''}</span>
    </a>
  </div>`
}