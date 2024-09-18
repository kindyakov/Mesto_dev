import { warehouseRoom } from "./html.js";
import { Range } from "./range.js";

import { Tabs } from "../../modules/myTabs.js";
import { Loader } from "../../modules/myLoader.js"

import api from "../../settings/api.js";

import { buildQueryParams } from "../../utils/buildQueryParams.js";
import { formattingPrice } from "../../utils/formattingPrice.js";
import { declOfNum } from "../../utils/declOfNum.js";
import { setMinMaxBlocks } from "../../utils/setMinMaxBlocks.js";
import { checkMobile } from "../../utils/checkMobile.js";

function addClassRented(rented) {
  if (rented === 0) {
    return 'free'
  } else {
    return 'disabled'
  }
}

class Warehouse {
  constructor() {
    this.warehouse = document.querySelector('.warehouse')
    if (!this.warehouse) return

    this.urlParams = new URLSearchParams(this.getSearchParams())

    // this.warehouseId = +this.urlParams.get('id')
    this.warehouseId = +this.warehouse.getAttribute('data-warehouse-id')

    this.depth = location.pathname.split('/').filter(el => el).length - 1
    this.pathPrefix = this.depth > 0 ? '../'.repeat(this.depth) : ''

    if (!this.warehouseId) return

    this.slider = this.initSlider();

    this.tabsScheme = new Tabs('tabs-warehouse', {
      btnSelector: '.tabs-btn-schemes',
      contentSelector: '.tabs-content-schemes',
    })

    this.range = new Range('.range-filter-warehouse', {
      selectorInput: '.input-filter-warehouse',
      warehouse_id: this.warehouseId
    })

    this.loader = new Loader(document.querySelector('.main'), {
      isHidden: false, customSelector: 'custom-loader', position: 'fixed'
    })

    this.schemeOne = this.warehouse.querySelector('.scheme-1')
    this.schemeTwo = this.warehouse.querySelector('.scheme-2')
    this.schemeActive = this.schemeOne

    this.contentRoomsWarehouse = this.warehouse.querySelector('.content-rooms-warehouse')
    this.infoResultWarehouse = this.warehouse.querySelector('.info-result-warehouse')
    this.linkResultWarehouse = this.warehouse.querySelector('.link-result-warehouse')
    this.buttonResultWarehouse = this.warehouse.querySelector('.button-result-warehouse')

    this.rooms = []
    this.resultRoomsData = { volume: 0, price_11m: 0, ids: [], count_rooms: 0, rooms: [] }

    this.pathContent = document.querySelector('.path-content')

    this.init()
  }

  getSearchParams() {
    let params = null

    if (location.href.includes('?')) {
      [params = null] = location.href.split('?')?.[1]?.split('#')
    }

    return params;
  }

  initSlider() {
    return new Swiper('.slider-warehouse', {
      slidesPerView: 1,
      observeSlideChildren: true,
      observer: true,
      loop: true,
      navigation: {
        nextEl: '.warehouse__slider-btn.btn-slider-next',
        prevEl: '.warehouse__slider-btn.btn-slider-prev',
      },
    });
  }

  init() {
    const volume_start = +this.urlParams.get('volume_start')
    const volume_end = +this.urlParams.get('volume_end')
    const price_start = +this.urlParams.get('price_start')
    const price_end = +this.urlParams.get('price_end')

    this.range.setSlider('volume', [volume_start, volume_end])
    this.range.setSlider('price', [price_start, price_end])

    this.range.updateInputValue('volume', [volume_start, volume_end])
    this.range.updateInputValue('price', [price_start, price_end])

    this.reqData = { ...this.range.rangeData, warehouse_id: this.warehouseId, floor: 1 }

    this.events()
    this.process()
  }

