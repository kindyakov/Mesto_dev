import { Tabs } from "../../../modules/myTabs.js"
import { Loader } from "../../../modules/myLoader.js"

import { apiWithAuth } from "../../../settings/api.js"
import { outputInfo } from "../../../utils/outputinfo.js"

import { validatesInput } from "../../../settings/validates.js"
import { validateAgreementConclusion } from "../../rentRoom/validate.js"
// import { validateUrData } from "./validate.js"

class MyData {
  constructor() {
    this.accountMyData = document.querySelector('.account-my-data')
    this.myDataTabs = new Tabs('account-tabs', {
      btnSelector: '.my-data-tabs-btn',
      contentSelector: '.my-data-tabs-content',
      // activeIndexTab: 2
    })

    this.loader = new Loader(document.querySelector('.main'), {
      isHidden: false, customSelector: 'custom-loader', position: 'fixed', id: 'my-data-loader'
    })

    this.forms = this.accountMyData.querySelectorAll('.form-account-data')
    this.inputs = this.accountMyData.querySelectorAll('.my-data-input')
    this.formPassportPhoto = this.accountMyData.querySelector('.form-passport-photo')
    this.inputPhotoPassport = this.accountMyData.querySelector('.input-photo-passport')
    this.formPassportsData = this.accountMyData.querySelector('.form-passorts-data')
    this.formUrData = this.accountMyData.querySelector('.form-ur-data')
    this.imgPassport = this.accountMyData.querySelector('.img-passport')

    this.isRequiredPassportsData = true
    this.imgPassportFile = null
    this.clientData = null

    this.validators = {}

    this.init()
  }

  init() {
    this.forms.length && this.forms.forEach(form => {
      const typeForm = form.getAttribute('data-form-type')
      if (!typeForm) return
      this.validators[typeForm] = (validatesInput[typeForm](form))
    })

    this.events()
  }

  events() {
    // this.myDataTabs.options.onChange = (nexTabBtn) => {}

    this.forms.length && this.forms.forEach(form => {

      form.addEventListener('submit', e => {
        e.preventDefault()
        const typeForm = form.getAttribute('data-form-type')
        if (!typeForm || !this.validators[typeForm].isValid) return
        const formData = new FormData(form)
        formData.set('change_type', typeForm)
        if (typeForm === 'username') {
          formData.set('new', formData.get(typeForm).replace(/[+() -]/g, ''))
        } else {
          formData.set('new', formData.get(typeForm))
        }
        formData.delete(typeForm)

        this.changeData(formData)
      })
    })

    this.inputPhotoPassport.addEventListener('change', e => {
      const form = e.target.closest('form')
      if (e.target.files.length) {
        const reader = new FileReader()
        const formData = new FormData()
        let file = this.imgPassportFile = e.target.files[0]

        reader.onload = e => {
          this.imgPassport.src = e.target.result
          this.imgPassport.alt = 'Фото паспорта';
        }

        reader.readAsDataURL(file)

        formData.append('file', file)

        this.isFile = true
        form.classList.remove('_err')
        form.classList.add('_success')

        if (this.isRequiredPassportsData) {
          this.uploadNewPassportPhoto(formData)
        }
      } else {
        this.isFile = false
        form.classList.add('_err')
        form.classList.remove('_success')
        this.imgPassport.src = ''
        this.imgPassport.alt = ''
        this.imgPassportFile = null
      }
    })
  }

