import merge from 'lodash.merge'

const defaultOptions = {
  start: 1,
  connect: true,
  range: {
    'min': 1,
    'max': 10,
  },
  tooltips: true,
  format: {
    to: value => value,
    from: value => value
  },
  animate: true,
  animationDuration: 300,
  pips: {
    mode: 'count',
    values: 10,
    density: 10,
    stepped: true
  }
}

class BaseSlider {
  constructor(range, options = {}) {
    if (!range) return
    this.app = window.app
    this.options = merge({}, defaultOptions, options)
    this.slider = noUiSlider.create(range, this.options)
    
    this.slider.on('slide', (values, handle, unencoded, tap, positions, noUiSlider) => {
      this.slide({ values, handle, unencoded, tap, positions, noUiSlider })
    });
    this.slider.on('change', (values, handle, unencoded, tap, positions, noUiSlider) => {
      this.change({ values, handle, unencoded, tap, positions, noUiSlider })
    })

    this.onInit(this.slider)
  }

  onChange() { }

  onSlide() { }

  onInit() { }

  getValue() {
    return this.slider.get('value')
  }

  slide(params) {
    const { values, handle, unencoded, noUiSlider } = params

    this.onSlide(params)
  }

  change(params) {
    const { values, handle, unencoded, tap, positions, noUiSlider } = params

    this.onChange(params)
  }
}

export default BaseSlider