import { Tabs } from "../../../modules/myTabs.js"
import { Loader } from "../../../modules/myLoader.js"

import { getClientTotalData } from "../request.js"
import { apiWithAuth } from "../../../settings/api.js"
import { outputInfo } from "../../../utils/outputinfo.js"

import { validatesInput } from "../../../settings/validates.js"

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
    this.inputPhotoPassport = this.accountMyData.querySelector('.input-photo-passport')
    this.imgPassport = this.accountMyData.querySelector('.img-passport')

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
        let file = e.target.files[0]

        reader.onload = e => {
          this.imgPassport.src = e.target.result
          this.imgPassport.alt = 'Фото паспорта';
        }

        reader.readAsDataURL(file)

        formData.append('file', file)

        this.isFile = true
        form.classList.remove('_err')
        form.classList.add('_success')

        this.uploadNewPassportPhoto(formData)
      } else {
        this.isFile = false
        form.classList.add('_err')
        form.classList.remove('_success')
        this.imgPassport.src = ''
        this.imgPassport.alt = ''
      }
    })
  }

  async renderMyData(profile) {
    try {
      this.loader.enable()
      const data = await getClientTotalData()
      if (!data) return
      const { client } = data
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

      const tabPas = this.accountMyData.querySelector('.my-data-tabs-btn.btn-tabs-passport-data')
      const tabRec = this.accountMyData.querySelector('.my-data-tabs-btn.btn-tabs-requisites')

      if (profile?.user_type === 'u') {
        tabPas.classList.add('_none')
        tabRec.classList.remove('_none')
      } else {
        tabPas.classList.remove('_none')
        tabRec.classList.add('_none')
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loader.disable()
    }
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
}

export default MyData