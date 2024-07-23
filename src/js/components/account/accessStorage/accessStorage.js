import { Loader } from "../../../modules/myLoader.js"

import { rooms2Html } from "./html.js"

import OpenRoom from "./openRoom.js"
import OpenBarrier from "./openBarrier.js"
import OpenGates from "./openGates.js"
import OpenDoor from "./openDoor.js"

class AccessStorage {
  constructor() {
    this.assetsStorage = document.querySelector('.account-assets-storage')
    if (!this.assetsStorage) return

    this.assetsStorageRooms = document.querySelector('.assets-storage__rooms')

    this.loader = new Loader(document.querySelector('.main'), {
      isHidden: false, customSelector: 'custom-loader', position: 'fixed', id: 'assets-storage-loader'
    })
    this.storeroomsSliderWrapper = document.querySelector('.account-storerooms-slider-wrapper')

    this.storeroomsSlider = new Swiper('.account-storerooms-slider', {
      spaceBetween: 10,
      observeSlideChildren: true,
      observer: true,
      breakpoints: {
        320: {
          slidesPerView: 1,
        },
        480: {
          slidesPerView: 1.5,
        },
        992: {
          slidesPerView: 2,
        },
        1200: {
          slidesPerView: 2.5,
        }
      },
      pagination: {
        el: '.account-storerooms-rooms__paging',
      },
      navigation: {
        nextEl: '.account-storerooms-rooms__slider-button.btn-next',
        prevEl: '.account-storerooms-rooms__slider-button.btn-prev',
      },
    });

    this.clientData = null

    this.openRoom = new OpenRoom({ loader: this.loader })
    this.openBarrier = new OpenBarrier({ loader: this.loader })
    this.openGates = new OpenGates({ loader: this.loader })
    this.openDoor = new OpenDoor({ loader: this.loader })

    this.events()
  }

  events() {
    this.assetsStorage.addEventListener('click', e => {
      if (e.target.closest('.btn-open-room')) {
        this.openRoom.open(this.clientData)
      }
      if (e.target.closest('.btn-open-barrier')) {
        this.openBarrier.modalConfirmOpenBarrier.open()
      }
      if (e.target.closest('.btn-open-gates')) {
        this.openGates.modalConfirmOpenGates.open()
      }
      if (e.target.closest('.btn-open-door')) {
        this.openDoor.modalConfirmOpenDoor.open()
      }
    })
  }

  render({ accountTabs, clientTotalData }) {
    if (!clientTotalData) return
    const { rooms } = clientTotalData

    this.clientData = clientTotalData
    this.storeroomsSliderWrapper.innerHTML = ''

    if (!rooms.length) return
    rooms.forEach(room => {
      // this.assetsStorageRooms.insertAdjacentHTML('beforeend', storageRoomHtml(room))
      this.storeroomsSliderWrapper.insertAdjacentHTML('beforeend', rooms2Html(room))
    });
  }
}

export default AccessStorage