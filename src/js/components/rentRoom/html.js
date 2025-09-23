<<<<<<< HEAD
import { formattingPrice } from '../../utils/formattingPrice.js'
=======
import { formattingPrice } from "../../utils/formattingPrice.js";
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53

export function roomHtml(data) {
  return `
  <div class="rent-room__room swiper-slide">
    <div class="rent-room__room_img">
<<<<<<< HEAD
      <img src="${window.app.directory}/assets/img/rooms.jpg" alt="Картинка">
    </div>
    <div class="rent-room__room_content">
      <div class="rent-room__room_top">
        <h4 class="rent-room__room_title">${data.room_name ? 'Кладовка ' + data.room_name : ''
    }</h4>
        <span class="rent-room__room_price">${data.price_11m ? 'от ' + formattingPrice(data.price_11m) + '/мес.' : ''
    }</span>
=======
      <img src="img/rooms.jpg" alt="Картинка">
    </div>
    <div class="rent-room__room_content">
      <div class="rent-room__room_top">
        <h4 class="rent-room__room_title">${data.room_id ? 'Кладовка ' + data.room_id : ''}</h4>
        <span class="rent-room__room_price">${data.price ? 'от ' + formattingPrice(data.price) + '/мес.' : ''}</span>
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
      </div>
    <div class="rent-room__room_features"><span>Электромеханический замок</span></div>
      <ul class="rent-room__room_characteristic">
        <li>
          <span>Площадь</span>
          <b>${data.area ? data.area + ' м<sup>2</sup>' : ''}</b>
        </li>
        <li>
          <span>Объём</span>
          <b>${data.volume ? data.volume + ' м<sup>3</sup>' : ''}</b>
        </li>
        <li>
          <span>Размер кладовки (ДхШхВ)</span>
          <b>${data.dimensions ? data.dimensions : ''}</b>
        </li>
      </ul>
    </div>
  </div>`
}

export function formDetailsModal(data) {
  return `
  <b>Проверка и подтверждение выписки счета</b>
  <span>Организация: "${data.fullname ? data.fullname : ''}"</span>
  <span>ИНН: ${data.inn ? data.inn : ''}</span>
  <span>Сумма: ${data.price ? formattingPrice(data.price) : ''}</span>
  <span>Email: ${data.email ? data.email : ''}</span>
  <span>Адрес: ${data.address ? data.address : ''}</span>`
}
// <span>КПП ${data.kpp}</span>

export function formInfoModal(data) {
<<<<<<< HEAD
  return `<b style="align-items: center;">Счет ${data.bill_id ? data.bill_id : ''
    } сформирован и отправлен вам на почту ${data.email ? data.email : ''}</b>`
}
=======
  return `<b style="align-items: center;">Счет ${data.bill_id ? data.bill_id : ''} сформирован и отправлен вам на почту ${data.email ? data.email : ''}</b>`
}
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
