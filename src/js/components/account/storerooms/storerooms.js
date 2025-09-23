import tippy from 'tippy.js'

import { Loader } from '../../../modules/myLoader.js'
import { Accordion } from '../../../modules/myAccordion.js'
import { Tabs } from '../../../modules/myTabs.js'
import { Modal, ConfirmModal } from '../../../modules/myModal.js'

import { setMinMaxBlocks } from '../../../utils/setMinMaxBlocks.js'
import { formattingPrice } from '../../../utils/formattingPrice.js'
// import { buildQueryParams } from '../../../utils/buildQueryParams.js'
import { apiWithAuth } from '../../../settings/api.js'

import {
	agreementHtml,
	roomsHtml,
	roomHtml2,
	roomHtml3,
	roomModalHtml,
} from './html.js'
import { getAgreement, getRoomsWarehouse } from '../request.js'

// import RouteScheme from './routeScheme.js'
import { isOneRented } from '../utils/isAllRented.js'

import { replaceRoomForClient } from '../../../settings/request.js'
import { outputInfo } from '../../../utils/outputinfo.js'

function addClassRented(rented) {
	if (rented === 2) {
		return 'my'
	} else if (rented === 0) {
		return 'free'
	} else {
		return 'disabled'
	}
}

class Storerooms {
	constructor() {
		this.account = document.querySelector('.account')

		this.loader = new Loader(document.querySelector('.main'), {
			isHidden: false,
			customSelector: 'custom-loader',
			position: 'fixed',
			id: 'store-rooms-loader',
		})

		this.modalConfirmReplaceRoom = new Modal('.modal-confirm-replace-room', {
			modalBtnClose: '.btn-modal-close',
			// isClose: false
		})
		this.modalSelectRoom = new Modal('.modal-select-room', {
			modalBtnClose: '.btn-modal-close',
		})
		this.modalConfirmCancelAutopayments = new ConfirmModal(
			'.modal-confirm-cancel-autopayments',
			{
				modalBtnActive: '.btn-cancel-autopayments',
				modalBtnClose: '.btn-modal-close',
			}
		)
		this.accordionAgreement = new Accordion('.account-storerooms', {
			accordSelector: '.agreement-accordion',
			btnSelector: '.agreement-accordion-control',
			contentSelector: '.agreement-accordion-content',
		})
		this.accordionRoom = new Accordion('.account-storerooms', {
			accordSelector: '.room-accordion',
			btnSelector: '.room-accordion-control',
			contentSelector: '.room-accordion-content',
		})
		this.paymentTabs = new Tabs('account-tabs', {
			btnSelector: '.tabs-btn-payment',
			contentSelector: '.tabs-content-payment-cards',
			lotOfTabs: '.agreement-account-storerooms',
		})
		this.schemeTabs = new Tabs('account-schemes-tabs', {
			btnSelector: '.tabs-btn-schemes',
			contentSelector: '.tabs-content-schemes',
		})

		// this.routeScheme = new RouteScheme()

		this.agrId = null

		this.oldRoomId = null
		this.newRoomId = null

		this.clientData = null
		this.warehousesRooms = null

		this.isMonth = false
		this.isMobile = false
		this.isReplace = false

		this.storerooms = this.account.querySelector('.account-storerooms')
		this.agreements = this.account.querySelector(
			'.agreements-account-storerooms'
		)
		this.storeroomsSliderWrapper = this.account.querySelector(
			'.account-storerooms-slider-wrapper'
		)
		this.storeroomsSchemeRooms = this.account.querySelector(
			'.account-storerooms-scheme__rooms'
		)
		this.storeroomsTitleAgreement = this.account.querySelector(
			'.account-storerooms-title-agreement'
		)

		this.events()
	}

