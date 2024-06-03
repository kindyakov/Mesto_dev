import AirDatepicker from 'air-datepicker';

import { Loader } from "../../../modules/myLoader.js"
import { Tabs } from "../../../modules/myTabs.js"
import { Modal } from '../../../modules/myModal.js';

import { getClientTotalData } from "../request.js"
import { apiWithAuth } from "../../../settings/api.js"

import { departureTabsHtml, departuresRoomHtml } from "./html.js"
import { Watch } from './watch.js';

import { outputInfo } from "../../../utils/outputinfo.js"

const currentDate = new Date();

function addDaysToDate(date, days) {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
}

function formatAsYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function reverseDate(date) {
  if (!date) return;

  // Проверяем, в каком формате передана дата
  const isDashFormat = date.includes('-');

  if (isDashFormat) {
    // Если дата в формате YYYY-MM-DD, меняем порядок элементов
    const arr = date.split('-');
    return `${arr[2]}-${arr[1]}-${arr[0]}`;
  } else {
    // Если дата в формате DD-MM-YYYY, меняем порядок элементов
    const arr = date.split('-');
    return `${arr[2]}-${arr[1]}-${arr[0]}`;
  }
}

class Departure {
  constructor() {
    this.accountDepartures = document.querySelector('.account-departures')
    if (!this.accountDepartures) return

    this.loader = new Loader(document.querySelector('.main'), {
      isHidden: false, customSelector: 'custom-loader', position: 'fixed', id: 'departure-loader'
    })

    this.modalConfirmCheckOut = new Modal('.modal-confirm-check-out', {
      modalBtnClose: '.btn-modal-close'
    })

    this.departuresTabs = null

    this.accountDeparturesTabs = document.querySelector('.account-departures-tabs')
    this.accountDeparturesRooms = document.querySelector('.account-departures-rooms')
    this.accountDeparturesStepTwo = document.querySelector('.account-departures-step-2')
    this.accountDeparturesStepThree = document.querySelector('.account-departures-step-3')

    this.formMovingOutRoomPhoto = document.querySelector('.form-moving-out-room-photo')
    this.inputFile = this.accountDepartures.querySelector('.input-file')

    this.watchStepTwo = new Watch(this.accountDeparturesStepTwo)
    this.watchStepThree = new Watch(this.accountDeparturesStepThree)
    // this.flipDown = new FlipDown(0, 'timer-for-loading', {
    //   headings: ['дни', 'часы', 'минуты', 'секунды']
    // })

    this.roomId = null
    this.dataSend = {
      room_id: null,
      leave_date: null,
      leave_reason: "Больше нет потребности в услуге",
      comment: null
    }

    this.departuresTabs = new Tabs('account-tabs', {
      btnSelector: '.account-departures-tab',
      contentSelector: '.account-departures-room',
    })

    this.rooms = []
    this.isFile = false

    this.events()
  }

  events() {
    this.accountDepartures.addEventListener('click', (e) => {
      if (e.target.closest('.btn-to-leave')) {
        if (this.departuresTabs.tabsContentActive) {
          const currentInput = this.departuresTabs.tabsContentActive.querySelector('input[name="leave_date"]')

          if (currentInput.value !== '') {
            this.dataSend.room_id = this.departuresTabs.tabsContentActive.getAttribute('data-room-id')

            this.dataSend.leave_date = reverseDate(currentInput.value)
            currentInput.value = ''

            this.endRent(this.dataSend)
          } else {
            currentInput.classList.add('just-validate-error-field')
          }
        }
      }

      if (e.target.closest('.btn-cancel-check-out')) {
        const btn = e.target.closest('.btn-cancel-check-out')
        const roomId = btn.getAttribute('data-room-id')
        this.modalConfirmCheckOut.modal.querySelector('.button.btn-yes').setAttribute('data-room-id', roomId)
        this.modalConfirmCheckOut.open()
      }

      if (e.target.closest('.btn-complete-lease-departures')) {
        if (this.isFile) {
          const btn = e.target.closest('.btn-complete-lease-departures')
          const roomId = btn.getAttribute('data-room-id')
          const formData = new FormData(this.formMovingOutRoomPhoto)
          formData.set('room_id', roomId)
          this.provide_moving_out_room_photo_(formData, roomId)
        } else {
          this.formMovingOutRoomPhoto.classList.add('_err')
        }
      }
    })

    this.inputFile && this.inputFile.addEventListener('change', e => {
      if (this.inputFile.files.length) {
        const img = this.formMovingOutRoomPhoto.querySelector('img')
        const reader = new FileReader()
        let file = e.target.files[0]

        reader.onload = e => {
          img.src = e.target.result
          img.alt = 'Кладовка';
        }

        reader.readAsDataURL(file)

        this.isFile = true
        this.formMovingOutRoomPhoto.classList.remove('_err')
        this.formMovingOutRoomPhoto.classList.add('_success')
      } else {
        this.isFile = false
        this.formMovingOutRoomPhoto.classList.add('_err')
        this.formMovingOutRoomPhoto.classList.remove('_success')
      }
    })

    this.departuresTabs.options.onInit = (tabsBtnActive, tabsContentActive) => {
      const roomId = this.departuresTabs.tabsContentActive.getAttribute('data-room-id')
      if (roomId && this.rooms.length) {
        const [currentRoom] = this.rooms.filter(room => +room.room_id === +roomId)
        if (currentRoom?.rentenddate) {
          tabsContentActive.classList.remove('_tab-content-active')

          if (currentRoom?.room_photo_uploaded) {
            this.accountDeparturesStepThree.classList.remove('_none')
            this.watchStepThree.init(currentRoom.rentenddate)
          } else {
            // this.accountDeparturesStepTwo.classList.remove('_none')
            this.watchStepTwo.init(currentRoom.rentenddate)
          }

          this.setRoomId(roomId)
        }
      }
    }

    this.modalConfirmCheckOut.modal.querySelector('.button.btn-yes').addEventListener('click', (e) => {
      const roomId = e.target.getAttribute('data-room-id')
      roomId && this.cancelMovingOut(roomId)
    })
  }