  events() {
    this.tabsScheme.options.onChange = (nexTabBtn, prevTabBtn, nextTabContent, prevTabContent) => {
      this.schemeActive = nextTabContent.classList.contains('content-schemes-one') ? this.schemeOne : this.schemeTwo;
      this.reqData.floor = this.schemeActive === this.schemeOne ? 1 : 2;

      this.process(buildQueryParams(this.reqData))
    }

    this.range.options.onChange = (rangeData) => {
      this.reqData = { ...  this.reqData, floor: this.reqData.floor, ...rangeData }
      this.process(buildQueryParams(this.reqData))
    }

    this.warehouse.addEventListener('click', e => {
      const isMobile = checkMobile()

      if (e.target.closest('.warehouse__svg-cell')) {
        e.preventDefault()
      }

      if (e.target.closest('.warehouse__svg-cell.free')) {
        e.preventDefault()
        this.rooms.length && this.handlerClickSvgCell(e, this.rooms)
      }

      if (e.target.closest('.link-result-warehouse') && !this.resultRoomsData.ids.length) {
        e.preventDefault()
      }

      if (e.target.closest('.warehouse__filter_tab')) {
        const tab = e.target.closest('.warehouse__filter_tab')
        const nameRange = tab.getAttribute('data-type-range')
        const values = tab.getAttribute('data-va')?.split(',')
        if (!nameRange || !values?.length) return

        this.range.setSlider(nameRange, values)
        this.range.updateInputValue(nameRange, values)

        if (this.range.rangeData.volume_end === 16) {
          this.range.rangeData.volume_end = 100
        }

        if (this.range.rangeData.price_end === this.range.rangeStartData.price_end) {
          this.range.rangeData.price_end = 100000
        }

        this.reqData = { ...this.reqData, floor: this.reqData.floor, ...this.range.rangeData }

        if (+values[0] == 10) {
          this.reqData.area_start = 10
          delete this.reqData['area_end']
        }
        this.process(buildQueryParams(this.reqData))
      }

      if (e.target.closest('.room-warehouse') && !e.target.closest('.warehouse__rooms_room-link')) {
        this.rooms.length && this.handlerClickSvgCell(e, this.rooms);
      }
    })
  }

  renderWarehouses(warehouses) {
    if (!warehouses.length || !this.warehouse || !this.warehouseId) return
    const [warehouseCurrent] = warehouses.filter(warehouse => +warehouse.warehouse_id === this.warehouseId)
    this.reqData.warehouse_id = warehouseCurrent.warehouse_id
  }

  renderScheme(filtered_rooms, rooms) {
    this.warehouse.querySelectorAll('.warehouse__svg-cell')?.forEach(cell => {
      cell.classList.remove('free', 'busy', 'disabled', '_selected', 'select-size')
    })

    filtered_rooms.length && filtered_rooms.forEach(room => {
      const cell = this.warehouse.querySelector(`.warehouse__svg-cell[data-cell-num="${room.room_name}"]`)
      if (!cell) return

      cell.setAttribute('data-rented', room.rented)
      cell.setAttribute('data-room-id', room.room_id)
      cell.classList.add('select-size')
    })

    rooms.length && rooms.forEach(room => {
      const cell = this.warehouse.querySelector(`.warehouse__svg-cell[data-cell-num="${room.room_name}"]`)
      if (!cell) return

      cell.setAttribute('data-rented', room.rented)
      cell.setAttribute('data-room-id', room.room_id)
      cell.classList.add(addClassRented(+room.rented))
    })
  }

  renderRooms(rooms) {
    if (!rooms.length && this.warehouseId !== 2) {
      this.contentRoomsWarehouse.innerHTML = `<div class="not-filtered-rooms"><span>Нет свободных ячеек по заданным параметрам</span></div>`
      return
    } else {
      rooms.forEach(room => {
        this.contentRoomsWarehouse.insertAdjacentHTML('beforeend', warehouseRoom(room))
      })
    }

    setMinMaxBlocks('.warehouse__rooms_room-num', { breakpointsNone: 576 })
    setMinMaxBlocks('.warehouse__rooms_room-area', { breakpoints: [1215, 576] })
    setMinMaxBlocks('.warehouse__rooms_room-block.dimensions', { breakpoints: [1215, 576] })
    setMinMaxBlocks('.warehouse__rooms_room-link', { breakpoints: [576, 370] })
  }