	events() {
		if (!this.storeroomsSliderWrapper) return
		this.account.addEventListener('click', e => {
			if (e.target.closest('.btn-download-agreement')) {
				const btn = e.target.closest('.btn-download-agreement')
				const roomId = btn.getAttribute('data-room-id')

				roomId && this.downloadAgr(roomId)
			}
		})

		window.addEventListener('resize', e => {
			if (window.innerWidth > 768) {
				this.isMobile = false
			} else {
				this.isMobile = true
			}
		})

		document.addEventListener('click', e => {
			if (e.target.closest('.warehouse__svg-cell')) {
				e.preventDefault()
				const cell = e.target.closest('.warehouse__svg-cell')
				const roomId = cell.getAttribute('data-room-id')

				if (cell.classList.contains('free')) {
					roomId && this.handlerClickToCellFree(roomId, cell)
				} else if (cell.classList.contains('my')) {
					roomId && this.handlerClickToCellMy(roomId, cell)
				}

				const schemeRooms = Array.from(
					this.storeroomsSchemeRooms.querySelectorAll('.scheme-room')
				)

				if (schemeRooms.length) {
					let maxHeight = 0
					if (this.isMobile) {
						maxHeight = schemeRooms.reduce(
							(accumulator, room) => accumulator + room.offsetHeight,
							10
						)
					} else {
						maxHeight = Math.max(...schemeRooms.map(room => room.offsetHeight))
					}
					const rect = this.storeroomsSchemeRooms.getBoundingClientRect()
					const topPos = rect.top + document.documentElement.scrollTop - 20

					window.scrollTo({
						top: topPos,
						left: 0,
						behavior: 'smooth',
					})
					this.storeroomsSchemeRooms.style.maxHeight = `${maxHeight}px`
				} else {
					if (this.isMobile) {
						this.storeroomsSchemeRooms.style.height = '325px'
					} else {
						this.storeroomsSchemeRooms.style.height = '106px'
					}
					this.storeroomsSchemeRooms.style.maxHeight = '0px'
					setTimeout(() => {
						this.storeroomsSchemeRooms.style.height = 'auto'
					}, 400)
				}
			}
			if (e.target.closest('.btn-replace-room')) {
				const btn = e.target.closest('.btn-replace-room')
				const roomId = btn.getAttribute('data-room-id')

				this.newRoomId = +roomId
				this.handlerClickToBtnReplaceRoom(roomId)
			}
			if (e.target.closest('.btn-modal-replace-room')) {
				const btn = e.target.closest('.btn-modal-replace-room')
				const agrId = btn.getAttribute('data-agreement-id')
				this.rentNewRoom({ agrId })
			}
			if (e.target.closest('.btn-replace-room-modal')) {
				const btn = e.target.closest('.btn-replace-room-modal')
				const roomId = btn.getAttribute('data-room-id')
				if (roomId) {
					this.oldRoomId = roomId
					this.handlerClickToBtnReplaceRoom(this.newRoomId)
				}
			}
		})

		this.accordionAgreement.options.onOpen = (
			accordionTarget,
			accordionContent
		) => {
			const agreementId = accordionTarget.getAttribute('data-agreement-id')
			agreementId && this.renderRooms(agreementId)
		}

		this.accordionAgreement.options.onClose = () => {
			this.storeroomsTitleAgreement.innerHTML = ''
			this.storeroomsSchemeRooms.style.maxHeight = '0px'
			setTimeout(() => {
				this.storeroomsSchemeRooms.innerHTML = ''
			}, 400)
			this.oldRoomId = null
			this.newRoomId = null
			this.agrId = null
			this.renderScheme([], this.clientData.rooms)
			// this.routeScheme.clear(this.schemeActive)
		}

		this.modalConfirmReplaceRoom.options.onClose = e => {
			if (!e.target.closest('.btn-modal-replace-room')) {
				this.oldRoomId = null
				this.newRoomId = null
			}
		}

		this.accordionRoom.options.onInit = () => {
			this.accordionRoom.accords.length &&
				this.accordionRoom.accords.forEach(accordionRoom => {
					const agreementAccordion = accordionRoom.closest(
						'.agreement-accordion'
					)

					if (!agreementAccordion) {
						accordionRoom.querySelector('.icon-arrow-left').remove()
						accordionRoom.querySelector(
							'.room-accordion-control'
						).style.cursor = 'auto'
						accordionRoom.classList.add('_not-close')
						this.accordionRoom.open(
							accordionRoom,
							accordionRoom.querySelector('.room-accordion-content')
						)
					}
				})
		}

		// Подтверждение отмены автоплатежа
		this.modalConfirmCancelAutopayments.buttonAction = isConfirmed => {
			if (isConfirmed) {
				const formData = new FormData()
				formData.append('agrid', this.agrId)
				this.cancelRecurrentPayments(formData)
			}
		}
	}

