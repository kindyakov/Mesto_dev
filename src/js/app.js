import checkSupportWebP from "./utils/checkSupportWebP.js"

import { useDynamicAdapt } from "./utils/dynamicAdapt.js"
import { burger, updateLinks, scroll, dropdown } from "./utils/header.js"
import { showPassword } from './utils/showPassword.js';
import { addBrowserSpecificClass } from './utils/detectBrowser.js';

import { Accordion } from "./modules/myAccordion.js"
import { Tabs } from "./modules/myTabs.js"

import { getWarehousesInfo } from "./settings/request.js"
import api, { checkAuth } from "./settings/api.js"

import mapInit from "./components/map/map.js"
import questions from "./components/questions/questions.js"
import rentOut from "./components/rentOut/rentOut.js"
import Calculator from "./components/calculator/calculator.js"

import SchemeMobile from './components/schemeMobile/schemeMobile.js';
import ModalQuiz from "./components/modals/modalQuiz/modalQuiz.js"

import { modals } from "./components/modals/modals.js"

import { specialOffer } from "./components/specialOffer/specialOffer.js";

/**
 * Инициализирует обновление ссылок в шапке сайта.
 * @see {@link module:utils/header~updateLinks} 
*/
updateLinks('.link-update')
/** 
 * Инициализирует бургер-меню.
 * @see {@link module:utils/header~burger}
 */
burger()
/**
 * Инициализирует прокрутку по якорям.
 * @param {string} selector - Селектор для прокрутки.
 * @param {Object} options - Опции для прокрутки.
 * @see {@link module:utils/header~scroll}
 */
scroll('.link-scroll', { isHeader: false })
/**
 * Инициализирует выпадающее меню.
 * @param {Object} options - Опции для выпадающего меню.
 * @see {@link module:utils/header~dropdown}
 */
dropdown({})
// header
/**
 * Инициализирует часто задаваемые вопросы.
 * @see {@link module:components/questions~questions}
 */
questions()
/**
 * Инициализирует функцию сдачи в аренду.
 * @see {@link module:components/rentOut~rentOut}
 */
rentOut()
/**
 * Проверяет поддержку формата WebP в браузере.
 * @see {@link module:utils/checkSupportWebP~checkSupportWebP}
 */
checkSupportWebP()
/**
 * Показывает или скрывает пароль.
 * @param {string} selector - Селектор для иконки показа пароля.
 * @see {@link module:utils/showPassword~showPassword}
 */
showPassword('.icon-eye')
/**
 * Инициализирует специальное предложение.
 * @see {@link module:components/specialOffer~specialOffer}
 */
specialOffer()

const calculator = new Calculator()
const schemeMobile = new SchemeMobile()
const isAuth = checkAuth()

let warehouse, room, rentRoom, account
/**
 * Получает информацию о складах и инициализирует различные компоненты в зависимости от текущего пути.
 * @see {@link module:settings/request~getWarehousesInfo}
 */
getWarehousesInfo().then(async ({ warehouses }) => {
  const pathname = window.location.pathname

  if (pathname === '/' || pathname.includes('/index')) {
    const modalQuiz = new ModalQuiz({ warehouses })

    if (!isAuth) {
      const isFeedback = !!sessionStorage.getItem('isFeedback') || false

      if (!isFeedback) {
        setTimeout(() => {
          modalQuiz.modalQuiz.open()
          sessionStorage.setItem('isFeedback', true)
        }, 40000)
      }
    }
  } else if (pathname.includes('/rent-room')) {
    import(`./components/rentRoom/rentRoom.js`).then(({ default: RentRoom }) => {
      rentRoom = new RentRoom();
    });
  } else if (pathname.includes('/account')) {
    import(`./components/account/account.js`).then(({ default: Account }) => {
      account = new Account();
    });
  } else if (pathname.includes('/warehouse') || pathname.includes('/for-your-business')) {
    import(`./components/warehouse/warehouse.js`).then(({ default: Warehouse }) => {
      warehouse = new Warehouse();
      warehouse.renderWarehouses(warehouses)
    });
  } else if (pathname.includes('/room')) {
    import(`./components/room/room.js`).then(({ default: Room }) => {
      room = new Room();
      room.renderRoom(warehouses)
    });
  } else if (pathname.includes('/authorization')) {
    const authorizationImport = import(`./components/authorization/authorization.js`).then(({ default: Authorization }) => {
      const authorization = new Authorization({
        redirect: `account.html`
      })
    });

    const registrationImport = import(`./components/authorization/registration.js`).then(({ default: Registration }) => {
      const registration = new Registration({
        redirect: `warehouse/1.html`
      })
    });

    Promise.all([authorizationImport, registrationImport]).then(() => {
      const authorizationSection = document.querySelector('.authorization');
      if (authorizationSection) {
        const authorizationTabs = new Tabs('authorization-tabs');

        document.addEventListener('click', e => {
          if (e.target.closest('.tab-registration')) {
            e.preventDefault();
            authorizationTabs.switchTabs(authorizationTabs.tabs.querySelector('.btn-registration'));
          }

          if (e.target.closest('.tab-authorization')) {
            e.preventDefault();
            authorizationTabs.switchTabs(authorizationTabs.tabs.querySelector('.btn-authorization'));
          }
        });
      }
    });
  }

  calculator && calculator.process(warehouses)
  mapInit(warehouses)
})

