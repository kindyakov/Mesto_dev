import { cardHtml } from './html.js'

export function specialOffer() {
  const specialOffer = document.querySelector('.special-offer')
  if (!specialOffer) return
  const swiperWrapper = specialOffer.querySelector('.swiper-wrapper')
  swiperWrapper.innerHTML = ''

  getCard()

  async function getCard() {
    try {
      const response = await fetch('../assets/data/special-offer-slide.json')

      if (!response.ok) return
      const cardsData = await response.json()
      const isFos = window.location.pathname.includes('/for-your-business') ? true : false
      cardsData.length && cardsData.forEach(card => {
        swiperWrapper.insertAdjacentHTML('beforeend', cardHtml(card, isFos))
      })

      const swiper = new Swiper('.slider-cards', {
        spaceBetween: 10,
        observeSlideChildren: true,
        observer: true,
        loop: true,
        autoHeight: true,
        breakpoints: {
          320: {
            slidesPerView: 1.2,
          },
          480: {
            slidesPerView: 2,
          },
          640: {
            slidesPerView: 3,
          },
          1200: {
            slidesPerView: 4,
          }
        },
        pagination: {
          el: '.pagination-cards-slider',
        },
        navigation: {
          nextEl: '.btn-cards-slider-next',
          prevEl: '.btn-cards-slider-prev',
        },
      });

      const paginationItems = document.querySelectorAll('.pagination-cards-slider .swiper-pagination-bullet');

      paginationItems.length && paginationItems.forEach((item, index) => {
        item.addEventListener('click', () => {
          swiper.slideTo(index);
        });
      });
    } catch (error) {
      console.log(error)
    }
  }
}