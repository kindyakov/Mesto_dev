import { Modal } from '../../../modules/myModal.js'
import { checkMobile } from '../../../utils/checkMobile.js'
import { Loader } from '../../../modules/myLoader.js'
import WarehousesResult from '../../warehousesResult/warehousesResult.js'
import api from '../../../settings/api.js'
import { outputInfo } from '../../../utils/outputinfo.js'
import { validate } from './validate.js'
import { сallTouch } from '../../сallTouch.js'

class ModalQuiz {
  constructor({ warehouses }) {
    this.modalQuiz = new Modal('.modal-quiz', {
      modalBtnActive: '.btn-open-modal-quiz'
    })
    if (!this.modalQuiz.modal) return

    this.loader = new Loader(this.modalQuiz.modal.querySelector('.modal__body'))

    this.sliderMain = new Swiper('.slider-main-modal-quiz', {
      spaceBetween: 20,
      allowTouchMove: false,
      // initialSlide: 1,
    })
    this.sliderQuiz = new Swiper('.slider-modal-quiz', {
      spaceBetween: 20,
      allowTouchMove: false,
      // initialSlide: 2,
    })
    this.sliderWrapperMain = this.modalQuiz.modal.querySelector('.wrapper-slider-modal-quiz')
    this.sliderWrapperQuiz = this.modalQuiz.modal.querySelector('.modal-quiz__slider_wrapper')

    this.isMobile = checkMobile()

    this.formWarehouses = this.modalQuiz.modal.querySelector('.form-modal-quiz-warehouses')
    this.progressBar = this.modalQuiz.modal.querySelector('.progress-bar-modal-quiz')
    this.progressPercent = this.modalQuiz.modal.querySelector('.progress-percent-modal-quiz')

    this.warehousesWrapper = this.modalQuiz.modal.querySelector('.warehouses-wrapper-modal-quiz')
    this.warehouses = warehouses
    this.warehousesResult = new WarehousesResult(this.warehousesWrapper, {
      onlyWarehouse: true,
    })

    this.formLeaveRequest = this.modalQuiz.modal.querySelector('.form-leave-request-modal-quiz')
    this.validatorLeaveRequest = validate(this.formLeaveRequest)

    this.init()
  }

  init() {
    if (!this.modalQuiz.modal) return
    this.renderWarehouses()

    this.events()
  }

  events() {
    this.modalQuiz.modal.addEventListener('click', e => {
      if (e.target.closest('.btn-back')) {
        this.backSlide()
      }

      if (e.target.closest('.btn-further')) {
        this.nextSlide()
      }

      if (e.target.closest('.btn-slide-skip')) {
        this.nextSlideMain()
      }
    })

    this.modalQuiz.options.onOpen = () => {
      this.setMaxHeight(this.sliderWrapperQuiz, this.sliderQuiz.slides[this.sliderQuiz.activeIndex])
    }

    this.modalQuiz.options.onClose = () => {
      this.sliderMain.slideTo(0)
      this.sliderQuiz.slideTo(0)
      this.progressBar.style.width = "0";
      this.progressPercent.textContent = "0%";
      this.sliderWrapperMain.style.maxHeight = 'none'
      this.sliderQuiz.el.querySelectorAll('input').forEach(input => {
        input.checked = false
      })
    }

    this.formLeaveRequest.addEventListener('submit', e => {
      if (!this.validatorLeaveRequest.isValid) return
      const formData = new FormData(this.formLeaveRequest)
      let data = {}

      formData.delete('personal_data')
      formData.set('username', formData.get('username').replace(/[+() -]/g, ''))
      Array.from(formData).forEach(arr => data[arr[0]] = arr[1])

      сallTouch({ ...data, form: e.target })
      this.sendForm(data)
    })
  }

  nextSlide() {
    const slideActive = this.sliderQuiz.slides[this.sliderQuiz.activeIndex]
    if (!slideActive) return
    const currentForm = slideActive.querySelector('.form-modal-quiz')
    const fromData = new FormData(currentForm)

    if (Array.from(fromData).length) {
      if (this.sliderQuiz.activeIndex === this.sliderQuiz.slides.length - 1) {
        this.nextSlideMain()
      } else {
        this.sliderQuiz.slideNext()
      }
      this.setMaxHeight(this.sliderWrapperQuiz, this.sliderQuiz.slides[this.sliderQuiz.activeIndex])
      this.updateProgressBar(this.sliderQuiz.activeIndex, this.sliderQuiz.slides.length)
    } else {
      const currentLabels = slideActive.querySelectorAll('.modal-quiz__slider_slide-label')
      if (!currentLabels.length) return
      currentLabels.forEach(label => label.classList.add('_err'))
      setTimeout(() => {
        currentLabels.forEach(label => label.classList.remove('_err'))
      }, 1000)

      this.isMobile && currentLabels[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

  }

  backSlide() {
    if (this.sliderQuiz.activeIndex === 0) return
    const prevSlide = this.sliderQuiz.slides[this.sliderQuiz.activeIndex - 1]
    this.sliderQuiz.slidePrev()
    this.setMaxHeight(this.sliderWrapperQuiz, prevSlide)
    this.updateProgressBar(this.sliderQuiz.activeIndex, this.sliderQuiz.slides.length)
  }

  nextSlideMain() {
    this.warehousesResult.render(this.warehouses)
    this.setMaxHeight(this.sliderWrapperMain, this.sliderMain.slides[this.sliderMain.activeIndex])
    this.sliderMain.slideNext()
  }

  setMaxHeight(wrapper, slide) {
    if (!wrapper || !slide) return
    setTimeout(() => {
      wrapper.style.maxHeight = slide.scrollHeight + 'px'
    })
  }

  updateProgressBar(currentIndex, totalSlides) {
    if (currentIndex < 0 || currentIndex >= totalSlides || totalSlides <= 0) {
      return;
    }
    const percent = ((currentIndex) / totalSlides) * 100;
    this.progressBar.style.width = percent + "%";
    this.progressPercent.textContent = Math.round(percent) + "%";
  }

  async renderWarehouses() {
    try {
      this.loader.enable()
      if (!this.warehouses.length) return
      this.formWarehouses.innerHTML = ''
      this.warehouses.forEach(warehouse => {
        this.formWarehouses.insertAdjacentHTML('beforeend', `
        <label class="modal-quiz__slider_slide-label">
					<input type="checkbox" name="warehouse" value="${warehouse.warehouse_id}" class="input-radio" id="select-warehouse-${warehouse.warehouse_id}">
					<label for="select-warehouse-${warehouse.warehouse_id}" class="label-radio"></label>
					<span>${warehouse.warehouse_address}</span>
				</label>`)
      });
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async sendForm(data) {
    try {
      this.loader.enable()
      const response = await api.post('/_receive_question_', data)

      if (response.status !== 200) return
      outputInfo(response.data)
      if (response.data.msg_type === 'success') {
        this.formLeaveRequest.reset()
        this.validatorLeaveRequest.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }
}

export default ModalQuiz