// Добавить аккордиону класс _my-accordion
// Добавить кнопке для раскритие аккордиона класс _my-accordion-control
// Добавить контенту аккордиона класс _my-accordion-content

export class Accordion {
  constructor(selector, options) {
    let defaultOptions = {
      onOpen: () => { },
      onEvent: () => { },
      onClose: () => { },
      onInit: () => { },
      isAccordion: true,
      initMaxWidth: 0,
      maxHeight: null,
      accordSelector: '._my-accordion',
      btnSelector: '._my-accordion-control',
      contentSelector: '._my-accordion-content',
      anim: height => [{ maxHeight: 0 }, { maxHeight: height + 'px' }],
      duration: 500,
      easing: 'ease-in-out',
    }

    this.selectorWrapper = selector

    this.options = Object.assign(defaultOptions, options)
    this.accordWrapper = document.querySelector(selector)
    this.isAnim = false

    if (this.accordWrapper) {
      this.accords = this.accordWrapper.querySelectorAll(this.options.accordSelector)
      this.accordBtns = this.accordWrapper.querySelectorAll(this.options.btnSelector)
      this.accordContents = this.accordWrapper.querySelectorAll(this.options.contentSelector)
    } else {
      return
    }

    const isSuccess = this.check()

    if (isSuccess) {
      this.init()
      this.events()
    }
  }

  check() {
    this.accords.forEach(el => {
      const control = document.querySelector(this.options.btnSelector)
      const content = document.querySelector(this.options.contentSelector)

      if (!control) {
        console.log(el, `Здесь ${el} не найден ${this.options.btnSelector}`)
        return false
      }

      if (!content) {
        console.log(el, `Здесь ${el} не найден ${this.options.contentSelector}`)
        return false
      }
    })

    return true
  }

  init() {
    if (!this.accordWrapper) {
      this.accordWrapper = document.querySelector(this.selectorWrapper)

      this.events()
    }

    this.accords = this.accordWrapper.querySelectorAll(this.options.accordSelector)
    this.accordBtns = this.accordWrapper.querySelectorAll(this.options.btnSelector)
    this.accordContents = this.accordWrapper.querySelectorAll(this.options.contentSelector)

    this.accords.forEach(el => el.classList.remove('_open'))
    // this.accordBtns.forEach(el => el.classList.remove('_open'))
    // this.accordContents.forEach(el => el.classList.remove('_open'))
    this.options.onInit()
  }

  events() {
    this.accordWrapper.addEventListener('click', e => {
      if (e.target.closest(this.options.btnSelector) && !this.isAnim) {
        const accordionTarget = e.target.closest(this.options.accordSelector)
        const accordionControl = accordionTarget.querySelector(this.options.btnSelector)
        const accordionContent = accordionTarget.querySelector(this.options.contentSelector)

        if (this.options.initMaxWidth && !window.matchMedia(`(max-width: ${this.options.initMaxWidth}px)`).matches) return

        if (!accordionTarget.classList.contains('_open')) {
          this.open(accordionTarget, accordionContent)
        } else {
          this.close()
        }
      }
      this.options.onEvent(e)
    })

    window.addEventListener('resize', () => {
      let windowWidth = window.innerWidth;

      if (this.options.initMaxWidth && this.options.initMaxWidth > windowWidth) {
        this.accords.forEach(el => el.classList.remove('_open'))
      }
    })
  }

  open(accordionTarget, accordionContent) {
    this.options.isAccordion && this.close()
    const accordionsInner = accordionTarget.querySelectorAll('._my-accordion')
    let addHeight = 0, timer

    accordionsInner.length && accordionsInner.forEach(accordion => {
      addHeight += accordion.scrollHeight
    })

    const contentHeight = this.options.maxHeight ? this.options.maxHeight : accordionContent.scrollHeight
    this.isAnim = true

    accordionTarget.classList.add('_open')
    const animation = accordionContent?.animate(
      this.options.anim(contentHeight),
      {
        duration: this.options.duration,
        easing: this.options.easing,
        fill: 'forwards'
      }
    );

    animation?.addEventListener('finish', () => {
      accordionContent.style.maxHeight = (+contentHeight + +addHeight) + 'px';
      this.isAnim = false
      setTimeout(() => {
        animation.effect.updateTiming({ fill: 'none' });
      })
    });

    this.options.onOpen(accordionTarget, accordionContent)
  }

  close() {
    // this.accords.forEach(el => el.classList.remove('_open'))
    this.accordBtns.forEach(el => el.classList.remove('_open'))
    this.accordContents.forEach(el => {
      const currentAccord = el.closest(this.options.accordSelector)
      if (currentAccord.classList.contains('_open') && !currentAccord.classList.contains('_not-close')) {
        currentAccord.classList.remove('_open')
        this.isAnim = true

        const contentHeight = this.options.maxHeight ? this.options.maxHeight : el.scrollHeight

        const animation = el.animate(
          this.options.anim(contentHeight),
          {
            duration: this.options.duration,
            easing: this.options.easing,
            direction: 'reverse',
            fill: 'forwards'
          }
        )

        animation.addEventListener('finish', () => {
          el.style.maxHeight = null
          this.isAnim = false
          setTimeout(() => {
            animation.effect.updateTiming({ fill: 'none' });
          })
        })
      }
    })
    this.options.onClose()
  }

  disableScroll() {
    // const pagePos = window.scrollY
    this.lockPadding()
    document.body.classList.add('_lock')
    // document.body.dataset.position = pagePos
    // document.body.style.top = pagePos + 'px'
  }

  enableScroll() {
    // const pagePos = parseInt(document.body.dataset.position, 10)
    this.unlockPadding()
    document.body.style.top = 'auto'
    document.body.classList.remove('_lock')
    // window.scroll({ top: pagePos, left: 0 })
    document.body.removeAttribute('data-position')
  }

  lockPadding() {
    const paddingOffset = window.innerWidth - document.body.offsetWidth + 'px'
    document.querySelector('.wrapper').style.paddingRight = paddingOffset
  }

  unlockPadding() {
    document.querySelector('.wrapper').style.paddingRight = 0
  }
}