	// calcAdditionalPayment(newRoom, oldRoom) {
	//   return Math.round((+newRoom.price - +oldRoom.price) + (12 * +getMonthDiff(oldRoom.rentplanenddate, getCurrentDate())))
	// }

	renderScheme(rooms, roomsClient = []) {
		rooms.length &&
			rooms.forEach(room => {
				const cell = this.account.querySelector(
					`.warehouse__svg-cell[data-room-id="${room.room_id}"]`
				)

				if (cell) {
					cell.classList.remove('my', 'free', 'busy', 'disabled', '_selected')
					cell.setAttribute('data-rented', room.rented)

					if (room.rented === 0.25) {
						cell.classList.add('free')
						this.handlerClickToCellFree(room.room_id, cell)
					} else {
						cell.classList.add(addClassRented(+room.rented))
					}
				}
			})

		roomsClient.length &&
			roomsClient.forEach(room => {
				const cell = this.account.querySelector(
					`.warehouse__svg-cell[data-room-id="${room.room_id}"]`
				)
				if (cell) {
					cell.classList.remove('my', 'free', 'busy', 'disabled', '_selected')
					cell.classList.add(addClassRented(2))
				}
			})
	}

	renderRooms(agreementId) {
		const [currentAgreement] = this.clientData.agreements.filter(
			agreement => agreement.agrid === agreementId
		)
		const currentRoom = this.clientData.rooms.filter(
			room => room.agrid === agreementId
		)
		if (!this.warehousesRooms || !currentRoom.length) return
		const roomsFromSecondFloor = currentRoom.filter(room => room.floor === 1)
		const roomsFromFirstFloor = currentRoom.filter(room => room.floor === 2)

		this.storeroomsTitleAgreement.innerHTML = `Оферта ${currentAgreement.agrid}`
		this.agrId = currentAgreement.num_agrid

		if (roomsFromSecondFloor.length) {
			this.schemeTabs.switchTabs(
				document.querySelector(
					'.tabs-btn-schemes[data-tabs-btn="account-schemes-tabs-0"]'
				)
			)
		} else {
			this.schemeTabs.switchTabs(
				document.querySelector(
					'.tabs-btn-schemes[data-tabs-btn="account-schemes-tabs-1"]'
				)
			)
		}

		this.renderScheme(this.warehousesRooms, currentRoom)
	}

	handlerClickToCellFree(roomId, cell) {
		if (this.account.querySelector('.scheme-room-new')) {
			this.account.querySelector('.scheme-room-new').remove()
		}

		if (cell.classList.contains('_selected')) {
			cell.classList.remove('_selected')
			// this.routeScheme.deletePath(cell)
			this.newRoomId = null
		} else {
			const [currentRoom] = this.warehousesRooms.filter(
				room => +room.room_id === +roomId
			)
			const cellSelect = this.account.querySelector(
				'.warehouse__svg-cell.free._selected'
			)

			this.storeroomsSchemeRooms.insertAdjacentHTML(
				'beforeend',
				roomHtml3(currentRoom, this.isReplace)
			)

			const btnRentRoom = this.account.querySelector(
				'.scheme-room-new .btn-rent-room'
			)
			const btnReplaceRoom = this.account.querySelector(
				'.scheme-room-new .btn-replace-room'
			)
			const schemeRoomOld = this.account.querySelector('.scheme-room-old')

			if (schemeRoomOld && btnRentRoom && this.isReplace) {
				btnRentRoom.classList.add('_none')
			}

			if (cellSelect) {
				cellSelect.classList.remove('_selected')
				// this.routeScheme.deletePath(cellSelect)
			}

			if (!this.clientData.rooms.length) {
				btnReplaceRoom && btnReplaceRoom.classList.add('_none')
			}

			cell.classList.add('_selected')
			// this.routeScheme.drawing([cell])
		}
	}

