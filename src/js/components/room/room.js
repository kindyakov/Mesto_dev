import { Loader } from "../../modules/myLoader.js"

import api from "../../settings/api.js";

import { buildQueryParams } from "../../utils/buildQueryParams.js";
import { formattingPrice } from "../../utils/formattingPrice.js";

class Room {
  constructor() {
    this.room = document.querySelector('.room')
    if (!this.room) return

    this.urlParams = new URLSearchParams(window.location.search);
    this.roomId = this.urlParams.get('id') ? +this.urlParams.get('id') : null
    this.titlePage = document.querySelector('title')

    this.loader = new Loader(document.querySelector('.main'), {
      isHidden: false, customSelector: 'custom-loader', position: 'fixed'
    })

    this.slider = new Swiper('.slider-room', {
      slidesPerView: 1,
      observeSlideChildren: true,
      observer: true,
      navigation: {
        nextEl: '.room__slider-btn.btn-slider-next',
        prevEl: '.room__slider-btn.btn-slider-prev',
      },
    });

    this.dataRoomElements = this.room.querySelectorAll('[data-room]')
    this.linkRoom = this.room.querySelector('.link-room')
    this.buttonRoom = this.room.querySelector('.button-room')

    this.cardsSliderWrapper = document.querySelector('.cards-slider__wrapper.swiper-wrapper')
    this.pathContent = document.querySelector('.path-content')
  }

  async getData(rout, queryParams = buildQueryParams({ room_id: this.roomId })) {
    try {
      const response = await api.get(`/${rout}${queryParams}`)
      if (response.status !== 200) return
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async renderRoom(warehouses) {
    if (!this.room) return
    try {
      this.loader.enable()
      const [{ room }, { rooms }] = await Promise.all([this.getData('_get_choosed_room_info_'), this.getData('_get_other_boxes_')])
      const [currentWarehouse] = warehouses.length ? warehouses.filter(warehouse => +warehouse.warehouse_id === +room.warehouse_id) : [null]

      if (room) {
        this.dataRoomElements.length && this.dataRoomElements.forEach(el => {
          const key = el.getAttribute('data-room')
          if (key == 'price') {
            el.textContent = formattingPrice(room.price_11m)
          } else {
            el.textContent = room[key]
          }

          this.linkRoom.href = `./rent-room.html?ids=${encodeURIComponent(JSON.stringify([room.room_id]))}`
          this.buttonRoom.setAttribute('data-room-id', room.room_id)
        })

        if (this.pathContent && currentWarehouse) {
          this.pathContent.innerHTML = `
            <a href="index.html" class="path__link hover-link">Главная</a>
            <span class="path__sep">/</span>
            <a href="calculator.html" class="path__link hover-link">Калькулятор</a>
            <span class="path__sep">/</span>
            <a href="./warehouse/1.html?id=${currentWarehouse.warehouse_id}" class="path__link hover-link">${currentWarehouse.warehouse_name}</a>
            <span class="path__sep">/</span>
            <span class="path__link">Кладовка ${room.room_id}</span>`
        }
      }

      if (rooms && rooms.length && this.cardsSliderWrapper) {
        // this.cardsSliderWrapper.innerHTML = ''

        // rooms.forEach(_room => {
        // this.cardsSliderWrapper.insertAdjacentHTML('beforeend', roomSlide(_room))
        // })
      }
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default Room