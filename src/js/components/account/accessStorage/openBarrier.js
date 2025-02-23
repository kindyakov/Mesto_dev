import { Modal } from '../../../modules/myModal.js'
import { apiWithAuth } from '../../../settings/api.js'
import { outputInfo } from '../../../utils/outputinfo.js'
import { Loader } from '../../../modules/myLoader.js'

class OpenBarrier {
	constructor() {
		this.modalConfirmOpenBarrier = new Modal('.modal-confirm-open-barrier', {
			modalBtnClose: '.btn-modal-close',
		})

		this.loader = new Loader(
			this.modalConfirmOpenBarrier.modal.querySelector('.modal__body')
		)

		this.warehouse = null
		this.events()
	}

	events() {
		if (!this.modalConfirmOpenBarrier.modal) return
		this.modalConfirmOpenBarrier.modal.addEventListener('click', e => {
			if (e.target.closest('.btn-yes')) {
				this.openBarrier()
			}
		})
	}

	open(warehouse) {
		this.warehouse = warehouse
		this.modalConfirmOpenBarrier.modal.querySelector(
			'.modal-confirm-open-barrier__content p'
		).innerHTML = `
    Вы уверены,<br>что хотите открыть шлагбаум на складе <span style="font-weight: 600;white-space: nowrap;">${warehouse.warehouse_name}</span> ?`

		this.modalConfirmOpenBarrier.open()
	}

	async openBarrier() {
		try {
			this.loader.enable()
			const response = await apiWithAuth.get(
				`/_open_barrier_?warehouse_id=${this.warehouse?.warehouse_id || 1}`
			)
			if (response.status !== 200) return
			outputInfo(response.data)
		} catch (error) {
			console.error(error)
		} finally {
			this.loader.disable()
			this.modalConfirmOpenBarrier.close()
		}
	}
}

export default OpenBarrier