	handlerClickToCellMy(roomId, cell) {
		if (this.account.querySelector('.scheme-room-old')) {
			this.account.querySelector('.scheme-room-old').remove()
		}
		const btnRentRoom = this.account.querySelector(
			'.scheme-room-new .btn-rent-room'
		)

		if (cell.classList.contains('_selected')) {
			btnRentRoom && btnRentRoom.classList.remove('_none')
			cell.classList.remove('_selected')
			this.oldRoomId = null
			// this.routeScheme.deletePath(cell)
		} else {
			const [currentRoom] = this.clientData.rooms.filter(
				room => +room.room_id === +roomId
			)
			const cellSelect = this.account.querySelector(
				'.warehouse__svg-cell.my._selected'
			)

			this.oldRoomId = +roomId

			this.storeroomsSchemeRooms.insertAdjacentHTML(
				'afterbegin',
				roomHtml2(currentRoom)
			)

			const schemeRoom = this.storeroomsSchemeRooms.querySelector(
				'.scheme-room.scheme-room-old'
			)
			const btnCompleteLease =
				schemeRoom?.querySelector('.btn-complete-lease') || null

			if (currentRoom !== 1 && btnCompleteLease) {
				btnCompleteLease.classList.add('_none')
			}

			if (btnRentRoom && this.isReplace) {
				btnRentRoom.classList.add('_none')
			}

			if (cellSelect) {
				cellSelect.classList.remove('_selected')
				// this.routeScheme.deletePath(cellSelect)
			}
			cell.classList.add('_selected')
			// this.routeScheme.drawing([cell])
		}
	}

	async handlerClickToBtnReplaceRoom(roomId) {
		try {
			if (!roomId) return
			const [currentNewRoom] = this.warehousesRooms.filter(
				room => +room.room_id === +roomId
			)

			if (this.oldRoomId) {
				this.loader.enable()

				const [currentOldRoom] = this.clientData.rooms.filter(
					room => +room.room_id === +this.oldRoomId
				)

				const response = await apiWithAuth.post(
					'/_get_room_prices_difference_',
					{
						agrid: currentOldRoom.agrid,
						old_room_id: this.oldRoomId,
						new_room_id: currentNewRoom.room_id,
					}
				)

				if (response.status !== 200) return
				const {
					difference,
					old_amount,
					old_deposit,
					new_amount,
					new_deposit,
				} = response.data

				const btnModalReplaceRoom = this.modalConfirmReplaceRoom.modal.querySelector(
					'.btn-replace-confirm'
				)

				this.modalConfirmReplaceRoom.modal.querySelector(
					'.modal-confirm-replace-room__text'
				).innerHTML = `
          <p>Вы уверены, что хотите заменить<br> Кладовка ${currentOldRoom.room_id
					} на Кладовка ${currentNewRoom.room_id}?</p>
          <p style="display: flex; align-items: center; gap: 6px;">
            <b>${difference < 0
						? `Экономия составит  ${formattingPrice(-1 * difference)}`
						: `Доплата составит ${formattingPrice(difference)}`
					} </b><svg class='icon icon-info  icon-info-tippy' style="width: 30px; height: 40px;">
            <use xlink:href='${window.app.directory
					}/assets/img/svg/sprite.svg#info'></use>
            </svg>
          </p>`

				tippy('.icon-info-tippy', {
					content: `<div style="display: grid; grid-template-columns: auto 1fr; gap: 6px; background-color: #fff; padding: 5px; border: 1px solid #004d56;
    box-shadow: 4px 4px 5px 0 rgba(0, 0, 0, 0.25); border-radius: 4px; font-size: 12px;">
          <b>${formattingPrice(
						+old_amount
					)}</b><span>Старый арендный платеж</span>
          <b>${formattingPrice(+old_deposit)}</b><span>Старый депозит</span>
          <hr style="width: 100%; height: 1px; background-color: #000; grid-column-start: span 2;">
          <b>${formattingPrice(
						+new_amount
					)}</b><span>Новый арендный платеж</span>
          <b>${formattingPrice(+new_deposit)}</b><span>Новый депозит</span>
          </div>`,
					allowHTML: true,
				})

				btnModalReplaceRoom.setAttribute(
					'data-agreement-id',
					currentOldRoom.agrid
				)
				btnModalReplaceRoom.setAttribute('data-room-id', roomId)
				btnModalReplaceRoom.setAttribute('data-old-room-id', this.oldRoomId)
				btnModalReplaceRoom.setAttribute('data-new-room-id', this.newRoomId)
				btnModalReplaceRoom.setAttribute('data-difference', difference)

				if (difference > 0) {
					btnModalReplaceRoom.classList.add('btn-modal-payments-room-open')
					btnModalReplaceRoom.classList.remove('btn-modal-replace-room')
				} else {
					btnModalReplaceRoom.classList.remove('btn-modal-payments-room-open')
					btnModalReplaceRoom.classList.add('btn-modal-replace-room')
				}

				this.modalConfirmReplaceRoom.open()
			} else {
				const contentRoomsModal = this.modalSelectRoom.modal.querySelector(
					'.content-rooms-modal'
				)
				let currentOldRoom = []
				contentRoomsModal.innerHTML = ''
				if (this.agrId) {
					currentOldRoom = this.clientData.rooms.filter(
						room => room.agrid == this.agrId && room.rented == 1
					)
				} else {
					currentOldRoom = this.clientData.rooms.filter(
						room => room.rented == 1
					)
				}

				currentOldRoom.length &&
					currentOldRoom.forEach(room => {
						contentRoomsModal.insertAdjacentHTML(
							'beforeend',
							roomModalHtml(room)
						)
					})

				this.modalSelectRoom.open()
			}
		} catch (error) {
			console.log(error)
		} finally {
			this.loader.disable()
		}
	}

