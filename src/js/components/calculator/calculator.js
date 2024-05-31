import { Tabs } from '../../modules/myTabs.js'
import { Select } from '../../modules/mySelect.js'
import { Loader } from '../../modules/myLoader.js'

import { Range } from './range.js'
import { thing } from './html.js'

import api from '../../settings/api.js'

import { buildQueryParams } from '../../utils/buildQueryParams.js'

import WarehousesResult from '../warehousesResult/warehousesResult.js'

import { formattingPrice } from "../../utils/formattingPrice.js"
import { executeOnceOnScroll } from '../../utils/executeOnceOnScroll.js'

class Calculator {
  constructor() {
    this.calculator = document.querySelector('#calculator')
    if (!this.calculator) return

    this.depth = location.pathname.split('/').filter(el => el).length - 1
    this.pathPrefix = this.depth > 0 ? '../'.repeat(this.depth) : ''

    this.calculatorBody = this.calculator.querySelector('.calculator__body')

    this.tabCalculator = new Tabs('calculator-tabs', {})
    this.selectCalculator = new Select('.select-calculator', {
      inputHtml: `<svg class='icon icon-arrow-left'><use xlink:href='${this.pathPrefix}img/svg/sprite.svg#arrow-left'></use></svg>`,
      selectCustom: 'select-custom-calculator',
    })
    this.selectAreaCalculator = new Select('.select-area-calculator', {
      inputHtml: `<svg class='icon icon-arrow-left'><use xlink:href='${this.pathPrefix}img/svg/sprite.svg#arrow-left'></use></svg>`,
      selectCustom: 'select-custom-area-calculator'
    })
    this.range = new Range('.range-calculator', { pathPrefix: this.pathPrefix })

    this.select = this.calculator.querySelector('.select-calculator[name="warehouse_id"]')

    this.category = 'living-room'
    this.totalArea = 0
    this.categoryData = {}
    this.itemSizes = this.calculator.querySelectorAll('.item-sizes')
    this.sizeResult = this.calculator.querySelector('.size-result')
    this.categoryCurrent = this.calculator.querySelector('.category-current')
    this.priceCalculator = this.calculator.querySelector('.price-calculator')
    this.things = this.calculator.querySelector('.calculator__things')
    this.imgPreviewRoom = this.calculator.querySelector('.img-preview-room')

    this.reqData = { ...this.range.rangeData, warehouse_id: this.select.value }
    this.loader = new Loader(this.calculator)

    this.prices = null
    this.storageItems = null

    this.warehousesResult = new WarehousesResult(this.calculatorBody)

    this.images = {
      volume: {
        '1': `${this.pathPrefix}img/rooms/1_kub.png`,
        '1.5': `${this.pathPrefix}img/rooms/1.5_kub.png`,
        '3': `${this.pathPrefix}img/rooms/1_kv_m.png`,
        '4': `${this.pathPrefix}img/rooms/2_kv_m.png`,
        '6': `${this.pathPrefix}img/rooms/3_kv_m.png`,
        '8': `${this.pathPrefix}img/rooms/4_kv_m.png`,
        '10': `${this.pathPrefix}img/rooms/5_kv_m.png`,
        '12': `${this.pathPrefix}img/rooms/6_kv_m.png`,
        '14': `${this.pathPrefix}img/rooms/7_kv_m.png`,
        '16': `${this.pathPrefix}img/rooms/8_kv_m.png`,
        '20': `${this.pathPrefix}img/rooms/9_kv_m.png`,
      }
    }

    this.itemSizes.length && this.itemSizes.forEach(item => {
      const span = item.querySelector('span');
      this.categoryData[item.dataset.category] = {
        value: 0,
        item: item,
        name: span.textContent,
        updateItemValue: () => {
          item.querySelector('.value').innerHTML = `${this.categoryData[item.dataset.category].value}м<sup>2</sup>`;
        }
      };
    });

    this.init()
  }

