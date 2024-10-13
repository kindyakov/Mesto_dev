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
        this.openDoor()
      }
    })
  }

  renderModalConfirm() {
    this.modalConfirmOpenDoor.modal.querySelector('.modal-confirm-open-barrier__content p').innerHTML = `
    Вы уверены, что хотите открыть дверь на складе 1?`

    this.modalConfirmOpenDoor.open()
  }

  async openDoor() {
    try {
      this.loader.enable()
      const response = await apiWithAuth.post('/_open_door_?warehouse_id=1')
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