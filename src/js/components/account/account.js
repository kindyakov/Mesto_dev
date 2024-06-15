import { Tabs } from "../../modules/myTabs.js"
import { Loader } from "../../modules/myLoader.js"
import { apiWithAuth, checkAuth } from "../../settings/api.js"

import AccessStorage from "./accessStorage/accessStorage.js"
import Storerooms from "./storerooms/storerooms.js"
import ChangePassword from "./changePassword/changePassword.js"
import Departure from "./departure/departure.js"
import MyData from "./myData/myData.js"
import PaymentMethods from "./paymentMethods/paymentMethods.js"
import FormNewAgreement from "./formNewAgreement.js"
import { getClientTotalData } from "./request.js"
import { isOneRented } from "./utils/isAllRented.js"

class Account {
  constructor() {
    this.account = document.querySelector('.account')
    if (!this.account) return

    this.urlParams = new URLSearchParams(window.location.search)

    this.formNewAgreement = new FormNewAgreement()

    this.accountTabs = new Tabs('account-tabs', {
      btnSelector: '.account-tabs-btn',
      contentSelector: '.account-tabs-content',
      // activeIndexTab: 1,
      wrapperTabBtnSelector: '.pers-acc__row__left-col',
      // onInit: (tabsBtnActive, tabsContentActive) => this.initTabs(tabsBtnActive, tabsContentActive)
    })

    this.accessStorage = new AccessStorage()
    this.storerooms = new Storerooms()
    this.changePassword = new ChangePassword({ accountTabs: this.accountTabs })
    this.myData = new MyData()
    this.paymentMethods = new PaymentMethods()
    this.departure = new Departure()

    this.accessStorage.myData = this.myData

    this.loader = new Loader(document.querySelector('.main'), {
      isHidden: false,
      customSelector: 'custom-loader',
      position: 'fixed',
      id: 'account-loader'
    })

    this.accountLink = document.querySelector('.account-link-header')

    this.isAuth = checkAuth()

    this.profile = null
    this.user = null
    this.completeLeaseRoomId = null

    this.init()
  }

  events() {
    if (!this.account) return
    this.accountTabs.options.onChange = (nexTabBtn, prevTabBtn, nextTabContent, prevTabContent) => this.changeTabs(nexTabBtn, nextTabContent)

    this.account.addEventListener('click', e => {
      if (e.target.closest('.btn-complete-lease')) {
        const btn = e.target.closest('.btn-complete-lease')
        const currentRoomId = btn.getAttribute('data-room-id')
        this.completeLeaseRoomId = +currentRoomId
        this.accountTabs.switchTabs(this.account.querySelector('.account-departures-btn'))
        this.departure.renderDeparture({ roomId: currentRoomId })
      }
    })

    this.accountLink && this.accountLink.addEventListener('click', e => {
      e.preventDefault()
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.location.pathname = 'index.html'
    })

    this.changeTabs(this.accountTabs.tabsBtnActive, this.accountTabs.tabsContentActive)
  }

  async init() {
    if (!this.account) return

    if (!this.isAuth) {
      document.location.pathname = 'index.html'
    }

    if (this.accountLink) {
      this.accountLink.classList.add('_exit')
      this.accountLink.innerHTML = `
      <i>
				<svg class='icon icon-exit'>
					<use xlink:href='img/svg/sprite.svg#exit'></use>
				</svg>
			</i>
			<span>Выйти</span>`
    }

    try {
      this.loader.enable()
      await this.getProfile()
      await this.initTabs(this.accountTabs.tabsBtnActive, this.accountTabs.tabsContentActive)
    } catch (error) {
      this.loader.disable()
    }
  }

