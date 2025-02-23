import { Modal } from '../../../modules/myModal.js'
import { apiWithAuth } from '../../../settings/api.js'
import { outputInfo } from '../../../utils/outputinfo.js'
import { Loader } from '../../../modules/myLoader.js'

class OpenDoor {
	constructor({ loader }) {
		this.modalConfirmOpenDoor = new Modal('.modal-confirm-open-door', {
			modalBtnClose: '.btn-modal-close',
		})

		this.loader = new Loader(
			this.modalConfirmOpenDoor.modal.querySelector('.modal__body')
		)
		this.warehouse = null

		this.events()
	}

	events() {
		if (!this.modalConfirmOpenDoor.modal) return
		this.modalConfirmOpenDoor.modal.addEventListener('click', e => {
			if (e.target.closest('.btn-yes')) {
				this.openDoor()
			}
		})
	}

	open(warehouse) {
		this.warehouse = warehouse
		this.modalConfirmOpenDoor.modal.querySelector(
			'.modal-confirm-open-door__content p'
		).innerHTML = `
    Вы уверены,<br>что хотите открыть дверь на складе <span style="font-weight: 600;white-space: nowrap;">${warehouse.warehouse_name}</span> ?`

		this.modalConfirmOpenDoor.open()
	}

	async openDoor() {
		try {
			this.loader.enable()
			const response = await apiWithAuth.get(
				`/_open_door_?warehouse_id=${this.warehouse.warehouse_id || 1}`
			)
			if (response.status !== 200) return
			outputInfo(response.data)
		} catch (error) {
			console.error(error)
		} finally {
			this.loader.disable()
			this.modalConfirmOpenDoor.close()
		}
	}
}

export default OpenDoor