  renderMyData({ profile, clientTotalData }) {
    if (!clientTotalData) return
    const { client } = clientTotalData
    this.clientData = clientTotalData

    this.inputs.length && this.inputs.forEach(input => {
      if (input.name === 'username') {
        input.value = profile[input.name] ? profile[input.name].slice(1) : ''
      } else {
        input.value = profile[input.name] ? profile[input.name] : ''
      }
    })

    if (client.passp_photo_link) {
      this.imgPassport.src = client.passp_photo_link
      this.imgPassport.closest('form').classList.add('_success')
    }

    const tabInfo = this.accountMyData.querySelector('.btn-tabs-main-information')
    const tabCon = this.accountMyData.querySelector('.btn-tabs-contacts-data')
    const tabPas = this.accountMyData.querySelector('.my-data-tabs-btn.btn-tabs-passport-data')
    const tabRec = this.accountMyData.querySelector('.my-data-tabs-btn.btn-tabs-requisites')

    if (profile?.user_type === 'u') {
      tabPas.classList.add('_none')
      tabRec.classList.remove('_none')
    } else if (profile?.user_type === 'f') {
      tabPas.classList.remove('_none')
      tabRec.classList.add('_none')
    } else {
      tabPas.classList.remove('_none')
      tabRec.classList.remove('_none')
    }

    if (!this.isRequiredPassportsData) {
      tabInfo.classList.add('_none')
      tabCon.classList.add('_none')
      tabRec.classList.add('_none')
      this.myDataTabs.switchTabs(tabPas)
      this.changePassportsData()
    }
  }

  changePassportsData() {
    this.formPassportsData.insertAdjacentHTML('afterbegin', `<div class=" wrap-input">
                    <input type="text" name="familyname" class="input input-agreement-conclusion"
                      placeholder="Фамилия">
                  </div>
                  <div class="wrap-input">
                    <input type="text" name="firstname" class="input input-agreement-conclusion"
                      placeholder="Имя">
                  </div>
                  <div class="wrap-input">
                    <input type="text" name="patronymic" class="input input-agreement-conclusion"
                      placeholder="Отчество">
                  </div>
                  <div class=" wrap-input">
                    <input type="text" name="birthday"
                      class="input input-agreement-conclusion not-icon-date"
                      placeholder="Дата рождения" readonly>
                  </div>
                  <div class=" wrap-input wrap-input-last">
                    <input type="text" name="address" class="input input-agreement-conclusion"
                      placeholder="Адрес регистрации">
                  </div>`)
    this.formPassportsData.insertAdjacentHTML('beforeend', `<button class="button-5" type="submit"><span>Сохранить</span></button>`)
    // this.formUrData.insertAdjacentHTML('beforeend', `<button class="button-5" type="submit"><span>Сохранить</span></button>`)

    const validatorPassport = validateAgreementConclusion(this.formPassportsData)

    // const validatorUrData = validateUrData(this.formUrData)
    this.formPassportsData.addEventListener('submit', e => {
      if (validatorPassport.isValid) {
        const formData = new FormData(e.target)

        if (!this.imgPassportFile) {
          this.formPassportPhoto.classList.add('_err')
          this.formPassportPhoto.classList.remove('_success')
          this.imgPassport.src = ''
          return
        }

        const ids = this.clientData.rooms.filter(room => room.rented == 0.45).map(room => room.room_id)

        formData.set('file', this.imgPassportFile)
        formData.set('room_ids', JSON.stringify(ids))
        formData.set('user_type', 'f')

        this.formNewAgreement(formData)
      }
    })

    // this.formUrData.addEventListener('submit', e => {
    //   if (validatorUrData.isValid) {
    //     const formData = new FormData(e.target)
    //     this.formNewAgreement(formData)
    //   }
    // })
  }

  async changeData(formData) {
    try {
      this.loader.enable()
      const response = await apiWithAuth.post('/_change_data_', formData)
      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.disable()
    }
  }

  async uploadNewPassportPhoto(formData) {
    try {
      this.loader.enable()
      const response = await apiWithAuth.post('/_upload_new_passport_photo_', formData)

      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async formNewAgreement(formData) {
    try {
      this.loader.enable();
      const response = await apiWithAuth.post('/_form_new_agreement_', formData)

      if (response.status !== 200) return null
      outputInfo(response.data)
      if (response.data.msg_type === 'success') {
        location.reload()
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.disable()
    }
  }
}

export default MyData