import { Modal } from '../../../modules/myModal.js'
import { apiWithAuth } from '../../../settings/api.js'
import { outputInfo } from '../../../utils/outputinfo.js'
import { Loader } from '../../../modules/myLoader.js'

class OpenGates {
	constructor({ loader }) {
		this.modalConfirmOpenGates = new Modal('.modal-confirm-open-gates', {
			modalBtnClose: '.btn-modal-close',
		})

		this.loader = new Loader(
			this.modalConfirmOpenGates.modal.querySelector('.modal__body')
		)
		this.warehouse = null

		this.events()
	}

	events() {
		if (!this.modalConfirmOpenGates.modal) return
		this.modalConfirmOpenGates.modal.addEventListener('click', e => {
			if (e.target.closest('.btn-yes')) {
				this.openGates()
			}
		})
	}

	open(warehouse) {
		this.warehouse = warehouse
		this.modalConfirmOpenGates.modal.querySelector(
			'.modal-confirm-open-gates__content p'
		).innerHTML = `
    Вы уверены,<br>что хотите открыть ворота на складе <span style="font-weight: 600;white-space: nowrap;">${warehouse.warehouse_name}</span> ?`

		this.modalConfirmOpenGates.open()
	}

	async openGates() {
		try {
			this.loader.enable()
			const response = await apiWithAuth.get(
				`/_open_gates_?warehouse_id=${this.warehouse?.warehouse_id || 1}`
			)
			if (response.status !== 200) return
			outputInfo(response.data)
		} catch (error) {
			console.error(error)
		} finally {
			this.loader.disable()
			this.modalConfirmOpenGates.close()
		}
	}
}

export default OpenGates
