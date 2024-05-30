import { Modal } from "../../../modules/myModal.js"
import { Loader } from "../../../modules/myLoader.js"
import api, { apiWithAuth } from "../../../settings/api.js"

import { warehouseModalHtml, roomModalHtml } from "./html.js"
import { outputInfo } from "../../../utils/outputinfo.js"

class OpenRoom {
  constructor({ loader }) {
    this.modalSelectWarehouse = new Modal('.modal-select-warehouse', {
      modalBtnClose: '.btn-modal-close'
    })
    this.modalSelectRoom = new Modal('.modal-select-room-access', {
      modalBtnClose: '.btn-modal-close'
    })
    this.modalConfirmOpenRoom = new Modal('.modal-confirm-open-room', {
      modalBtnClose: '.btn-modal-close'
    })

    this.loader = loader
    this.loaderModalWarehouse = new Loader(this.modalSelectWarehouse.modal.querySelector('.modal__body'))

    this.warehousesModal = this.modalSelectWarehouse.modal.querySelector('.modal-select-warehouse__wrapper')
    this.roomsModal = this.modalSelectRoom.modal.querySelector('.modal-select-room-access__rooms')

    this.warehouseIds = []
    this.warehouseId = null
    this.roomId = null
    this.clientData = null

    this.modalConfirmOpenRoom.modal.querySelector('.btn-yes').addEventListener('click', e => {
      this.roomId && this.sendRequest(this.roomId)
    })
  }

  open(data) {
    if (!Boolean(data)) return
    this.clientData = data
    this.warehouseIds = [...new Set([...data.rooms.map(room => room.warehouse_id),
    ...data.test_rooms.map(room => room.warehouse_id)
    ])]

    if (this.warehouseIds.length > 1) {
      this.renderWarehouses()
    } else {
      [this.warehouseId] = this.warehouseIds
      this.renderRooms(this.warehouseId)
    }

  }

  handlerClickToWarehouse() {
    const warehouses = this.modalSelectWarehouse.modal.querySelector('.modal-select-warehouse__warehouse')

    warehouses.length && warehouses.forEach(warehouse => {
      warehouse.addEventListener('click', () => {
        const warehouseId = warehouse.getAttribute('data-warehouse-id')
        if (!warehouseId) return
        this.warehouseId = +warehouseId
        this.renderRooms(+warehouseId)
      })
    })
  }

  handlerClickToRoomBtn() {
    const buttons = this.modalSelectRoom.modal.querySelectorAll('.btn-open-room-modal')

    buttons.length && buttons.forEach(button => {
      button.addEventListener('click', () => {
        const roomId = button.getAttribute('data-room-id')
        if (!roomId) return
        this.roomId = +roomId
        this.renderModalConfirm()
      })
    })
  }

  async renderWarehouses() {
    try {
      this.loaderModalWarehouse.enable()
      const response = await api.get('/_get_warehouses_info_')
      if (response.status !== 200) return
      const { warehouses } = response.data

      this.warehousesModal.innerHTML = ''
      warehouses.length && warehouses.forEach(warehouse => {
        this.warehousesModal.insertAdjacentHTML('beforeend', warehouseModalHtml(warehouse))
      });

      this.handlerClickToWarehouse()
      this.modalSelectWarehouse.open()
    } catch (error) {
      console.log(error)
    } finally {
      this.loaderModalWarehouse.disable()
    }
  }

  renderRooms(warehouseId) {
    if (!warehouseId) return
    const currentRoom = [...this.clientData.rooms, ...this.clientData.test_rooms].filter(room => +room.warehouse_id === +warehouseId)

    if (!currentRoom.length) return

    this.roomsModal.innerHTML = ''

    if (currentRoom.length > 1) {
      currentRoom.length && currentRoom.forEach(room => {
        this.roomsModal.insertAdjacentHTML('beforeend', roomModalHtml(room))
      })

      this.handlerClickToRoomBtn()
      this.modalSelectRoom.open()
    } else {
      this.roomId = currentRoom[0].room_id
      this.renderModalConfirm()
    }
  }

  renderModalConfirm() {
    this.modalConfirmOpenRoom.modal.querySelector('.modal-confirm-open-room__content p').innerHTML = `
    Вы уверены, что хотите открыть кладовку ${this.roomId} на складе ${this.warehouseId}?`

    this.modalConfirmOpenRoom.open()
  }

  async sendRequest(room_id) {
    try {
      this.loader.enable()
      const response = await apiWithAuth.post(`/unlock/${room_id}`)
      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default OpenRoom