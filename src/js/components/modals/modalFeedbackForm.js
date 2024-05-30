import { Modal } from "../../modules/myModal.js"

export const modalFeedbackForm = new Modal('.modal-feedback-form', {
  modalBtnActive: '.btn-open-modal-feedback-form',
  onOpen: () => {
    sessionStorage.setItem('isFeedback', true)
    ym(97074608, 'reachGoal', 'zabronirovat')
  }
})