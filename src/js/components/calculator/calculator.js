import CalculatorAreaSlider from '../noUiSliders/Calculator/CalculatorAreaSlider.js'
import CalculatorMonthSlider from '../noUiSliders/Calculator/CalculatorMonthSlider.js'

import { Tabs } from '../../modules/myTabs.js'
import { Select } from '../../modules/mySelect.js'
import { Loader } from '../../modules/myLoader.js'

import { thing } from './html.js'

import api from '../../settings/api.js'

import { buildQueryParams } from '../../utils/buildQueryParams.js'

import WarehousesResult from '../warehousesResult/warehousesResult.js'

import { executeOnceOnScroll } from '../../utils/executeOnceOnScroll.js'
import { formattingPrice } from "../../utils/formattingPrice.js"

class Calculator {
  constructor() {
    this.calculator = document.querySelector('#calculator')
    if (!this.calculator) return
    this.app = window.app
    this.calculatorBody = this.calculator.querySelector('.calculator__body')

    this.tabCalculator = new Tabs('calculator-tabs', {})
    this.selectCalculator = new Select('.select-calculator', {
      inputHtml: `<svg class='icon icon-arrow-left'><use xlink:href='${this.app.pathPrefix}img/svg/sprite.svg#arrow-left'></use></svg>`,
      selectCustom: 'select-custom-calculator',
    })
    this.selectAreaCalculator = new Select('.select-area-calculator', {
      inputHtml: `<svg class='icon icon-arrow-left'><use xlink:href='${this.app.pathPrefix}img/svg/sprite.svg#arrow-left'></use></svg>`,
      selectCustom: 'select-custom-area-calculator'
    })

    this.sliderArea = new CalculatorAreaSlider(this.calculator.querySelector('.range-calculator[data-type-range="area"]'))
    this.sliderMonth = new CalculatorMonthSlider(this.calculator.querySelector('.range-calculator[data-type-range="duration"]'))

    this.select = this.calculator.querySelector('.select-calculator[name="warehouse_id"]')

    this.category = 'living-room'
    this.totalArea = 0
    this.categoryData = {}
    this.itemSizes = this.calculator.querySelectorAll('.item-sizes')
    this.sizeResult = this.calculator.querySelector('.size-result')
    this.categoryCurrent = this.calculator.querySelector('.category-current')
    this.things = this.calculator.querySelector('.calculator__things')
    this.priceCalculator = this.calculator.querySelector('.price-calculator')

    this.reqData = { warehouse_id: this.select.value } // ...this.range.rangeData,
    this.loader = new Loader(this.calculator)

    this.storageItems = null
    this.texts = null

    this.warehousesResult = new WarehousesResult(this.calculatorBody)

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
        this.reqData = {
          volume: this.sliderArea.getValueVolume(),
          duration: this.sliderMonth.getValue(),
          warehouse_id: this.select.value
        }
        this.getCalculatorResult(this.reqData)
      }

      if (e.target.closest('.btn-area-calculator')) {
        this.getCalculatorResult(this.reqData)
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

    this.sliderArea.onSlide = params => this.onSlide(params)
    this.sliderMonth.onSlide = params => this.onSlide(params)
  }

  renderItems(category = 'living-room') {
    this.things.innerHTML = ''
    if (!this.storageItems[category] && !this.storageItems[category]?.length) return

    this.storageItems[category].forEach(item => {
      const imgPathWebp = item.img.replace('.png', '.webp')
      const img = new Image()
      if (location.hostname !== "localhost") {
        img.src = imgPathWebp
        img.onload = () => item.img = imgPathWebp;
      }
      this.things.insertAdjacentHTML('beforeend', thing(item, this.app.pathPrefix))
    })
  }

  onSlide({ noUiSlider }) {
    if (noUiSlider.target.getAttribute('data-type-range') == 'area') {
      const textContent = this.calculator.querySelector('.calculator__preview_text')
      textContent.innerHTML = this.texts[this.sliderArea.getValue() - 1]
    }

    const volumeIndex = this.sliderArea.getVolumeIndex()
    const month = this.sliderMonth.getValue()
    const dataPrice = this.prices[volumeIndex]
    const price = this.sliderArea.calcDiscount(month, dataPrice)
    this.priceCalculator.textContent = formattingPrice(price) + '/мес'
  }

  async init() {
    try {
      this.loader.enable()

      const [prices, items, texts] = await Promise.all([this.getDataJson('calculatorPrices'), this.getDataJson('items'), this.getDataJson('calculatorTexts')])

      this.prices = prices
      this.storageItems = items
      this.texts = texts

      // Предзагрузка картинок 
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

      const response = await api.get(`/_get_calculator_result_${buildQueryParams(reqData)}`)
      if (response.status !== 200) return

      ym(97074608, 'reachGoal', 'podobrat')
      this.warehousesResult.render(response.data, reqData)
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

  async getDataJson(name) {
    try {
      const response = await fetch(`../assets/data/${name}.json`)
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