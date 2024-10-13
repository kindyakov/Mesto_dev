// import { Loader } from "../../modules/myLoader.js"

class Room {
  constructor() {
    this.room = document.querySelector('.room')
    if (!this.room) return

    // this.loader = new Loader(document.querySelector('.main'), {
    //   isHidden: false, customSelector: 'custom-loader', position: 'fixed'
    // })

    this.slider = new Swiper('.slider-room', {
      slidesPerView: 1,
      observeSlideChildren: true,
      observer: true,
      navigation: {
        nextEl: '.room__slider-btn.btn-slider-next',
        prevEl: '.room__slider-btn.btn-slider-prev',
      },
    });
  }
}

export default Room