modals()
/**
 * Инициализирует адаптацию динамического контента.
 * @see {@link module:utils/dynamicAdapt~useDynamicAdapt}
 */
useDynamicAdapt()
/**
 * Добавляет классы для специфических браузеров.
 * @param {Array<string>} selectors - Список селекторов для элементов.
 * @see {@link module:utils/detectBrowser~addBrowserSpecificClass}
 */
addBrowserSpecificClass(['.mySelect__list'])
// ======================================================
/**
 * Генерирует уникальные ID для всех checkbox и radio input и обновляет соответствующие label.
 */
const inputsCheckbox = document.querySelectorAll('input[type="checkbox"]')
const inputsRadio = document.querySelectorAll('input[type="radio"]')
const inputs = [...inputsCheckbox, ...inputsRadio]

inputs.length && inputs.forEach((input, i) => {
  const newId = new Date().getTime() + i
  const label = input.parentElement.querySelector(`label[for="${input.id}"]`)

  input.id = newId
  label && label.setAttribute('for', newId)
})
// ======================================================
/**
 * Обновляет padding-top у элемента .intro в зависимости от высоты шапки.
 */
const intro = document.querySelector('.intro')
const header = document.querySelector('.header')
if (intro && header) {
  intro.style.paddingTop = header.clientHeight + 'px'

  window.addEventListener('resize', () => {
    intro.style.paddingTop = header.clientHeight + 'px'
  })
}
// ======================================================
/**
 * Инициализирует вкладки и аккордеон для FAQ.
 * @see {@link module:modules/myTabs~Tabs}
 * @see {@link module:modules/myAccordion~Accordion}
 */
const faq = document.querySelector('.faq')
if (faq) {
  const faqTabs = new Tabs('faq-tabs')
  const faqAccordion = new Accordion('.faq__body')
}
// ======================================================
/**
 * Инициализирует вкладки для элемента .advantages-storage.
 * @see {@link module:modules/myTabs~Tabs}
 */
const advantagesStorage = document.querySelector('.advantages-storage')
if (advantagesStorage) {
  const advantagesStorageTabs = new Tabs('advantages-storage-tabs')
}
// ======================================================
/**
 * Инициализирует вкладки для бизнеса и аккордеон.
 * @see {@link module:modules/myTabs~Tabs}
 * @see {@link module:modules/myAccordion~Accordion}
 */
if (document.querySelector('[data-tabs-init="business-tabs"]')) {
  const businessTabs = new Tabs('business-tabs', {
    btnSelector: '._business-tabs-btn',
    contentSelector: '._business-tabs-content'
  })
}

if (document.querySelector('.business__accords')) {
  const businessAccord = new Accordion('.business__accords')
}
/**
 * Инициализирует слайдер для бизнес-предложений.
 * @see {@link https://swiperjs.com/}
 */
if (document.querySelector('.business__benefit_swiper ')) {
  new Swiper('.business__benefit_swiper ', {
    spaceBetween: 10,
    autoWidth: true,
    slidesPerView: 1,
    autoplay: {
      delay: 2000,
    },
  })
}
/**
 * Инициализирует слайдер для специальных предложений.
 * @see {@link https://swiperjs.com/}
 */
if (document.querySelector('.special-swiper-offer')) {
  new Swiper('.special-swiper-offer', {
    spaceBetween: 10,
    observeSlideChildren: true,
    observer: true,
    // loop: true,
    // autoHeight: true,
    breakpoints: {
      320: {
        slidesPerView: 1.2,
      },
      600: {
        slidesPerView: 2.2,
      },
      992: {
        slidesPerView: 3.2,
      },
      1200: {
        slidesPerView: 4,
      }
    },
    pagination: {
      el: '.pagination-cards-slider',
    },
    navigation: {
      nextEl: '.btn-cards-slider-next',
      prevEl: '.btn-cards-slider-prev',
    },
  });
}