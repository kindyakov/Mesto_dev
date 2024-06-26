import { formattingPrice } from "../../utils/formattingPrice.js"
import { outputInfo } from "../../utils/outputinfo.js";
import { validatesInputs } from "./validate.js";

function formatValueArray(arr) {
  return arr.map(value => parseFloat(value.replace(/\s/g, '').replace(/ /g, '')));
}

function formatNumberWithSpaces(number) {
  return Number(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export class Range {
  constructor(selector, options) {
    let defaultOptions = {
      onChange: () => { },
      onInit: () => { },
      selectorInput: ''
    }

    this.options = Object.assign(defaultOptions, options)
    this.ranges = document.querySelectorAll(selector)
    this.inputs = document.querySelectorAll(this.options.selectorInput)
    this.timerRange = null
    this.slidersFormat = {
      volume: {
        to: value => `${value.toFixed(0)}м<sup>3</sup>`,
        from: value => parseFloat(value)
      },
      duration: {
        to: value => `${value.toFixed(0)}м`,
        from: value => parseFloat(value)
      },
    }
    this.rangeStartData = {
      volume_start: 1, volume_end: 17, price_start: 1, price_end: 22000,
    }
    this.rangeData = { ...this.rangeStartData, volume_end: 16 }

    this.areaDifference = this.rangeStartData.volume_end - this.rangeData.volume_end

    this.rangeInputsValidate = {
      volume_start: input => validatesInputs.rangeCountArea(input, this.rangeStartData.volume_end - this.areaDifference),
      volume_end: input => validatesInputs.rangeCountArea(input, this.rangeStartData.volume_end - this.areaDifference),
      price_start: input => validatesInputs.rangeCount(input, this.rangeStartData.price_end),
      price_end: input => validatesInputs.rangeCount(input, this.rangeStartData.price_end),
    }

    this.init()
  }

  init() {
    if (!this.ranges.length) return console.error('range нет')

    this.sliders = {}

    this.ranges.forEach(range => {
      const nameRange = range.getAttribute('data-type-range')

      const slider = noUiSlider.create(range, {
        start: [this.rangeStartData[`${nameRange}_start`], this.rangeStartData[`${nameRange}_end`]],
        connect: true,
        step: nameRange === 'volume' ? 1 : 1, // +range.dataset.step,
        range: {
          'min': this.rangeStartData[`${nameRange}_start`],
          'max': this.rangeStartData[`${nameRange}_end`],
        },
        // tooltips: range.dataset.tooltips === '' ? true : false,
        margin: 1,
        pips: {
          mode: 'count', // nameRange === 'volume' ? 'values' : 'count', 
          values: nameRange === 'volume' ? this.rangeStartData[`${nameRange}_end`] : 2,
          density: 100,
          stepped: true
        }
      })

      if (nameRange === 'volume') {
        const values = range.querySelectorAll('.noUi-value')

        values.length && values.forEach((value, i) => {
          if (i === 0) {
            value.innerHTML = '1<span>м³</span>'
          } else if (i === 1) {
            value.innerHTML = '1.5<span>м³</span>'
          } else {
            value.innerHTML = (+value.textContent - this.areaDifference) + '<span>м³</span>'
          }

          if (values.length - 1 === i) {
            value.classList.add('_last')
            value.innerHTML = value.innerHTML + '+'
          }
        })
      } else if (nameRange === 'price') {
        const values = range.querySelectorAll('.noUi-value')

        values.length && values.forEach((value, i) => {
          value.textContent = formatNumberWithSpaces(value.textContent)

          if (values.length - 1 === i) {
            value.classList.add('_last')
            value.innerHTML = value.innerHTML + '+'
          }
        })
      }

      this.sliders[nameRange] = slider
      this.createHtmlTooltip(range)
    });

    for (let key in this.sliders) {
      if (this.sliders.hasOwnProperty(key)) {
        this.sliders[key].on('slide', (values, handle, unencoded, tap, positions, noUiSlider) =>
          this.rangeSlide({ values, handle, unencoded, tap, positions, noUiSlider }));

        this.sliders[key].on('change', (values, handle, unencoded) => this.rangeChange(values, handle, unencoded))
      }
    }

    this.handleInput()
    this.options.onInit(this.sliders)
  }

  rangeSlide({ values, handle, unencoded, noUiSlider }) {
    const typeRange = noUiSlider.target.getAttribute('data-type-range')
    const inputs = document.querySelectorAll(`${this.options.selectorInput}[data-type-range="${typeRange}"]`)
    const label = inputs[handle].closest('label')
    const value = Number(unencoded[handle].toFixed(0))
    const valueType = inputs[handle].parentElement.querySelector('.type')
    const keyVolume = handle ? 'volume_end' : 'volume_start'

    label.style.borderColor = '#000'
    inputs[handle].classList.add('_focus')

    if (typeRange === 'volume') {
      if (value === 1 || value == 2) {
        const volumeValue = value == 2 ? 1.5 : 1

        this.rangeData[inputs[handle].name] = volumeValue
        inputs[handle].value = volumeValue
        valueType.textContent = 'м³'
      } else {
        this.rangeData[inputs[handle].name] = value - this.areaDifference
        inputs[handle].value = value - this.areaDifference
        valueType.textContent = 'м³'
      }
    } else if (typeRange === 'price') {
      inputs[handle].value = formatNumberWithSpaces(value)
      this.rangeData[inputs[handle].name] = value
    } else {
      this.rangeData[inputs[handle].name] = value
      inputs[handle].value = value
    }
    clearTimeout(this.timerRange)
    this.timerRange = setTimeout(() => {
      inputs[handle].classList.remove('_focus')
    }, 500)
  }

  rangeChange(values, handle, unencoded) {
    if (this.rangeData.volume_end === 16) {
      this.rangeData.volume_end = 100
    }

    if (this.rangeData.price_end === this.rangeStartData.price_end) {
      this.rangeData.price_end = 100000
    }

    this.options.onChange(this.rangeData, values, handle, unencoded)
  }

  handleInput() {
    this.inputs.length && this.inputs.forEach(input => {
      input.addEventListener('input', () => {
        const label = input.closest('label')
        const typeRange = input.getAttribute('data-type-range')
        const typeValue = input.name.split('_').at(-1)
        const index = typeValue === 'start' ? 0 : 1
        const slider = this.sliders[typeRange]
        let arr = formatValueArray(slider.get())

        this.rangeInputsValidate[input.name](input)
        this.rangeData[input.name] = Number(input.value)

        clearTimeout(this.timerRange)
        this.timerRange = setTimeout(() => {
          const [inputAnother] = Array.from(this.inputs).filter(_input => typeRange === _input.getAttribute('data-type-range') && _input !== input)

          if (typeValue === 'start') {
            if (+input.value >= +inputAnother.value.replace(/\s/g, "")) {
              label.style.borderColor = 'red'
              outputInfo({ msg: 'Начальное значение не может быть больше или равно конечному', msg_type: 'warning' })
              return
            }
          } else {
            if (+input.value <= +inputAnother.value.replace(/\s/g, "")) {
              label.style.borderColor = 'red'
              outputInfo({ msg: 'Конечное значение не может быть меньше или равно начальному', msg_type: 'warning' })
              return
            }
          }

          label.style.borderColor = '#000'

          if (typeRange === 'volume') {
            if (+input.value === 1) {
              arr[index] = 1
            } else if (+input.value === 1.5) {
              arr[index] = 2
            } else {
              arr[index] = +input.value + this.areaDifference
            }
          } else {
            arr[index] = +input.value
          }

          slider.set(arr)
          this.rangeChange()
        }, 500)
      })
    })
  }

  updateInputValue(nameRange, values) {
    const inputs = document.querySelectorAll(`${this.options.selectorInput}[data-type-range="${nameRange}"]`)

    if (!values[0]) {
      values[0] = this.rangeStartData.volume_start
    }

    if (!values[1]) {
      values[1] = this.rangeData.volume_end
    }

    const [firstValue, lastValue] = values

    inputs.length && inputs.forEach((input, i) => {
      const valueType = input.parentElement.querySelector('.type')
      const value = Number((+values[i]).toFixed(0))

      if (nameRange === 'volume') {
        if (+firstValue == 1 && +lastValue == 1.5 || +lastValue == 1.5) {
          input.value = value == 1 ? 1 : 1.5
          valueType.textContent = 'м³'
        } else {
          input.value = value ? value : ''
          valueType.textContent = 'м³'
        }
      } else {
        input.value = value ? value : ''
      }
    })
  }

  createHtmlTooltip(slider) {
    const noUiHandle = slider.querySelectorAll('.noUi-handle');
    if (noUiHandle && noUiHandle.length) {
      noUiHandle.forEach(el => {
        el.insertAdjacentHTML('beforeend', `
      <div class="range-tooltip">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon">
          <circle cx="14" cy="14" r="12" fill="#F5F5F5" />
          <path d="M14 28C21.7 28 28 21.7 28 14C28 6.3 21.7 0 14 0C6.3 0 0 6.3 0 14C0 21.7 6.3 28 14 28ZM14 25.2C9.66 25.2 5.74 22.68 3.92 18.9L10.64 16.52C11.48 17.64 12.74 18.2 14 18.2C15.26 18.2 16.52 17.64 17.22 16.66L24.08 18.9C22.26 22.68 18.34 25.2 14 25.2ZM15.4 2.94C20.86 3.64 25.2 8.4 25.2 14C25.2 14.84 25.06 15.54 24.92 16.38L18.2 14C18.2 12.18 17.08 10.64 15.4 10.08L15.4 2.94ZM14 12.6C14.84 12.6 15.4 13.16 15.4 14C15.4 14.84 14.84 15.4 14 15.4C13.16 15.4 12.6 14.84 12.6 14C12.6 13.16 13.16 12.6 14 12.6ZM12.6 2.94L12.6 10.08C10.92 10.64 9.8 12.18 9.8 14L3.08 16.38C2.94 15.54 2.8 14.84 2.8 14C2.8 8.26 7.14 3.64 12.6 2.94Z" fill="#2D3A3D" />
        </svg>
      </div>`)
      })
    }
  }

  setSlider(nameRange, values) {
    if (nameRange === 'volume') {
      let [firstValue, lastValue] = values
      let isFirstValue = true

      if (!firstValue) {
        isFirstValue = false
        firstValue = this.rangeStartData.volume_start
      }

      if (!lastValue) {
        lastValue = this.rangeData.volume_end
      }

      if (+firstValue == 1 && +lastValue == 1.5) {
        this.sliders[nameRange].set([1, 2])

        this.rangeData.volume_start = +firstValue
        this.rangeData.volume_end = +lastValue
      } else {
        this.sliders[nameRange].set([isFirstValue ? +firstValue + this.areaDifference : +firstValue, +lastValue + this.areaDifference])

        this.rangeData.volume_start = +firstValue
        this.rangeData.volume_end = +lastValue
      }
    } else {
      this.sliders[nameRange].set(values)
    }
  }
}