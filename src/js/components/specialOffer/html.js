export function cardHtml(data, isFos = false) {
  return `<div class="special-offer__slider-slide cards-slider__slide swiper-slide">
  <div class="cards-slider__slide_img">
    <img src="${data.img}" alt="Фото кладовки" width="${data.imgW}" height="${data.imgH}">
  </div>
  <div class="cards-slider__slide_content">
    <div class="cards-slider__slide_row">
      <h5 class="cards-slider__slide_title">${data.title}</h5>
      <svg class='icon icon-arrow-cos'>
        <use xlink:href='img/svg/sprite.svg#arrow-cos'></use>
      </svg>
    </div>
    <div class="cards-slider__slide_prices">
      <span class="cards-slider__slide_price price-count">${data.priceCount}</span>
      <strike class="cards-slider__slide_price-old price-old">${data.priceOld}</strike>
    </div>
    <a href="${data.href}" class="cards-slider__slide_button button ${isFos ? 'btn-open-modal-feedback-form' : ''}"><span>Забронировать</span></a>
  </div>
</div>`
}