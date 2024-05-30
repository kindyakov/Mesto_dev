import { Modal } from "../../../modules/myModal.js"
import { apiWithAuth } from "../../../settings/api.js"
import { outputInfo } from "../../../utils/outputinfo.js"


class OpenDoor {
  constructor({ loader }) {
    this.modalConfirmOpenDoor = new Modal('.modal-confirm-open-door', {
      modalBtnClose: '.btn-modal-close'
    })

    this.loader = loader

    this.events()
  }

  events() {
    if (!this.modalConfirmOpenDoor.modal) return
    this.modalConfirmOpenDoor.modal.addEventListener('click', e => {
      if (e.target.closest('.btn-yes')) {
        this.unlock()
      }
    })
  }

  renderModalConfirm() {
    this.modalConfirmOpenDoor.modal.querySelector('.modal-confirm-open-barrier__content p').innerHTML = `
    Вы уверены, что хотите открыть дверь на складе 1?`

    this.modalConfirmOpenDoor.open()
  }

  async unlock() {
    try {
      this.loader.enable()
      const response = await apiWithAuth.post('unlock/0')
      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

}

export default OpenDoor