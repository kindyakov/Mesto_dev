import { Modal } from "../../../modules/myModal.js"
import { apiWithAuth } from "../../../settings/api.js"
import { outputInfo } from "../../../utils/outputinfo.js"

class OpenBarrier {
  constructor({ loader }) {
    this.modalConfirmOpenBarrier = new Modal('.modal-confirm-open-barrier', {
      modalBtnClose: '.btn-modal-close'
    })

    this.loader = loader

    this.events()
  }

  events() {
    if (!this.modalConfirmOpenBarrier.modal) return
    this.modalConfirmOpenBarrier.modal.addEventListener('click', e => {
      if (e.target.closest('.btn-yes')) {
        this.openBarrier()
      }
    })
  }

  renderModalConfirm() {
    this.modalConfirmOpenBarrier.modal.querySelector('.modal-confirm-open-barrier__content p').innerHTML = `
    Вы уверены, что хотите открыть шлагбаум на складе 1?`

    this.modalConfirmOpenBarrier.open()
  }

  async openBarrier() {
    try {
      this.loader.enable()
      const response = await apiWithAuth.get('/_open_barrier_?warehouse_id=1')
      if (response.status !== 200) return
      outputInfo(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default OpenBarrier