  async getProfile() {
    try {
      const response = await apiWithAuth.get('/_profile_')

      if (response.status !== 200) return
      const { user } = response.data
      const roomId = this.urlParams.get('room_id')
      const num_monthes = this.urlParams.get('num_monthes')

      this.profile = user
      this.formNewAgreement.profile = user

      if (roomId && num_monthes) {
        this.formNewAgreement.createAgreement({ profile: user, roomId, num_monthes })
      }

      if (!this.profile.own_password && this.accountTabs.tabsBtns.length) {
        this.accountTabs.tabsBtns.forEach(btn => {
          if (!btn.classList.contains('account-tabs-btn-change-password')) {
            btn.classList.add('_none')
          } else {
            btn.innerHTML = `<span>Создайте пароль</span>`
            document.querySelector('.form-change-password').classList.add('create-password')
          }
        })

        this.accountTabs.switchTabs(this.accountTabs.tabs.querySelector('.account-tabs-btn-change-password'))
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.events()
    }
  }

  async initTabs(tabsBtnActive, tabsContentActive) {
    try {
      this.loader.enable()

      const clientTotalData = await getClientTotalData()
      const { rooms, test_rooms } = clientTotalData

      const accountStoreroomsRooms = document.querySelector('.account-storerooms-rooms')
      accountStoreroomsRooms.classList.remove('_none')

      if (rooms.length) {
        // Если нет оплаченных ячеек с rented: 1 то скрытие вкладки "Выезды"
        if (!isOneRented(rooms)) {
          document.querySelector('[data-tabs-btn="account-tabs-5"]').classList.add('_none')
        }

        // Если ячейка оплачена с rented: 0.45 то скрываю все вкладки кроме "Мои данные"
        if (isOneRented(rooms, 0.45)) {
          this.accountTabs.tabsBtns.forEach(btn => {
            if (!btn.classList.contains('account-tabs-btn-my-data')) {
              btn.classList.add('_none')
            }
          })
          this.myData.isRequiredPassportsData = false
          this.accountTabs.switchTabs(this.accountTabs.tabs.querySelector('.account-tabs-btn-my-data'))
          return
        }
        // Если нет оплаченных ячеек и нет тестовых ячеек то скрытие  вкладки "Открытие" 
        else if (!isOneRented(rooms) && !isOneRented(test_rooms, 0.25)) {
          document.querySelector('[data-tabs-btn="account-tabs-0"]').classList.add('_none')
          this.accountTabs.switchTabs(document.querySelector('.account-tabs-btn[data-tabs-btn="account-tabs-1"]'))
          return
        }
      } else {
        accountStoreroomsRooms.classList.add('_none')
        document.querySelector('[data-tabs-btn="account-tabs-5"]').classList.add('_none')

        if (!test_rooms.length) {
          document.querySelector('[data-tabs-btn="account-tabs-0"]').classList.add('_none')
          this.accountTabs.switchTabs(document.querySelector('.account-tabs-btn[data-tabs-btn="account-tabs-1"]'))
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async changeTabs(tabsBtnActive, tabsContentActive) {
    try {
      this.loader.enable()
      const clientTotalData = await getClientTotalData()

      this.formNewAgreement.clientData = clientTotalData
      this.storeroomsRooms = document.querySelector('.account-storerooms-rooms')
      this.storeroomsScheme = document.querySelector('.account-storerooms-scheme')
      this.storeroomsRooms.classList.add('_none')
      this.storeroomsScheme.classList.add('_none')

      if (tabsContentActive.classList.contains('account-assets-storage')) {
        this.accessStorage.render({ accountTabs: this.accountTabs, clientTotalData })
        this.storeroomsRooms.classList.remove('_none')
      } else if (tabsContentActive.classList.contains('account-storerooms')) {
        this.storerooms.renderAgreement({ clientTotalData, formNewAgreement: this.formNewAgreement })
        this.storeroomsScheme.classList.remove('_none')

      } else if (tabsContentActive.classList.contains('account-change-password')) {
        this.changePassword.renderForm()

      } else if (tabsContentActive.classList.contains('account-my-data')) {
        this.myData.renderMyData({ profile: this.profile, clientTotalData })

      } else if (tabsContentActive.classList.contains('account-payment-methods')) {
        this.paymentMethods.renderPaymentMethods({ clientTotalData })

      } else if (tabsContentActive.classList.contains('account-departures')) {
        this.departure.renderDeparture({ clientTotalData })
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default Account