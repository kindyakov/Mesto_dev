import { Loader } from "../../../modules/myLoader.js"

import { getClientTotalData } from "../request.js"
import { rooms2Html } from "./html.js"

import OpenRoom from "./openRoom.js"
import OpenBarrier from "./openBarrier.js"
import OpenGates from "./openGates.js"
import OpenDoor from "./openDoor.js"

import { isOneRented } from "../utils/isAllRented.js"

class AccessStorage {
  constructor({ formNewAgreement }) {
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

    this.myData = null
    this.clientData = null
    this.formNewAgreement = formNewAgreement

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

  async render(accountTabs) {
    try {
      this.loader.enable()

      const data = await getClientTotalData()
      if (!data) return
      const { rooms, test_rooms } = data
      const accountStoreroomsRooms = document.querySelector('.account-storerooms-rooms')
      let isPaymentRoom = false

      accountStoreroomsRooms.classList.remove('_none')

      this.clientData = this.formNewAgreement.clientData = data
      this.storeroomsSliderWrapper.innerHTML = ''

      if (rooms.length) {
        // Если нет оплаченных ячеек с rented: 1 то скрытие вкладки "Выезды"
        if (!isOneRented(rooms)) {
          document.querySelector('[data-tabs-btn="account-tabs-5"]').classList.add('_none')
        }

        // Если ячейка оплачена с rented: 0.45 то скрываю все вкладки кроме "Мои данные"
        if (!this.clientData.client.user_type && isOneRented(rooms, 0.45)) {
          document.querySelector('[data-tabs-btn="account-tabs-0"]').classList.add('_none')
          document.querySelector('[data-tabs-btn="account-tabs-1"]').classList.add('_none')
          document.querySelector('[data-tabs-btn="account-tabs-2"]').classList.add('_none')
          document.querySelector('[data-tabs-btn="account-tabs-4"]').classList.add('_none')
          document.querySelector('[data-tabs-btn="account-tabs-5"]').classList.add('_none')
          this.myData.isRequiredPassportsData = true
          this.myData.clientData = data
          accountTabs.switchTabs(document.querySelector('.account-tabs-btn[data-tabs-btn="account-tabs-3"]'))
          return
        }
        // Если нет оплаченных ячеек и нет тестовых ячеек то скрытие  вкладки "Открытие" 
        else if (!isOneRented(rooms) && !isOneRented(test_rooms, 0.25)) {
          document.querySelector('[data-tabs-btn="account-tabs-0"]').classList.add('_none')
          accountTabs.switchTabs(document.querySelector('.account-tabs-btn[data-tabs-btn="account-tabs-1"]'))
          return
        }

        rooms.forEach(room => {
          // this.assetsStorageRooms.insertAdjacentHTML('beforeend', storageRoomHtml(room))
          this.storeroomsSliderWrapper.insertAdjacentHTML('beforeend', rooms2Html(room))

          if (room.rented === 0.45 && !isPaymentRoom) {
            isPaymentRoom = true

            accountTabs.tabsBtns.forEach(btn => {
              if (!btn.classList.contains('account-tabs-btn-my-data')) {
                btn.classList.add('_none')
              }
            })

            this.accountTabs.switchTabs(this.accountTabs.tabs.querySelector('.account-tabs-btn-my-data'))
          }
        });
      } else {
        accountStoreroomsRooms.classList.add('_none')
        document.querySelector('[data-tabs-btn="account-tabs-5"]').classList.add('_none')

        if (!test_rooms.length) {
          document.querySelector('[data-tabs-btn="account-tabs-0"]').classList.add('_none')
          accountTabs.switchTabs(document.querySelector('.account-tabs-btn[data-tabs-btn="account-tabs-1"]'))
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default AccessStorage