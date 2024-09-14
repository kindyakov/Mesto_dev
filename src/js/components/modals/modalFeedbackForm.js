import { Modal } from "../../modules/myModal.js"

export const modalFeedbackForm = new Modal('.modal-feedback-form', {
  modalBtnActive: '.btn-open-modal-feedback-form',
  onOpen: (e, target) => {
    sessionStorage.setItem('isFeedback', true)
    ym(97074608, 'reachGoal', 'zabronirovat')
    const btn = e?.target.closest('.btn-open-modal-feedback-form')
    const title = target.modal.querySelector('.h2')
    const subTitle = target.modal.querySelector('.questions__subtitle')

    title.textContent = 'Персональное предложение'
    subTitle.textContent = 'Оставьте заявку и мы свяжемся с Вами'
    
    if (btn) {
      const id = btn.getAttribute('data-warehouse-id')
      if (id == '2') {

        title.textContent = 'Скоро открытие'
        subTitle.textContent = 'Для бронирования кладовки оставьте заявку и мы с Вами свяжемся'

      }
    }
  }
})