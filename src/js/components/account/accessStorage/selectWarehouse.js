import { Modal } from '../../../modules/myModal.js'
import { warehouseModalHtml } from './html.js'

class SelectWarehouse {
	constructor({ loader }) {
		this.modalSelectWarehouse = new Modal('.modal-select-warehouse', {
			modalBtnClose: '.btn-modal-close',
		})

		this.warehousesModal = this.modalSelectWarehouse.modal.querySelector(
			'.modal-select-warehouse__wrapper'
		)

		this.nextModal = () => { }
	}

	handlerClickToWarehouse() {
		const warehouses = this.modalSelectWarehouse.modal.querySelectorAll(
			'.modal-select-warehouse__warehouse'
		)

		warehouses.length &&
			warehouses.forEach(warehouse => {
				warehouse.addEventListener('click', () => {
					const warehouseId = warehouse.getAttribute('data-warehouse-id')
					warehouseId && this.onSelectWarehouse(wpData.warehouses.find(warehouse => +warehouse.warehouse_id == +warehouseId))
				})
			})
	}

	open({ rooms = [], test_rooms = [] }) {
		this.warehouseIds = [
			...new Set([
				...rooms.map(room => room.warehouse_id),
				...test_rooms.map(room => room.warehouse_id),
			]),
		]

		const warehouse = wpData.warehouses.filter(
			warehouse => this.warehouseIds.includes(+warehouse.warehouse_id)
		)

		if (warehouse.length > 1) {
			this.warehousesModal.innerHTML = wpData.warehouses
				.map(warehouse => warehouseModalHtml(warehouse))
				.join('')

			this.handlerClickToWarehouse()
			this.modalSelectWarehouse.open()
		} else {
			this.onSelectWarehouse(warehouse[0])
		}
	}

	onSelectWarehouse(warehouse) {
		this.nextModal(warehouse)
		this.modalSelectWarehouse.close()
	}
}

export default SelectWarehouse
