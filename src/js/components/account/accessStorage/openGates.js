import { Modal } from '../../../modules/myModal.js'

class OpenGates {
	constructor({ loader }) {
		this.modalConfirmOpenGates = new Modal('.modal-confirm-open-gates', {
			modalBtnClose: '.btn-modal-close',
		})

		this.loader = loader
		this.warehouse = null
	}

	open(warehouse) {
		this.warehouse = warehouse
		this.modalConfirmOpenGates.modal.querySelector(
			'.modal-confirm-open-gates__content p'
		).innerHTML = `
    Вы уверены,<br>что хотите открыть ворота на складе <span style="font-weight: 600;white-space: nowrap;">${warehouse.warehouse_name}</span> ?`

		this.modalConfirmOpenGates.open()
	}
}

export default OpenGates