	rentNewRoom({ agrId }) {
		const [currentNewRoom] = this.warehousesRooms.filter(
			room => +room.room_id === +this.newRoomId
		)
		if (!currentNewRoom) return

		let data = {
			user_type: this.clientData.client.user_type,
			agrid: agrId,
			old_room_id: this.oldRoomId,
			new_room_id: this.newRoomId,
		}

		if (this.clientData.client.user_type === 'f') {
			data.return_url = location.href
		}

		replaceRoomForClient(data, this.loader)
	}

	renderWarehouses(warehouses = []) {
		try {
			const warehousesSwitches = this.account.querySelector(
				'.warehouses-switches'
			)
			const titleScheme = this.account.querySelector('.warehouse__scheme_name')
			const tabsFloor = this.account.querySelector('.warehouse__schemes_tabs')
			const tabsContents = this.account.querySelector(
				'.warehouse__schemes_contents'
			)

			if (!warehouses.length) return

			if (warehousesSwitches) {
				warehousesSwitches.classList.add('_none')
				warehousesSwitches.innerHTML = ''
				if (warehouses.length > 1) {
					warehousesSwitches.classList.remove('_none')
					warehouses.forEach((warehouse, i) => {
						const button = document.createElement('button')
						button.className = i == 0 ? '_active' : ''
						button.textContent = warehouse.warehouse_name
						button.addEventListener('click', e => {
							if (!e.target.classList.contains('_active')) {
								alert('Надо сменить склад')
							}
						})
						warehousesSwitches.appendChild(button)
					})
				}
			}

			if (titleScheme) {
				titleScheme.textContent = `(${warehouses[0].warehouse_name})`
			}

			warehouses.forEach(warehouse => {
				if (tabsFloor) {
					tabsFloor.innerHTML = warehouse.schemes
						.map(
							(scheme, i) =>
								`<button class="warehouse__schemes_tab button tabs-btn-schemes ${i == 0 ? '_tab-btn-active' : ''
								}" data-tabs-btn="account-schemes-tabs-${i}">
							<span>${i + 1} ярус</span>
							</button>`
						)
						.join('')
					tabsFloor.classList.toggle(
						'_none',
						+warehouse.warehouse_num_of_floors == 1
					)
				}

				if (tabsContents) {
					tabsContents.innerHTML = ''
					warehouse.schemes.forEach((scheme, i) => {
						const content = document.createElement('div')
						content.className = `warehouse__schemes_content tabs-content-schemes ${i == 0 ? '_tab-content-active' : ''
							}`
						content.setAttribute(
							'data-tabs-content',
							`account-schemes-tabs-${i}`
						)
						content.innerHTML = `<div class="wrap-scheme">${scheme}</div>`
						const cells = content.querySelectorAll('.warehouse__svg-cell')

						cells.length &&
							cells.forEach(cell => {
								const cellNum = +cell.getAttribute('data-cell-num')
								const [room = null] = warehouse.rooms.filter(
									room => room.room_name == cellNum
								)
								if (room) {
									cell.setAttribute('data-room-id', room.room_id)
								}
							})
						tabsContents.append(content)
					})
				}
			})

			this.schemeTabs.init()
		} catch (error) {
			throw error
		}
	}

