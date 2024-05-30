function replaceValue(value) {
  if (value == 1) {
    return 1
  } else if (value == 2) {
    return 1.5
  } else if (value == 3) {
    return 3
  } else if (value == 4) {
    return 4
  } else if (value == 5) {
    return 6
  } else if (value == 6) {
    return 8
  } else if (value == 7) {
    return 10
  } else if (value == 8) {
    return 12
  } else if (value == 9) {
    return 14
  } else if (value == 10) {
    return 16
  } else if (value == 11) {
    return 20
  }
}

export class Range {
  constructor(selector, options) {
    let defaultOptions = {
      onChange: () => { },
      onSlide: () => { },
      onInit: () => { },
    }

    this.options = Object.assign(defaultOptions, options)
    this.ranges = document.querySelectorAll(selector)

    this.rangeStartData = {
      area_start: 1, area_end: 11, duration_start: 1, duration_end: 12,
    }
    this.areaDifference = this.rangeStartData.area_end - 9
    this.rangeData = { volume: 1, duration: this.rangeStartData.duration_start }

    this.slidersFormat = {
      area: {
        to: values => {
          const value = values.toFixed(0)
          // if (value <= 2) {
          //   const volumeValue = value == 2 ? 1.5 : 1
          //   return `${volumeValue}м³`
          // }
          return `${replaceValue(value)}м³`
        },
        from: value => parseFloat(value)
      },
      duration: {
        to: value => `${value.toFixed(0)}м`,
        from: value => parseFloat(value)
      },
    }

    this.init()
  }

  init() {
    if (!this.ranges.length) return console.error('range нет')

    this.sliders = {}

    this.ranges.forEach(range => {
      const nameRange = range.getAttribute('data-type-range')

      const slider = noUiSlider.create(range, {
        start: this.rangeStartData[`${nameRange}_start`],
        connect: range.dataset.connect === 'true' ? true : range.dataset.connect,
        // step: +range.dataset.step,
        range: {
          'min': this.rangeStartData[`${nameRange}_start`],
          'max': this.rangeStartData[`${nameRange}_end`],
        },
        tooltips: range.dataset.tooltips === '' ? true : false,
        format: this.slidersFormat[nameRange],
        animate: true,
        animationDuration: 300, // время анимации в миллисекундах
        pips: {
          mode: 'count',
          values: nameRange === 'area' ? this.rangeStartData.area_end : this.rangeStartData.duration_end,
          density: 10,
          stepped: true
        }
      })
      const noUiBase = slider.target.querySelector('.noUi-base')

      if (nameRange === 'area') {
        const values = range.querySelectorAll('.noUi-value')
        const tooltip = range.querySelector('.noUi-tooltip')

        tooltip.innerHTML = '1м³'

        values.length && values.forEach((value, i) => {
          if (i === 0) {
            value.innerHTML = '1м³'
          } else if (i === 1) {
            value.innerHTML = '1.5м³'
          } else if (i === 2) {
            value.innerHTML = '3м³'
          } else if (i === 3) {
            value.innerHTML = '4м³'
          } else if (i === 4) {
            value.innerHTML = '6м³'
          } else if (i === 5) {
            value.innerHTML = '8м³'
          } else if (i === 6) {
            value.innerHTML = '10м³'
          } else if (i === 7) {
            value.innerHTML = '12м³'
          } else if (i === 8) {
            value.innerHTML = '14м³'
          } else if (i === 9) {
            value.innerHTML = '16м³'
          } else if (i === 10) {
            value.innerHTML = '20м³'
          } else {
            value.innerHTML = (+value.textContent - this.areaDifference) + 'м³'
          }
        })
      } else if (nameRange === 'duration') {
        const values = range.querySelectorAll('.noUi-value')

        values.length && values.forEach((value, i) => {
          const month = i + 1
          value.innerHTML = month
          value.setAttribute('data-value', month)
          if (month === 6 || month === 11) {
            value.classList.add('_discount')
          }
        })
      }

      // noUiBase.addEventListener('click', this.handleClickNoUiBase)

      this.sliders[nameRange] = slider
      this.createHtmlTooltip(range)
    });

    for (let key in this.sliders) {
      if (this.sliders.hasOwnProperty(key)) {
        this.sliders[key].on('slide', (values, handle, unencoded, tap, positions, noUiSlider) =>
          this.rangeSlide({ values, handle, unencoded, tap, positions, noUiSlider }));

        this.sliders[key].on('change', (values, handle, unencoded, tap, positions, noUiSlider) =>
          this.rangeChange({ values, handle, unencoded, tap, positions, noUiSlider }))
      }
    }

    this.options.onInit(this.sliders)
  }

