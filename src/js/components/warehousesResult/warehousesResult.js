import { Accordion } from '../../modules/myAccordion.js'
import { warehousesResultAccordion } from './html.js';
import { modalFeedbackForm } from '../modals/modalFeedbackForm.js';
import { setMinMaxBlocks } from '../../utils/setMinMaxBlocks.js';

class WarehousesResult {
  constructor(wrapper, options) {
    let defaultOptions = {
      onlyWarehouse: false,
    }
    if (!wrapper) return console.error('Нет обертки', wrapper);
    this.options = Object.assign(defaultOptions, options)

    this.wrapper = wrapper
    this.warehousesResult = null
    this.accordion = null

    this.init()
  }

  init() {
    if (this.warehousesResult) this.warehousesResult.remove()
    this.wrapper.insertAdjacentHTML('beforeend', `<div class="warehouses-result"></div>`)
    this.warehousesResult = this.wrapper.querySelector('.warehouses-result')

    if (!this.options.onlyWarehouse) {
      this.accordion = new Accordion('.warehouses-result', { maxHeight: 218 })
    }
  }

  render(warehouse, rangeData) {
    const isAnim = this.warehousesResult.innerHTML.length ? true : false
    this.warehousesResult.innerHTML = ''

    if (!warehouse) return

    if (warehouse.show_popup) {
      const title = modalFeedbackForm.modal.querySelector('.h2')
      const subTitle = modalFeedbackForm.modal.querySelector('.questions__subtitle')
      title.textContent = rangeData.warehouse_id == 2 ? 'Скоро открытие' : 'Персональное предложение'
      subTitle.textContent = rangeData.warehouse_id == 2 ? 'Для бронирования кладовки оставьте заявку и мы с Вами свяжемся' : 'Оставьте заявку и мы свяжемся с Вами'

      modalFeedbackForm.open()
      return
    }

    if (warehouse.warehouses?.length) {
      warehouse.warehouses.forEach(_warehouse => {
        _warehouse.cnt_free = _warehouse.num_of_rooms
        this.warehousesResult.insertAdjacentHTML('beforeend', warehousesResultAccordion({ data: _warehouse, isRooms: false, rangeData }))
      });
    } else if (this.options.onlyWarehouse) {
      warehouse.forEach(_warehouse => {
        this.warehousesResult.insertAdjacentHTML('beforeend', warehousesResultAccordion({ data: _warehouse, isRooms: false, rangeData }))
      });
      setMinMaxBlocks('.warehouses-result__accordion_name-room', { breakpoints: [992] })
    } else {
      if (warehouse.rooms?.length) {
        this.warehousesResult.insertAdjacentHTML('beforeend', warehousesResultAccordion({ data: warehouse, rangeData }))
        setMinMaxBlocks('.warehouses-result__accordion_name-room', { breakpoints: [992] })
        setMinMaxBlocks('.warehouses-result__accordion_content-room .area', { breakpoints: [992] })
        setMinMaxBlocks('.warehouses-result__accordion_content-room .volume', { breakpoints: [992] })
        setMinMaxBlocks('.warehouses-result__accordion_content-room .dimensions', { breakpoints: [992] })
        setMinMaxBlocks('.warehouses-result__accordion_content-room .price', { breakpoints: [992] })
        this.accordion.init()
      } else {
        modalFeedbackForm.open()
      }
    }

    const heightWarehousesResult = this.warehousesResult.scrollHeight

    if (warehouse.rooms?.length || warehouse.warehouses?.length) {
      if (!isAnim) {
        this.warehousesResult
          .animate([
            { maxHeight: 0 },
            { maxHeight: heightWarehousesResult + 'px' },
          ], { duration: 300, easing: 'ease-in-out' })
          .addEventListener('finish', () => {
            this.warehousesResult.scrollIntoView({ behavior: "smooth", block: "center" })
            this.accordion?.open(this.warehousesResult.querySelector('._my-accordion'), this.warehousesResult.querySelector('._my-accordion-content'))
          })
      } else {
        this.warehousesResult.scrollIntoView({ behavior: "smooth", block: "center" })
        this.accordion?.open(this.warehousesResult.querySelector('._my-accordion'), this.warehousesResult.querySelector('._my-accordion-content'))
      }
    }
  }
}

export default WarehousesResult