import { validate } from "./validate.js"
import { outputInfo } from "../../utils/outputinfo.js"
import api from "../../settings/api.js"
import { Loader } from "../../modules/myLoader.js"
import { modalFeedbackForm } from "../modals/modalFeedbackForm.js"
import { modalOpening } from "../modals/modalOpening.js"
import { сallTouch } from '../сallTouch.js'

const questions = () => {
  const forms = document.querySelectorAll('.form-questions')
  if (!forms.length) return

  forms.forEach(form => {
    const validator = validate(form)
    const loader = new Loader(form.closest('.questions__content'))

    form.addEventListener('submit', () => {
      if (!validator.isValid) return
      const formData = new FormData(form)
      formData.delete('personal_data')
      formData.set('username', formData.get('username').replace(/[+() -]/g, ''))
      let data = {}
      Array.from(formData).forEach(obj => data[obj[0]] = obj[1])

      sendForm(data, loader, form, validator)
      сallTouch({ ...data, form })

      if (form.classList.contains('do-not-wait-server-response')) {
        outputInfo({ msg: form.getAttribute('data-res-msg') ? form.getAttribute('data-res-msg') : 'Заявка отправлена', msg_type: 'success' })
        loader.disable()
      }

      if (form.closest('.modal')) {
        modalFeedbackForm.close()
        modalOpening.close()
        outputInfo({ msg: 'Заявка отправлена', msg_type: 'success' })
      }
    })
  })

  async function sendForm(data, loader, form, validator) {
    try {
      loader && loader.enable()
      const response = await api.post('/_receive_question_', data)

      if (!form.closest('.modal') && !form.classList.contains('do-not-wait-server-response')) {
        outputInfo(response.data)
      }

      if (response.data.msg_type === 'success') {
        ym(97074608, 'reachGoal', 'forma-zabronirovat')
        form.reset()
        validator.refresh()
      }
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      loader && loader.disable()
    }
  }
}

export default questions