	async renderAgreement({ clientTotalData, formNewAgreement, warehouses }) {
		try {
			this.loader.enable()
			const roomsClient = [
				...clientTotalData.rooms,
				...clientTotalData.test_rooms,
			] // получаем все комнаты клиента

			let warehousesRentClient = [] // массив складов, где находятся комнаты клиента
			// если у клиента есть комнаты, то добавляем в массив warehousesRentClient все склады, где находятся эти комнаты
			if (roomsClient.length) {
				for (const room of roomsClient) {
					if (
						warehousesRentClient.find(
							warehouse => warehouse.warehouse_id == room.warehouse_id
						)
					) {
						continue
					}

					const warehouse = warehouses.find(
						warehouse => warehouse.warehouse_id == room.warehouse_id
					)
					if (warehouse) {
						warehouse.rooms_client = roomsClient
						warehousesRentClient.push(warehouse)
					}
				}
			} else {
				// если у клиента нет комнат, то добавляем в массив warehousesRentClient первый склад из массива warehouses
				warehousesRentClient.push(
					warehouses.find(warehouse => warehouse.warehouse_id == 1)
				) // это временное решение, пока не будет реализована логика выбора склада
			}

			for await (const warehouse of warehousesRentClient) {
				let { rooms } = await getRoomsWarehouse(warehouse.warehouse_id)
				rooms = rooms.filter(
					room => room.warehouse_id == warehouse.warehouse_id
				)
				warehouse.rooms = rooms
			}

			this.warehousesRooms = Array.from(
				...warehousesRentClient.map(warehouse => warehouse.rooms)
			)

			if (!clientTotalData) return
			this.agreements.innerHTML = ''
			this.storeroomsSliderWrapper.innerHTML = ''

			clientTotalData.agreements.length &&
				clientTotalData.agreements.forEach(agreement => {
					this.agreements.insertAdjacentHTML(
						'beforeend',
						agreementHtml(agreement, clientTotalData)
					)
				})

			clientTotalData.test_rooms.length &&
				clientTotalData.test_rooms.forEach(room => {
					this.agreements.insertAdjacentHTML(
						'beforeend',
						roomsHtml(room, 'not-close')
					)
				})

			if (clientTotalData.rooms.length) {
				if (isOneRented(clientTotalData.rooms, 1)) {
					this.isReplace = true
				}
			} else {
				document.querySelector('.account-storerooms-rooms').style.display =
					'none'
			}

			this.clientData = clientTotalData
			this.warehousesRentClient = warehousesRentClient
				? warehousesRentClient
				: null
			this.oldRoomId = null
			this.newRoomId = null
			this.agrId = null

			this.accordionRoom.init()
			this.accordionAgreement.init()
			this.paymentTabs.init()

			this.storeroomsTitleAgreement.innerHTML = ''
			this.storeroomsSchemeRooms.innerHTML = ''

			formNewAgreement.allRooms = this.warehousesRooms

			this.renderWarehouses(warehousesRentClient)
			this.renderScheme(this.warehousesRooms, roomsClient)

			setMinMaxBlocks('.room-accordion-control>p span', {
				breakpoints: [768],
			})
			setMinMaxBlocks('.room-accordion-control .title-product', {
				breakpoints: [768],
				breakpointsNone: 580,
			})
			setMinMaxBlocks(
				'.agreement-accordion-control .agreement2__row__right-col__title',
				{ breakpoints: [768], breakpointsNone: 480 }
			)
		} catch (error) {
			console.error(error)
		} finally {
			this.loader.disable()
		}
	}

	async cancelRecurrentPayments(formData) {
		try {
			this.loader.enable()
			const response = await apiWithAuth.post(
				'/_cancel_recurrent_payments_',
				formData
			)
			if (response.status !== 200) return
			outputInfo(response.data)
		} catch (error) {
			console.error(error)
		} finally {
			this.loader.disable()
		}
	}
}

export default Storerooms
