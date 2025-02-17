import checkSupportWebP from './utils/checkSupportWebP.js'
import { useDynamicAdapt } from './utils/dynamicAdapt.js'
import { burger, scroll, dropdown } from './utils/header.js'
import { showPassword } from './utils/showPassword.js'
import { addBrowserSpecificClass } from './utils/detectBrowser.js'
import { Accordion } from './modules/myAccordion.js'
import { Tabs } from './modules/myTabs.js'
// import { getWarehousesInfo } from "./settings/request.js";
import { checkAuth } from './settings/api.js'
import mapInit from './components/map/map.js'
import questions from './components/questions/questions.js'
import rentOut from './components/rentOut/rentOut.js'
import Calculator from './components/calculator/calculator.js'
// import SchemeMobile from './components/schemeMobile/schemeMobile.js';
import ModalQuiz from './components/modals/modalQuiz/modalQuiz.js'
import { modals } from './components/modals/modals.js'
import { specialOffer } from './components/specialOffer/specialOffer.js'

window.app = {
	...wpData,
}

burger()
scroll('.link-scroll', { isHeader: false })
dropdown({})
questions()
rentOut()
checkSupportWebP()
showPassword('.icon-eye')
specialOffer()
const calculator = new Calculator({ priceData: wpData.prices_data })
// const schemeMobile = new SchemeMobile();
const isAuth = checkAuth()

let warehouse, room, rentRoom, account

// getWarehousesInfo().then(({ warehouses }) => {
const pathname = window.location.pathname

if (pathname === '/' || pathname.includes('/index')) {
	const modalQuiz = new ModalQuiz({ warehouses: window.app.warehouses })

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
		rentRoom = new RentRoom()
	})
} else if (pathname.includes('/account')) {
	import(`./components/account/account.js`).then(({ default: Account }) => {
		account = new Account()
	})
} else if (
	pathname.includes('/warehouse') ||
	pathname.includes('/for-your-business')
) {
	import(`./components/warehouse/warehouse.js`).then(
		({ default: Warehouse }) => {
			warehouse = new Warehouse()
			warehouse.renderWarehouses(window.app.warehouses)
		}
	)
} else if (pathname.includes('/room')) {
	import(`./components/room/room.js`).then(({ default: Room }) => {
		room = new Room()
	})
} else if (pathname.includes('/authorization')) {
	const authorizationImport = import(
		`./components/authorization/authorization.js`
	).then(({ default: Authorization }) => {
		const authorization = new Authorization({
			redirect: `account`,
		})
	})

	const registrationImport = import(
		`./components/authorization/registration.js`
	).then(({ default: Registration }) => {
		const registration = new Registration({
			redirect: `warehouse/${wpData.warehouses[0]?.warehouse_id || 1}/`,
		})
	})

	Promise.all([authorizationImport, registrationImport]).then(() => {
		const authorizationSection = document.querySelector('.authorization')
		if (authorizationSection) {
			const authorizationTabs = new Tabs('authorization-tabs')

			document.addEventListener('click', e => {
				if (e.target.closest('.tab-registration')) {
					e.preventDefault()
					authorizationTabs.switchTabs(
						authorizationTabs.tabs.querySelector('.btn-registration')
					)
				}

				if (e.target.closest('.tab-authorization')) {
					e.preventDefault()
					authorizationTabs.switchTabs(
						authorizationTabs.tabs.querySelector('.btn-authorization')
					)
				}
			})
		}
	})
}

calculator && calculator.process(window.app.warehouses)
mapInit(window.app.warehouses) // Инициализация карты

modals()
useDynamicAdapt()
addBrowserSpecificClass(['.mySelect__list'])

const inputsCheckbox = document.querySelectorAll('input[type="checkbox"]')
const inputsRadio = document.querySelectorAll('input[type="radio"]')
const inputs = [...inputsCheckbox, ...inputsRadio]

inputs.length &&
	inputs.forEach((input, i) => {
		const newId = new Date().getTime() + i
		const label = input.parentElement.querySelector(`label[for="${input.id}"]`)

		input.id = newId
		label && label.setAttribute('for', newId)
	})

const intro = document.querySelector('.intro')
const header = document.querySelector('.header')
if (intro && header) {
	intro.style.paddingTop = header.clientHeight + 'px'

	window.addEventListener('resize', () => {
		intro.style.paddingTop = header.clientHeight + 'px'
	})
}

const faq = document.querySelector('.faq')
if (faq) {
	const faqTabs = new Tabs('faq-tabs')
	const faqAccordion = new Accordion('.faq__body')
}

const advantagesStorage = document.querySelector('.advantages-storage')
if (advantagesStorage) {
	const advantagesStorageTabs = new Tabs('advantages-storage-tabs')
}

if (document.querySelector('.business__accords')) {
	const businessAccord = new Accordion('.business__accords')
}

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

if (document.querySelector('.special-swiper-offer')) {
	new Swiper('.special-swiper-offer', {
		spaceBetween: 10,
		breakpoints: {
			320: {
				slidesPerView: 1.2,
			},
			630: {
				slidesPerView: 2.2,
			},
			910: {
				slidesPerView: 3.2,
			},
			1200: {
				slidesPerView: 4,
			},
		},
	})
}

const businessTabs = document.querySelector('.business__tabs')
if (businessTabs) {
	const tabs = businessTabs.querySelectorAll('.business__tabs_button')
	const items = businessTabs.querySelectorAll('.business__tabs_item')

	if (tabs.length) {
		tabs[0].classList.add('_tab-btn-active')
		changeTabs(tabs[0])

		tabs.forEach(tab => {
			tab.addEventListener('click', () => {
				changeTabs(tab)
			})
		})
	}

	function changeTabs(tab) {
		tabs.forEach(
			_tab =>
				_tab.classList.contains('_tab-btn-active') &&
				_tab.classList.remove('_tab-btn-active')
		)
		tab.classList.add('_tab-btn-active')
		items.length &&
			items.forEach(item => {
				item.getAttribute('tabs-id') == tab.getAttribute('tabs-id')
					? item.classList.add('active')
					: item.classList.remove('active')
			})
	}
}

// ==============================================>
const expandableTexts = document.querySelectorAll('.expand-text')

expandableTexts.length &&
	expandableTexts.forEach(textBlock => {
		const expandButton = textBlock.querySelector('.texts__expand-button')

		expandButton.addEventListener('click', () => {
			textBlock.classList.toggle('active')
			expandButton.textContent = textBlock.classList.contains('active')
				? 'Свернуть текст'
				: 'Развернуть текст'
		})
	})
// ==============================================>