  rangeSlide({ values, handle, unencoded, noUiSlider }) {
    const typeRange = noUiSlider.target.getAttribute('data-type-range')
    const value = unencoded[0].toFixed(0)
    // const key = value == 1 || value == 2 ? 'volume' : 'area'
    const key = 'volume'

    const carving = noUiSlider.target.querySelector('.carving')

    let connectElement = noUiSlider.target.querySelector('.noUi-connect');
    let rangeTooltipImg = noUiSlider.target.querySelector('.range-tooltip_img')

    // Получаем текущее значение слайдера и максимальное значение слайдера
    let currentValue = unencoded[handle];
    let maxValue = noUiSlider.options.range.max;

    let currentValuePercent = currentValue / maxValue;

    let width = 100 * (currentValue - 1) / (maxValue - 1)

    let maxTurns = 6; // Количество оборотов при 100%
    let degreesPerTurn = 360; // Количество градусов в одном обороте

    // Вычисляем количество оборотов
    let totalTurns = currentValuePercent * maxTurns;
    // Вычисляем количество градусов для вращения
    let totalDegrees = totalTurns * degreesPerTurn;

    carving.style.width = `${width}%`
    rangeTooltipImg.style.transform = `translate(-50%, 0) rotate(${totalDegrees}deg)`

    if (typeRange === 'area') {
      // if (value == 1 || value == 2) {
      //   const volumeValue = value == 2 ? 1.5 : 1
      //   this.rangeData[key] = volumeValue
      // delete this.rangeData['area']
      // } else {
      this.rangeData[key] = replaceValue(value)
      // delete this.rangeData['volume']
      // }
    } else {
      this.rangeData[typeRange] = Number(value)
    }

    this.options.onSlide(this.rangeData, noUiSlider)
  }

  rangeChange({ values, handle, unencoded, tap, positions, noUiSlider }) {
    let rangeTooltipImg = noUiSlider.target.querySelector('.range-tooltip_img')
    const carving = noUiSlider.target.querySelector('.carving')

    let currentValue = unencoded[handle];
    let maxValue = noUiSlider.options.range.max;

    let width = 100 * (currentValue - 1) / (maxValue - 1)

    carving.style.width = `${width}%`
    carving.style.transition = '0.3s'

    let currentValuePercent = currentValue / maxValue;

    let maxTurns = 6 // Количество оборотов при 100%
    let degreesPerTurn = 360; // Количество градусов в одном обороте
    // Вычисляем количество оборотов
    let totalTurns = currentValuePercent * maxTurns;
    // Вычисляем количество градусов для вращения
    let totalDegrees = totalTurns * degreesPerTurn;

    rangeTooltipImg.style.transition = '0.3s'
    rangeTooltipImg.style.transform = `translate(-50%, 0) rotate(${totalDegrees}deg)`

    setTimeout(() => {
      rangeTooltipImg.style.transition = 'none'
      carving.style.transition = '0s'
    }, 300)

    this.options.onChange(unencoded, this.rangeData)
  }

  createHtmlTooltip(slider) {
    const noUiHandle = slider.querySelector('.noUi-handle');
    const noUiConnects = slider.querySelector('.noUi-connects')

    if (noUiHandle) {
      noUiHandle.insertAdjacentHTML('beforeend', `<div class="range-tooltip">
        <span></span>
        <img src="${this.options.pathPrefix}img/svg/range-icon.svg" class="range-tooltip_img" alt="Иконка"/>
        <img src="${this.options.pathPrefix}img/svg/range-icon-2.png" class="range-tooltip_img-bg" alt="Иконка"/>
      </div>`)
    }

    if (noUiConnects) {
      noUiConnects.insertAdjacentHTML('beforeend', `<span class="carving"><span>`)
    }
  }

  handleClickNoUiBase(e) {

  }
}