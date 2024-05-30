export class Modal {
  constructor(selector, options) {
    let defaultoptions = {
      onOpen: () => { },
      onClose: () => { },
      modalBtnActive: '.modal-btn-active',
      modalBtnClose: '.modal__close',
      classActive: '_active',
      modalContent: 'modal__body',
      isClose: true,
      isAnimation: false,
      isHidden: false
    }
    this.options = Object.assign(defaultoptions, options)
    this.modal = document.querySelector(selector)
    this.speed = 300
    this.isOpen = false
    this.modalContainer = false
    this.fixBocks = document.querySelectorAll('.fix-block')
    this.mouseDownTarget = null
    this.events()
  }

  events() {
    if (!this.modal) return
    document.addEventListener('click', e => {
      if (e.target.closest(this.options.modalBtnActive)) {
        e.preventDefault()
        this.open(e)
        return
      }

      if (e.target.closest(this.options.modalBtnClose) && this.isOpen) {
        this.close(e)
        return
      }
    })

    document.addEventListener('mousedown', e => {
      this.mouseDownTarget = e.target
    })

    document.addEventListener('mouseup', e => {
      if (this.mouseDownTarget && this.mouseDownTarget === e.target && !e.target.closest(`.${this.options.modalContent}`) && this.isOpen) {
        this.close(e);
      }

      this.mouseDownTarget = null;
    })

    window.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        if (this.isOpen) {
          this.close(e)
        }
      }
    })
  }

  close(e) {
    if (!this.options.isClose) return

    this.isOpen = false
    this.modal.classList.remove(this.options.classActive)
    this.options.onClose(e)
    this.enableScroll()
  }

  open(e) {
    setTimeout(() => {
      if (!this.options.isHidden) {
        this.modal.classList.add(this.options.classActive)
      }
      this.disableScroll()

      this.isOpen = true
      this.options.onOpen(e)
    }, 0)
  }

  disableScroll() {
    const pagePos = window.scrollY
    this.lockPadding()
    document.body.classList.add('_lock')
    document.body.dataset.position = pagePos
    // document.body.style.top = pagePos + 'px'
  }

  enableScroll() {
    const pagePos = parseInt(document.body.dataset.position, 10)
    this.unlockPadding()
    document.body.style.top = 'auto'
    document.body.classList.remove('_lock')
    window.scroll({ top: pagePos, left: 0 })
    document.body.removeAttribute('data-position')
  }

  lockPadding() {
    const paddingOffset = window.innerWidth - document.body.offsetWidth
    this.modal.style.paddingRight = paddingOffset ? paddingOffset + 'px' : 'none'
    document.querySelector('.wrapper').style.paddingRight = paddingOffset + 'px'
  }

  unlockPadding() {
    this.modal.removeAttribute('style')
    document.querySelector('.wrapper').style.paddingRight = 0
  }
}

export class ConfirmModal extends Modal {
  constructor(selector, options) {
    super(selector, options);
    let defaultoptions = {
      confirmButton: '.btn-yes',
      cancelButton: '.btn-no'
    }

    this.options = { ...this.options, ...Object.assign(defaultoptions, options) }

    this.confirmButton = this.modal.querySelector(this.options.confirmButton);
    this.cancelButton = this.modal.querySelector(this.options.cancelButton);

    this.buttonAction = () => { }
  }

  events() {
    super.events();
    this.modal.addEventListener('click', e => {
      if (e.target.closest(this.options.confirmButton)) {
        this.buttonAction(true, e)
      }
      if (e.target.closest(this.options.cancelButton)) {
        this.buttonAction(false, e)
      }
    })
  }
}
