import CalculatorSlider from "./CalculatorSlider.js";

class CalculatorMonthSlider extends CalculatorSlider {
  constructor(range) {
    const options = {
      start: 11,
      range: {
        'min': 1,
        'max': 12,
      },
      format: {
        to: value => parseInt(value) + 'м',
      },
      pips: {
        values: 12
      }
    }

    super(range, options)


    this.updateSliderDisplay({ unencoded: [this.getValue()], handle: 0, noUiSlider: this.slider })
  }

  onInit({ target }) {
    const elements = target.querySelectorAll('.noUi-value')

    elements.length && elements.forEach((value, i) => {
      if (value.textContent == 6 || value.textContent == 11) {
        value.classList.add('_discount')
      }
    });
  }
}

export default CalculatorMonthSlider