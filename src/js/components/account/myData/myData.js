import { Tabs } from "../../../modules/myTabs.js"
import { Loader } from "../../../modules/myLoader.js"

import { apiWithAuth } from "../../../settings/api.js"
import { outputInfo } from "../../../utils/outputinfo.js"

import { validatesInput } from "../../../settings/validates.js"
import { validateAgreementConclusion, validatePassports } from "../../rentRoom/validate.js"
import { getFormattedDate } from "../../../utils/getFormattedDate.js"
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

    this.setValidator()

    this.formPassportsData.addEventListener('submit', e => this.handleSubmit(e))
  }

  handleSubmit(e) {
    this.validator.revalidate().then(isValid => {
      if (!isValid) return
      const formData = new FormData(e.target)

      if (!this.imgPassportFile && !this.isRequiredPassportsData) {
        this.formPassportPhoto.classList.add('_err')
        this.formPassportPhoto.classList.remove('_success')
        this.imgPassport.src = ''
        return
      }

      formData.set('user_type', 'f')

      if (this.isRequiredPassportsData) {
        let data = {}

        formData.set('issue_date', getFormattedDate('YYYY-MM-DD', new Date(formData.get('issue_date'))))
        Array.from(formData).forEach(arr => data[arr[0]] = arr[1])

        this.editClient(data)
      } else {
        const ids = this.clientData.rooms.filter(room => room.rented == 0.45).map(room => room.room_id)

        formData.set('file', this.imgPassportFile)
        formData.set('room_ids', JSON.stringify(ids))
        formData.set('birthday', getFormattedDate('YYYY-MM-DD', new Date(formData.get('birthday'))))
        formData.set('issue_date', getFormattedDate('YYYY-MM-DD', new Date(formData.get('issue_date'))))

        this.formNewAgreement(formData)
      }
    })
  }

  renderMyData({ profile = null, clientTotalData = null }) {
    if (!clientTotalData) return
    const { client } = this.clientData = clientTotalData
    const tabInfo = this.accountMyData.querySelector('.btn-tabs-main-information')
    const tabCon = this.accountMyData.querySelector('.btn-tabs-contacts-data')
    const tabRec = this.accountMyData.querySelector('.my-data-tabs-btn.btn-tabs-requisites')
    const tabPas = this.accountMyData.querySelector('.my-data-tabs-btn.btn-tabs-passport-data')

    if (!this.isRequiredPassportsData) {
      tabInfo.classList.add('_none')
      tabCon.classList.add('_none')
      tabRec.classList.add('_none')
      this.myDataTabs.switchTabs(tabPas)
    }

    this.inputs.length && this.inputs.forEach(input => {
      const value = profile[input.name] ? profile[input.name] : ''

      if (input.name === 'username') {
        input.value = value ? value.slice(1) : ''
      } else if (input.classList.contains('input-date')) {
        input.value = value ? getFormattedDate('DD-MM-YYYY', new Date(value)) : ''
      }
      else {
        input.value = value
      }
    })

    if (client.passp_photo_link) {
      this.imgPassport.src = client.passp_photo_link
      this.imgPassport.closest('form').classList.add('_success')
    }

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
  }

  setValidator() {
    if (!this.isRequiredPassportsData) {
      this.changePassportsData()
    }
    this.validator = this.isRequiredPassportsData ? validatePassports(this.formPassportsData) : validateAgreementConclusion(this.formPassportsData)
  }

  changePassportsData() {
    this.formPassportsData.insertAdjacentHTML('afterbegin', `<div class=" wrap-input">
                    <input type="text" name="familyname" class="input input-agreement-conclusion my-data-input"
                      placeholder="Фамилия">
                  </div>
                  <div class="wrap-input">
                    <input type="text" name="firstname" class="input input-agreement-conclusion my-data-input"
                      placeholder="Имя">
                  </div>
                  <div class="wrap-input">
                    <input type="text" name="patronymic" class="input input-agreement-conclusion my-data-input"
                      placeholder="Отчество">
                  </div>
                  <div class=" wrap-input">
                    <input type="text" name="birthday"
                      class="input input-agreement-conclusion not-icon-date input-date my-data-input"
                      placeholder="Дата рождения">
                  </div>
                  <div class=" wrap-input wrap-input-last">
                    <input type="text" name="address" class="input input-agreement-conclusion my-data-input"
                      placeholder="Адрес регистрации">
                  </div>`)

    this.inputs = this.accountMyData.querySelectorAll('.my-data-input')
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

  async editClient(data) {
    try {
      this.loader.enable()
      const response = await apiWithAuth.post('/_edit_client_by_client_', { client: data })

      if (response.status !== 200) return null
      outputInfo(response.data)
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.disable()
    }
  }
}

export default MyData