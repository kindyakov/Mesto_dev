import CalculatorAreaSlider from '../noUiSliders/Calculator/CalculatorAreaSlider.js'
import CalculatorMonthSlider from '../noUiSliders/Calculator/CalculatorMonthSlider.js'

import { Tabs } from '../../modules/myTabs.js'
import { Select } from '../../modules/mySelect.js'
import { Loader } from '../../modules/myLoader.js'

import api from '../../settings/api.js'

import { buildQueryParams } from '../../utils/buildQueryParams.js'

import WarehousesResult from '../warehousesResult/warehousesResult.js'

import { formattingPrice } from '../../utils/formattingPrice.js'

class Calculator {
	constructor({ priceData }) {
		this.calculator = document.querySelector('#calculator')
		if (!this.calculator) return
		this.app = window.app
		this.calculatorBody = this.calculator.querySelector('.calculator__body')

		this.tabCalculator = new Tabs('calculator-tabs', {})
		this.selectCalculator = new Select('.select-calculator', {
			inputHtml: `<svg class='icon icon-arrow-left'><use xlink:href='${this.app.directory}/assets/img/svg/sprite.svg#arrow-left'></use></svg>`,
			selectCustom: 'select-custom-calculator',
		})
		this.selectAreaCalculator = new Select('.select-area-calculator', {
			inputHtml: `<svg class='icon icon-arrow-left'><use xlink:href='${this.app.directory}/assets/img/svg/sprite.svg#arrow-left'></use></svg>`,
			selectCustom: 'select-custom-area-calculator',
		})

		this.sliderArea = new CalculatorAreaSlider(
			this.calculator.querySelector('.range-calculator[data-type-range="area"]')
		)
		this.sliderMonth = new CalculatorMonthSlider(
			this.calculator.querySelector(
				'.range-calculator[data-type-range="duration"]'
			)
		)

		this.select = this.calculator.querySelector(
			'.select-calculator[name="warehouse_id"]'
		)

		this.prices = priceData

		this.category = null
		this.totalArea = 0
		this.categoryData = {}
		this.itemSizes = this.calculator.querySelectorAll('.item-sizes')
		this.sizeResult = this.calculator.querySelector('.size-result')
		this.things = this.calculator.querySelector('.calculator__things')
		this.priceCalculator = this.calculator.querySelector('.price-calculator')

		this.reqData = this.reqData = {
			volume: this.sliderArea.getValueVolume(),
			duration: this.sliderMonth.getValue(),
			warehouse_id: this.select.value,
		}
		this.loader = new Loader(this.calculator)

		this.storageItems = {}

		this.texts = this.calculator.querySelectorAll('.calculator__preview_text')

		this.warehousesResult = new WarehousesResult(this.calculatorBody)

		this.itemSizes.length &&
			this.itemSizes.forEach((item, i) => {
				const span = item.querySelector('span')
				this.categoryData[item.dataset.category] = {
					value: 0,
					item: item,
					name: span.textContent,
					updateItemValue: () => {
						item.querySelector('.value').innerHTML = `${this.categoryData[item.dataset.category].value
							}м<sup>2</sup>`
					},
				}

				if (i == 0) {
					this.category = item.dataset.category
				}
			})

		this.init()
	}

	events() {
		this.calculator.addEventListener('click', e => {
			if (e.target.closest('.btn-cost-calculator')) {
				this.reqData = {
					volume: this.sliderArea.getValueVolume(),
					duration: this.sliderMonth.getValue(),
					warehouse_id: this.select.value,
				}
				this.getCalculatorResult(this.reqData)
			}

			if (e.target.closest('.btn-area-calculator')) {
				this.reqData = {
					area: this.totalArea,
					warehouse_id: this.select.value,
				}
				this.getCalculatorResult(this.reqData)
			}

			if (e.target.closest('.item-category')) {
				const itemCurrent = e.target.closest('.item-category')
				const itemActive = this.calculator.querySelector(
					'.item-category._active'
				)
				if (itemCurrent == itemActive) return

				itemActive?.classList.remove('_active')
				itemCurrent?.classList.add('_active')

				this.renderItems(itemCurrent.dataset.category)
			}

			if (e.target.closest('.counter-btn')) {
				const btn = e.target.closest('.counter-btn')
				const wrap = btn.parentElement
				const input = wrap.querySelector('input')

				const thingId = +wrap
					.closest('.thing-calculator')
					.getAttribute('data-thing-id')
				const [currentThing] = this.storageItems[this.category].filter(
					item => +item.id === thingId
				)

				if (!currentThing) return

				const isPlus = btn.classList.contains('plus')
				const currentValue = +input.value
				const currentValueArea = currentThing.area
				const changeValue = isPlus ? 1 : -1
				const changeValueArea = isPlus ? currentValueArea : -currentValueArea

				if ((!isPlus && currentValue <= 0) || !currentValueArea) return

				this.reqData.area = this.totalArea = +(
					this.totalArea + changeValueArea
				).toFixed(1)

				input.value = currentValue + changeValue
				currentThing.count = +input.value

				this.categoryData[this.category].value = +(
					this.categoryData[this.category].value + changeValueArea
				).toFixed(1)
				// this.categoryData[this.category].item.classList.add('_focus')
				this.categoryData[this.category].updateItemValue()
				this.sizeResult.innerHTML = `${this.totalArea}м<sup>2</sup>`
			}
		})

		this.selectCalculator.options.onChange = (e, select, warehouse_id) => {
			this.updateRange(+warehouse_id)
		}

		this.selectAreaCalculator.options.onChange = (e, select, optionValue) => {
			this.renderItems(optionValue)
		}

		this.sliderArea.onSlide = params => this.onSlide(params)
		this.sliderMonth.onSlide = params => this.onSlide(params)
	}

