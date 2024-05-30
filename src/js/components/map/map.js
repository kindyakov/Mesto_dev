import { Select } from "../../modules/mySelect.js"
import { Tabs } from "../../modules/myTabs.js"
import { fullScreen } from "./fullScreen.js"
import { Modal } from "../../modules/myModal.js"


import { markerContent, modalWarehouse, modalWarehouseCurrent, warehouseList } from "./html.js"
async function getStyleMap() {
  try {
    const response = await fetch('../assets/customization.json')
    if (!response.ok) return false
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
  }
}

const mapInit = async (warehouses) => {
  const yandexMap = document.querySelector('#yandex-map');
  if (!yandexMap) return;

  if (!window.ymaps3) {
    setTimeout(() => {
      mapInit(warehouses)
    }, 2000)
    return
  }

  const depth = location.pathname.split('/').filter(el => el).length - 1
  const pathPrefix = depth > 0 ? '../'.repeat(depth) : ''

  const modalInformationWarehouse = new Modal('.modal-information-warehouse')

  const selectMap = new Select('.select-map', {
    inputHtml: `<svg class='icon icon-arrow-left'><use xlink:href='${pathPrefix}img/svg/sprite.svg#arrow-left'></use></svg>`,
    selectCustom: 'select-custom-map',
    placeholder: 'Выберите ближайшую кладовку'
  })

  const tabsMap = new Tabs('map-tabs', {})
  const mediaQueryList = window.matchMedia(`(max-width: 768px)`);

  const warehousesListMap = document.querySelector('.warehouses-list-map')
  const modalInfoAllWarehouses = yandexMap.querySelector('.modal-info-all-warehouses')
  const modalInfoWarehouse = yandexMap.querySelector('.modal-info-warehouse')

  const warehousesModal = yandexMap.querySelector('.warehouses-modal-map')

  warehousesListMap.innerHTML = ''
  warehousesModal.innerHTML = ''

  await ymaps3.ready

  const [
    customization,
    { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapControls, YMapControlButton, YMapScaleControl }
  ] = await Promise.all([getStyleMap(), ymaps3]);

  const { YMapZoomControl, YMapGeolocationControl } = await ymaps3.import('@yandex/ymaps3-controls@0.0.1')

  const behaviors = ['drag', 'pinchZoom', 'dblClick', 'mouseTilt', 'mouseRotate', 'multiTouch']

  const map = new YMap(document.getElementById('yandex-map'),
    {
      location: {
        center: [warehouses[0].y, warehouses[0].x],
        zoom: 15
      },
      showScaleInCopyrights: true,
      behaviors
    },
    [
      new YMapDefaultSchemeLayer({ customization: customization }),
      new YMapDefaultFeaturesLayer({})
    ],
  );

  const controls = new YMapControls({ position: 'left', orientation: 'vertical' }); // [new YMapScaleControl({})]
  controls.addChild(new YMapGeolocationControl({}));
  controls.addChild(new YMapZoomControl({ easing: 'linear' }));
  map.addChild(controls);

  fullScreen({ map, controls, YMapControlButton, behaviors }) // полноэкранный режим

  const controlsVertical = yandexMap.querySelector('.ymaps3x0--controls_vertical')

  controlsVertical.insertAdjacentHTML('beforeend', `<ymaps class="ymaps3x0--control ymaps3x0--control__background wp-link-to-yandex-map"><a href="https://yandex.ru/maps/213/moscow/?indoorLevel=1&ll=37.754999%2C55.637688&mode=poi&poi%5Bpoint%5D=37.753613%2C55.637967&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D6170510449&pt=37.753613%2C55.637967&z=17.6" target="_blank" class="link-to-yandex-map"><svg class='icon icon-yandex-marker'>
	<use xlink:href='${location.origin}/img/svg/sprite.svg#yandex-marker'></use>
</svg><span>Открыть в Яндекс.Картах</span></a></ymaps>`)

  function handlerClickMarker(markerElement, warehouse) {
    if (markerElement.classList.contains('_selected')) {
      markerElement.classList.remove('_selected')

      modalInfoAllWarehouses.classList.add('_active')
      modalInfoWarehouse.classList.remove('_active')
    } else {
      const markerElementSelected = yandexMap.querySelector('.marker._selected')
      markerElementSelected && markerElementSelected.classList.remove('_selected')
      markerElement.classList.add('_selected')

      modalInfoAllWarehouses.classList.remove('_active')

      openModalWarehouse(warehouse)
    }
  }

  function openModalWarehouse(warehouse) {
    // modalInfoWarehouse.innerHTML = modalWarehouseCurrent(warehouse)
    if (mediaQueryList.matches) {
      modalInformationWarehouse.modal.querySelector('.modal__body').innerHTML = modalWarehouseCurrent(warehouse)
      modalInformationWarehouse.open()
    } else {
      modalInfoWarehouse.innerHTML = modalWarehouseCurrent(warehouse)
      modalInfoWarehouse.classList.add('_active')
    }
  }

  function closeModalWarehouse(e) {
    const modal = e.target.closest('.map__modal')
    const markerElementSelected = yandexMap.querySelector('.marker._selected')

    markerElementSelected && markerElementSelected.classList.remove('_selected')
    modal.classList.remove('_active')

    if (mediaQueryList.matches) {
      yandexMap.classList.remove('_modal-active')
    }
  }

  function handleMediaChange() {
    if (mediaQueryList.matches) {
    } else {
      modalInfoAllWarehouses.classList.add('_active')
      modalInfoWarehouse.classList.remove('_active')
    }
  }

  warehouses.length && warehouses.forEach((warehouse) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'marker';
    markerElement.setAttribute('data-warehouse-id', warehouse.warehouse_id)
    markerElement.innerHTML = markerContent(warehouse, pathPrefix)

    const marker = new YMapMarker(
      { coordinates: [warehouse.y, warehouse.x] },
      markerElement
    );
    // Добавляем маркер на карту
    map.addChild(marker);

    warehousesListMap.insertAdjacentHTML('beforeend', warehouseList(warehouse, pathPrefix))

    warehousesModal.insertAdjacentHTML('beforeend', modalWarehouse(warehouse, pathPrefix))

    markerElement.addEventListener('click', () => handlerClickMarker(markerElement, warehouse))
  });

  mediaQueryList.addEventListener('change', handleMediaChange);

  yandexMap.addEventListener('click', e => {
    if (e.target.closest('.map__modal_close')) {
      closeModalWarehouse(e)
    }

    if (e.target.closest('.marker__img')) {
      const marker = e.currentTarget
    }
  })

  modalInformationWarehouse.options.onClose = () => {
    const markerElementSelected = yandexMap.querySelector('.marker._selected')
    markerElementSelected && markerElementSelected.classList.remove('_selected')
  }
};

export default mapInit