  async renderDeparture(roomId = null) {
    try {
      this.loader.enable()
      const data = await getClientTotalData()
      if (!data) return
      const { rooms } = data
      if (!rooms || !rooms?.length) return
      this.rooms = rooms

      let activeIndexTab = 0

      this.accountDeparturesTabs.innerHTML = ''
      this.accountDeparturesRooms.innerHTML = ''

      if (rooms.length) {
        rooms.forEach((room, i) => {
          this.accountDeparturesTabs.insertAdjacentHTML('beforeend', departureTabsHtml(room, i))
          this.accountDeparturesRooms.insertAdjacentHTML('beforeend', departuresRoomHtml(room))

          if (roomId && room.room_id === +roomId) {
            activeIndexTab = i
          }
        })
      }

      this.departuresTabs.init()
      this.departuresTabs.options.onChange = this.onChangeTabs.bind(this)
      this.departuresTabs.switchTabs(this.accountDepartures.querySelector(`${this.departuresTabs.options.btnSelector}[data-tabs-btn="account-tabs-${activeIndexTab}"]`))

      this.accountDepartures.querySelectorAll('input[name="leave_date"]').forEach(input => {
        this.createAirDatepicker(input)
      })
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.disable()
    }
  }

  async endRent(data) {
    try {
      this.loader.enable()
      const response = await apiWithAuth.post('/_end_rent_by_client_', data)
      if (response.status !== 200) return
      outputInfo(response.data)
      if (response.data.msg_type === 'success') {
        const index = this.rooms.findIndex(room => +room.room_id === +data.room_id);
        this.rooms[index].rentenddate = data.leave_date

        this.departuresTabs.tabsContentActive.classList.remove('_tab-content-active')
        this.accountDeparturesStepTwo.classList.remove('_none')

        this.watchStepTwo.init(this.dataSend.leave_date)
        this.setRoomId(data.room_id)
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.disable()
    }
  }

  async provide_moving_out_room_photo_(formData, room_id) {
    try {
      this.loader.enable()
      const response = await apiWithAuth.post('/_provide_moving_out_room_photo_', formData)
      if (response.status !== 200) return
      outputInfo(response.data)
      if (response.data.msg_type === 'success') {
        const index = this.rooms.findIndex(room => +room.room_id === +room_id);
        this.rooms[index].room_photo_uploaded = 1

        this.accountDeparturesStepTwo.classList.add('_none')
        this.accountDeparturesStepThree.classList.remove('_none')
        this.watchStepThree.init(this.rooms[index].rentenddate)
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.disable()
    }
  }

  async cancelMovingOut(room_id) {
    try {
      this.loader.enable()
      const response = await apiWithAuth.post('/_cancel_moving_out_', { room_id })

      if (response.status !== 200) return
      outputInfo(response.data)

      if (response.data.msg_type === 'success') {
        const index = this.rooms.findIndex(room => +room.room_id === +room_id);
        this.rooms[index].rentenddate = null

        this.departuresTabs.tabsContentActive?.classList.add('_tab-content-active')
        this.accountDeparturesStepTwo.classList.add('_none')
        this.accountDeparturesStepThree.classList.add('_none')

        this.watchStepTwo.init(this.dataSend.leave_date)
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.disable()
    }
  }

  onChangeTabs(nexTabBtn, prevTabBtn, nextTabContent, prevTabContent) {
    const roomId = nexTabBtn.getAttribute('data-room-id')
    if (!roomId || !this.rooms.length) return
    const [currentRoom] = this.rooms.filter(room => +room.room_id === +roomId)
    this.accountDeparturesStepTwo.classList.add('_none')
    this.accountDeparturesStepThree.classList.add('_none')

    if (currentRoom?.rentenddate) {
      nextTabContent.classList.remove('_tab-content-active')

      if (currentRoom?.room_photo_uploaded) {
        this.accountDeparturesStepThree.classList.remove('_none')
        this.watchStepThree.init(currentRoom.rentenddate)
      } else {
        this.accountDeparturesStepTwo.classList.remove('_none')
        this.watchStepTwo.init(currentRoom.rentenddate)
        // this.flipDown.epoch = new Date(currentRoom.rentenddate).getTime() / 1000
        // this.flipDown.start()
      }

      this.setRoomId(roomId)
    }
  }

  setRoomId(roomId) {
    const btnCancelCheckOut = this.accountDepartures.querySelectorAll('.btn-cancel-check-out')
    const btnCompleteLeaseDepartures = this.accountDepartures.querySelectorAll('.btn-complete-lease-departures')
    const buttons = [...btnCancelCheckOut, ...btnCompleteLeaseDepartures]
    buttons.length && buttons.forEach(btn => {
      btn.setAttribute('data-room-id', roomId)
    })
  }

  createAirDatepicker(input) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return new AirDatepicker(input, {
      dateFormat: 'dd-MM-yyyy',
      position: 'bottom center',
      autoClose: true,
      minDate: formatAsYYYYMMDD(addDaysToDate(currentDate, 14)),
      // maxDate: formatAsYYYYMMDD(addDaysToDate(currentDate, 14)),
      isMobile: isMobile,
      onSelect: ({ date, formattedDate, datepicker }) => {
        datepicker.$el.classList.remove('just-validate-error-field')
      }
    });
  }
}

export default Departure