  async process(queryParams = buildQueryParams(this.reqData)) {
    try {
      this.loader.enable()
      const response = await api.get(`/_update_floor_for_client_${queryParams}`)
      if (response.status !== 200) return

      const { filtered_rooms, rooms } = response.data

      if (!rooms) return

      this.rooms = rooms
      this.renderScheme(filtered_rooms, rooms)
      this.renderRooms(filtered_rooms)

      this.resultRoomsData.rooms.length && this.resultRoomsData.rooms.forEach(room => {
        const cell = this.warehouse.querySelector(`.warehouse__svg-cell[data-room-id="${room.room_name}"]`)
        const roomWarehouse = this.warehouse.querySelector(`.room-warehouse[data-room-id="${room.room_name}"]`)

        cell && cell.classList.add('_selected')
        if (roomWarehouse) {
          roomWarehouse.remove()
          this.contentRoomsWarehouse.insertAdjacentHTML('afterbegin', warehouseRoom(room, true))
        }
      })
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }

  handlerClickSvgCell(e, rooms) {
    const element = e.target.closest('[data-room-id]')
    const roomId = +element.getAttribute('data-room-id')
    if (!roomId) return
    const cell = this.warehouse.querySelector(`.warehouse__svg-cell[data-room-id="${roomId}"]`)
    const roomWarehouse = this.warehouse.querySelector(`.room-warehouse[data-room-id="${roomId}"]`)
    const [currentRoom] = rooms.filter(room => +room.room_id === roomId)

    if (!currentRoom) {
      console.error('Ячейка не найдена');
      return
    }

    const isSelected = cell && cell.classList.contains('_selected');
    const volumeChange = isSelected ? -currentRoom.volume : currentRoom.volume;
    const priceChange = isSelected ? -currentRoom.price_11m : currentRoom.price_11m;

    cell?.classList.toggle('_selected', !isSelected);
    roomWarehouse?.classList.toggle('_selected', !isSelected);

    if (isSelected) {
      roomWarehouse?.classList.remove('_selected');
      this.resultRoomsData.ids = this.resultRoomsData.ids.filter(id => id !== currentRoom.room_id);
      this.resultRoomsData.rooms = this.resultRoomsData.rooms.filter(room => +room.room_id !== +currentRoom.room_id);
      this.resultRoomsData.count_rooms -= 1;
    } else {
      this.warehouse.querySelector('.not-filtered-rooms')?.remove();
      roomWarehouse?.remove();
      this.contentRoomsWarehouse.prepend(roomWarehouse);

      this.resultRoomsData.ids.push(currentRoom.room_id);
      this.resultRoomsData.rooms.push(currentRoom);
      this.resultRoomsData.count_rooms += 1;
    }

    this.resultRoomsData.volume = +(this.resultRoomsData.volume + volumeChange).toFixed(1);
    this.resultRoomsData.price_11m = +(this.resultRoomsData.price_11m + priceChange).toFixed(0);

    if (this.resultRoomsData.count_rooms == 1) {
      this.buttonResultWarehouse.setAttribute('data-room-id', this.resultRoomsData.ids[0])
      this.buttonResultWarehouse.classList.remove('_none')
    } else {
      this.buttonResultWarehouse.setAttribute('data-room-id', '')
      this.buttonResultWarehouse.classList.add('_none')
    }

    this.infoResultWarehouse.innerHTML = `<span>${this.resultRoomsData.volume} м<sup>3</sup></span><span>от ${formattingPrice(this.resultRoomsData.price_11m)}</span>`
    this.linkResultWarehouse.innerHTML = `<span>Арендовать ${this.resultRoomsData.count_rooms}
    ${declOfNum(this.resultRoomsData.count_rooms, ['кладовку', 'кладовки', 'кладовок'])}</span>`
    this.linkResultWarehouse.href = `${location.origin}/rent-room.html?ids=${encodeURIComponent(JSON.stringify(this.resultRoomsData.ids))}`
    // this.scrollToRoom(roomWarehouse)
    document.querySelector('.warehouse__rooms').scrollIntoView({ behavior: "smooth", block: "center" })
    setTimeout(() => {
      this.contentRoomsWarehouse.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }, 600)
  }

  scrollToRoom(room) {
    if (this.contentRoomsWarehouse.scrollHeight >= this.contentRoomsWarehouse.offsetHeight && room) {
      this.contentRoomsWarehouse.scrollTo({
        top: room.offsetTop - this.contentRoomsWarehouse.offsetTop,
        left: 0,
        behavior: 'smooth'
      })
    }
  }
}

export default Warehouse