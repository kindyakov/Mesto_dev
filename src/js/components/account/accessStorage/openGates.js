import { Modal } from "../../../modules/myModal.js"


class OpenGates {
  constructor({ loader }) {
    this.modalConfirmOpenGates = new Modal('.modal-confirm-open-gates', {
      modalBtnClose: '.btn-modal-close'
    })

    this.loader = loader
  }

  renderModalConfirm() {
    this.modalConfirmOpenGates.modal.querySelector('.modal-confirm-open-barrier__content p').innerHTML = `
    Вы уверены, что хотите открыть ворота на складе 1?`

    this.modalConfirmOpenGates.open()
  }
}

export default OpenGates