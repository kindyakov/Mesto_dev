import checkSupportWebP from "./utils/checkSupportWebP.js"

import { useDynamicAdapt } from "./utils/dynamicAdapt.js"
import { burger, updateLinks, scroll } from "./utils/header.js"
import { showPassword } from './utils/showPassword.js';
import { addBrowserSpecificClass } from './utils/detectBrowser.js';

import { Accordion } from "./modules/myAccordion.js"
import { Tabs } from "./modules/myTabs.js"

import { getWarehousesInfo } from "./settings/request.js"
import { checkAuth } from "./settings/api.js"

import mapInit from "./components/map/map.js"
import questions from "./components/questions/questions.js"
import rentOut from "./components/rentOut/rentOut.js"
import Calculator from "./components/calculator/calculator.js"

import SchemeMobile from './components/schemeMobile/schemeMobile.js';
import ModalQuiz from "./components/modals/modalQuiz/modalQuiz.js"

import { modals } from "./components/modals/modals.js"

import { plug } from './components/plug.js';

import { specialOffer } from "./components/specialOffer/specialOffer.js";
// import { isTimeInRange } from "./utils/isTimeInRange.js";

updateLinks('.link-update')
burger()
scroll('.link-scroll', { isHeader: false })
questions()
rentOut()
checkSupportWebP()
showPassword('.icon-eye')
specialOffer()


const calculator = new Calculator()
const schemeMobile = new SchemeMobile()
const isAuth = checkAuth()

let warehouse, room, account, rentRoom

getWarehousesInfo().then(({ warehouses }) => {
  if (window.location.pathname === '/' || window.location.pathname.includes('/index')) {
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
  } else if (window.location.pathname.includes('/rent-room')) {
    import(`./components/rentRoom/rentRoom.js`).then(({ default: RentRoom }) => {
      rentRoom = new RentRoom();
    });
  } else if (window.location.pathname.includes('/account')) {
    import(`./components/account/account.js`).then(({ default: Account }) => {
      account = new Account();
    });
  } else if (window.location.pathname.includes('/1')) {
    import(`./components/warehouse/warehouse.js`).then(({ default: Warehouse }) => {
      warehouse = new Warehouse();
      warehouse.renderWarehouses(warehouses)
    });
  } else if (window.location.pathname.includes('/room')) {
    import(`./components/room/room.js`).then(({ default: Room }) => {
      room = new Room();
      room.renderRoom(warehouses)
    });
  } else if (window.location.pathname.includes('/authorization')) {
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

useDynamicAdapt()
addBrowserSpecificClass(['.mySelect__list'])
plug() // ! Заглушка
// ======================================================

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
const intro = document.querySelector('.intro')
const header = document.querySelector('.header')
if (intro && header) {
  intro.style.paddingTop = header.clientHeight + 'px'

  window.addEventListener('resize', () => {
    intro.style.paddingTop = header.clientHeight + 'px'
  })
}
// ======================================================
const faq = document.querySelector('.faq')
if (faq) {
  const faqTabs = new Tabs('faq-tabs')
  const faqAccordion = new Accordion('.faq__body')
}
// ======================================================
const advantagesStorage = document.querySelector('.advantages-storage')
if (advantagesStorage) {
  const advantagesStorageTabs = new Tabs('advantages-storage-tabs')
}
// ======================================================

// ======================================================

// if (!isTimeInRange()) {
//   function preventDefaultClick(e) {
//     const btn = e.target.closest('.link-rent-storage-room')
//     const roomId = btn.closest('[data-room-id]')
//     const href = btn.getAttribute('href')

//     btn.classList.remove('btn-open-modal-feedback-form')

//     if (roomId) {
//       if (roomId.getAttribute('data-room-id') == 81) {
//         e.preventDefault();
//         btn.classList.add('btn-open-modal-feedback-form')
//       }
//     } else if (href) {
//       const arr = href.split('?')
//       if (!arr[1]) return
//       const urlParams = new URLSearchParams(arr[1])
//       const ids = urlParams.get('ids') ? JSON.parse(urlParams.get('ids')) : []
//       if (!ids.length) return
//       const isId = ids.filter(id => id == 81)
//       if (!isId.length) return
//       e.preventDefault();
//       btn.classList.add('btn-open-modal-feedback-form')
//     }
//   }

//   function recursiveFunction() {
//     const buttons = document.querySelectorAll('.link-rent-storage-room');

//     buttons.forEach(button => {
//       button.removeEventListener('click', preventDefaultClick);
//       button.addEventListener('click', preventDefaultClick);
//     });

//     setTimeout(recursiveFunction, 500);
//   }

//   recursiveFunction();
// }
