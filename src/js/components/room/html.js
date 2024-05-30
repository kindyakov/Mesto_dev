import { formattingPrice } from "../../utils/formattingPrice.js"

function getImg(area) {
  const images = {
    1: 'img/rooms/1_kv_m.png',
    2: 'img/rooms/2_kv_m.png',
    3: 'img/rooms/3_kv_m.png',
    4: 'img/rooms/4_kv_m.png',
    5: 'img/rooms/5_kv_m.png',
    6: 'img/rooms/6_kv_m.png',
    7: 'img/rooms/7_kv_m.png',
    8: 'img/rooms/8_kv_m.png',
    9: 'img/rooms/9_kv_m.png',
  };

  // Округляем вниз, чтобы получить целое значение
  let flooredArea = Math.floor(area);

  // Убедимся, что значение не превышает 9
  let clampedArea = Math.min(flooredArea, 9);

  return images[clampedArea];
}

export function roomSlide(data) {
  return `
  <div class="special-offer__slider-slide cards-slider__slide swiper-slide" data-room-id="${data.room_id ? data.room_id : ''}">
    <div class="cards-slider__slide_img">
      <img src="${data.area ? getImg(data.area) : ''}" alt="Фото кладовки">
    </div>
    <div class="cards-slider__slide_content">
      <div class="cards-slider__slide_row">
        <h5 class="cards-slider__slide_title">${data.volume ? data.volume + ' м<sup>3</sup>' : ''}</h5>
        <svg class='icon icon-arrow-cos'>
          <use xlink:href='img/svg/sprite.svg#arrow-cos'></use>
        </svg>
      </div>
      <address class="cards-slider__slide_address">
        <svg class='icon icon-placemark'>
          <use xlink:href='img/svg/sprite.svg#placemark'></use>
        </svg>
        <span>${data.warehouse_address ? data.warehouse_address : ''}</span>
      </address>
      <div class="cards-slider__slide_prices">
        <span class="cards-slider__slide_price price-count">${data.price ? 'от ' + formattingPrice(data.price) : ''}</span>
        <strike class="cards-slider__slide_price-old price-old">${data.price ? formattingPrice(data.price + 300) : ''}</strike>
      </div>
      <a href="./room.html?id=${data.room_id ? data.room_id : ''}" class="cards-slider__slide_button button"><span>Забронировать</span></a>
    </div>
  </div>`
}