	renderItems(category = this.category) {
		this.category = category
		const bodyThings = Array.from(
			this.calculator.querySelectorAll('.calculator__body-things')
		)
		if (!bodyThings.length) return
		const [activeBlock] = bodyThings.filter(el =>
			el.classList.contains('_active')
		)
		const [currentBlock] = bodyThings.filter(
			el => el.dataset.category == category
		)

		activeBlock?.classList.remove('_active')
		currentBlock?.classList.add('_active')
	}

	onSlide({ noUiSlider }) {
		if (noUiSlider.target.getAttribute('data-type-range') == 'area') {
			this.texts.length &&
				this.texts.forEach((el, i) => {
					if (this.sliderArea.getVolumeIndex() == i) {
						el.classList.remove('_none')
					} else {
						el.classList.add('_none')
					}
				})
		}

		this.updateRange()
	}

	updateRange(warehouse_id = +this.select.value) {
		const volumeIndex = this.sliderArea.getVolumeIndex()
		const month = this.sliderMonth.getValue()
		if (!this.prices.length) return // если нет цен
		const arrayCurrentprices = this.prices[warehouse_id] || []
		if (!arrayCurrentprices.length) return // если нет цен для выбранного склада
		const dataPrice = arrayCurrentprices[volumeIndex] || null
		if (!dataPrice) return // если нет цены для объема и месяца
		const price = this.sliderArea.calcDiscount(month, dataPrice)
		this.priceCalculator.textContent = formattingPrice(price) + '/мес'
	}

	init() {
		try {
			this.loader.enable()
			this.calculator
				.querySelectorAll('.item-category')?.[0]
				.classList.add('_active')

			const things = this.calculator.querySelectorAll('.thing-calculator')
			things.length &&
				things.forEach((thing, i) => {
					const category = thing.closest('[data-category]')?.dataset.category
					const input = thing.querySelector('input[data-value-area]')
					const area = +input.getAttribute('data-value-area')
					let data = { id: i, area, count: 0 }

					if (this.storageItems[category]) {
						this.storageItems[category].push(data)
					} else {
						this.storageItems[category] = [data]
					}

					thing.setAttribute('data-thing-id', i)
				})

			this.texts?.[0].classList.remove('_none')

			this.renderItems()
			this.events()
		} catch (error) {
			console.error(error)
		} finally {
			this.loader.disable()
		}
	}

	async getCalculatorResult(reqData) {
		try {
			this.loader.enable()

			const response = await api.get(
				`/_get_calculator_result_${buildQueryParams(reqData)}`
			)
			if (response.status !== 200) return

			if (ym) {
				ym(97074608, 'reachGoal', 'podobrat')
			}
			this.warehousesResult.render(response.data, reqData)
		} catch (error) {
			console.error(error.message)
			throw error
		} finally {
			this.loader.disable()
		}
	}

	async process(warehouses) {
		try {
			if (!this.calculator) return
			warehouses.length &&
				warehouses.forEach(warehouse => {
					this.select.insertAdjacentHTML(
						'beforeend',
						`<option value="${warehouse.warehouse_id}">${warehouse.warehouse_address}</option>`
					)
				})
			this.selectCalculator.init()
		} catch (error) {
			console.error(error)
		}
	}
}

export default Calculator
