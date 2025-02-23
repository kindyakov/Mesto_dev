import { Modal } from '../../../modules/myModal.js'
import { Loader } from '../../../modules/myLoader.js'
import { apiWithAuth } from '../../../settings/api.js'

import { roomModalHtml } from './html.js'
import { outputInfo } from '../../../utils/outputinfo.js'

class OpenRoom {
	constructor() {
		this.modalSelectRoom = new Modal('.modal-select-room-access', {
			modalBtnClose: '.btn-modal-close',
		})
		this.modalConfirmOpenRoom = new Modal('.modal-confirm-open-room', {
			modalBtnClose: '.btn-modal-close',
		})

		this.loader = new Loader(
			this.modalConfirmOpenRoom.modal.querySelector('.modal__body')
		)

		this.roomsModal = this.modalSelectRoom.modal.querySelector(
			'.modal-select-room-access__rooms'
		)

		this.warehouse = null
		this.rooms = []
		this.openRoom = null

		this.modalConfirmOpenRoom.modal
			.querySelector('.btn-yes')
			.addEventListener('click', e => {
				this.openRoom && this.sendRequest(this.openRoom.room_id)
			})
	}

	open(warehouse, { rooms = [], test_rooms = [] }) {
		if (!warehouse) return
		this.warehouse = warehouse
		this.rooms = [...rooms, ...test_rooms].filter(
			room => +room.warehouse_id === +warehouse.warehouse_id
		)

		if (!this.rooms.length) return

		if (this.rooms.length > 1) {
			this.roomsModal.innerHTML = this.rooms
				.map(room => roomModalHtml(room))
				.join('')

			this.handlerClickToRoomBtn()
			this.modalSelectRoom.open()
		} else {
			this.openRoom = this.rooms[0]
			this.renderModalConfirm()
		}
	}

	handlerClickToRoomBtn() {
		const buttons = this.modalSelectRoom.modal.querySelectorAll(
			'.btn-open-room-modal'
		)

		buttons.length &&
			buttons.forEach(button => {
				button.addEventListener('click', () => {
					const roomId = button.getAttribute('data-room-id')

					if (!roomId) return
					this.openRoom = this.rooms.find(room => +room.room_id === +roomId)

					this.renderModalConfirm()
				})
			})
	}

	renderModalConfirm() {
		this.modalConfirmOpenRoom.modal.querySelector(
			'.modal-confirm-open-room__content p'
		).innerHTML = `
    Вы уверены,<br>что хотите открыть 
		<span style="font-weight: 600;white-space: nowrap;">Кладовку ${this.openRoom.room_name}</span> на складе 
		<span style="font-weight: 600;white-space: nowrap;">${this.warehouse.warehouse_name}</span> ?`

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
			this.modalConfirmOpenRoom.close()
		}
	}
}

export default OpenRoom