  events() {
    this.calculator.addEventListener('click', e => {
      if (e.target.closest('.btn-cost-calculator')) {
        this.reqData = { ...this.range.rangeData, warehouse_id: this.select.value }
        this.getCalculatorResult(buildQueryParams(this.reqData), this.range.rangeData)
      }

      if (e.target.closest('.btn-area-calculator')) {
        this.getCalculatorResult(buildQueryParams(this.reqData), this.range.rangeData)
      }

      if (e.target.closest('.item-category')) {
        const itemCurrent = e.target.closest('.item-category')
        const itemActive = this.calculator.querySelector('.item-category._active')
        if (itemCurrent == itemActive) return
        this.category = itemCurrent.dataset.category
        this.categoryCurrent.textContent = this.categoryData[this.category].name

        itemActive.classList.remove('_active')
        itemCurrent.classList.add('_active')

        this.renderItems(this.category)
      }

      if (e.target.closest('.counter-btn')) {
        const btn = e.target.closest('.counter-btn')
        const wrap = btn.parentElement
        const input = wrap.querySelector('input')

        const thingId = +wrap.closest('.thing-calculator').getAttribute('data-thing-id')
        const [currentThing] = this.storageItems[this.category].filter(item => +item.id === thingId)

        if (!currentThing) return

        const isPlus = btn.classList.contains('plus');
        const currentValue = +input.value;
        const currentValueArea = currentThing.area
        const changeValue = isPlus ? 1 : -1;
        const changeValueArea = isPlus ? currentValueArea : -currentValueArea;

        let timer

        if (!isPlus && currentValue <= 0 || !currentValueArea) return

        this.reqData.area = this.totalArea = +(this.totalArea + changeValueArea).toFixed(1)

        input.value = currentValue + changeValue;
        currentThing.count = +input.value

        this.categoryData[this.category].value = +(this.categoryData[this.category].value + changeValueArea).toFixed(1)
        // this.categoryData[this.category].item.classList.add('_focus')
        this.categoryData[this.category].updateItemValue()
        this.sizeResult.innerHTML = `${this.totalArea}м<sup>2</sup>`
      }
    })

    this.tabCalculator.options.onChange = (nexTabBtn, prevTabBtn, nextTabContent, prevTabContent) => {
      if (nextTabContent.classList.contains('cost-calculator')) {
        this.reqData = { ...this.range.rangeData, warehouse_id: this.select.value }
      } else if (nextTabContent.classList.contains('area-calculator')) {
        this.reqData = { area: this.totalArea, duration: 0, warehouse_id: this.select.value }
      }
    }

    this.selectAreaCalculator.options.onChange = (e, select, optionValue) => {
      this.category = optionValue
      this.categoryCurrent.textContent = this.categoryData[this.category].name
      this.renderItems(this.category)
    }

    this.range.options.onSlide = (rangeData, currentRange) => {
      const typeRange = currentRange.target.getAttribute('data-type-range')
      let prise = this.prices[rangeData.volume] ? this.prices[rangeData.volume] : 0

      this.priceCalculator.textContent = 'от ' + formattingPrice(this.calcDiscount(rangeData.duration, prise, rangeData.volume)) + "/мес";
    }

    this.range.options.onChange = (e, rangeData) => {
      if (rangeData.volume) {
        this.imgPreviewRoom.src = this.images.volume[rangeData.volume]
      }
    }
  }

  renderItems(category = 'living-room') {
    this.things.innerHTML = ''
    if (!this.storageItems[category] && !this.storageItems[category]?.length) return

    this.storageItems[category].forEach(item => {
      this.things.insertAdjacentHTML('beforeend', thing(item, this.pathPrefix))
    })
  }

  calcDiscount(month, dataPrice, volume) {
    if (!month || !dataPrice) return 0
    if (month >= 6 && month <= 10) {
      return dataPrice['6']
    } else if (month > 10) {
      return dataPrice['11']
    } else return dataPrice['1']
  }

  async init() {
    try {
      this.loader.enable()

      const [prices, items] = await Promise.all([this.getPrices(), this.getStorageItems()])

      this.prices = prices
      this.storageItems = items

      executeOnceOnScroll(() => {
        for (const type in this.images) {
          if (Object.hasOwnProperty.call(this.images, type)) {
            const imagesObj = this.images[type];

            for (const key in imagesObj) {
              if (Object.hasOwnProperty.call(imagesObj, key)) {
                const imagePath = imagesObj[key];
                const img = new Image();

                img.src = imagePath;
                // img.onload = function () { };
              }
            }
          }
        }

        this.renderItems()
      })

      this.imgPreviewRoom.src = this.images.volume['1']
      this.priceCalculator.textContent = 'от ' + formattingPrice(this.calcDiscount(1, this.prices['1'])) + "/мес";

      this.events()
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async getCalculatorResult(queryParams = '', rangeData) {
    try {
      this.loader.enable()

      const response = await api.get(`/_get_calculator_result_${queryParams}`)
      if (response.status !== 200) return

      ym(97074608, 'reachGoal', 'podobrat')
      this.warehousesResult.render(response.data, rangeData)
    } catch (error) {
      console.error(error.message)
      throw error;
    } finally {
      this.loader.disable()
    }
  }

  async process(warehouses) {
    try {
      if (!this.calculator) return
      this.select.innerHTML = ''

      warehouses.length && warehouses.forEach(warehouse => {
        this.select.insertAdjacentHTML('beforeend', `<option value="${warehouse.warehouse_id}">${warehouse.warehouse_address}</option>`)
      })
      this.selectCalculator.init()
    } catch (error) {
      console.error(error)
    }
  }

  async getPrices() {
    try {
      const response = await fetch('../assets/data/calculatorPrices.json')
      if (!response.ok) return null
      const data = await response.json()
      return data
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getStorageItems() {
    try {
      const response = await fetch('../assets/data/items.json')
      if (!response.ok) return null
      const data = await response.json()
      return data
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}

export default Calculator