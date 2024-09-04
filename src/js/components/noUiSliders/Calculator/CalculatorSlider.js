import BaseSlider from "../BaseSlider.js"

class CalculatorSlider extends BaseSlider {
  constructor(range, options = {}) {
    super(range, options)

    this.createHtmlTooltip(this.slider)
  }

  slide(params) {
    const { values, handle, unencoded, noUiSlider } = params
    this.updateSliderDisplay(params);
    this.onSlide(params)
  }

  change(params) {
    const { values, handle, unencoded, tap, positions, noUiSlider } = params

    this.updateSliderDisplay(params, true)
    this.onChange(params)
  }

  updateSliderDisplay(params, withTransition = false) {
    const { unencoded, handle, noUiSlider } = params;

    const carving = noUiSlider.target.querySelector('.carving');
    let rangeTooltipImg = noUiSlider.target.querySelector('.range-tooltip_img');

    let currentValue = unencoded[handle];
    let maxValue = noUiSlider.options.range.max;
    let currentValuePercent = currentValue / maxValue;

    let width = 100 * (currentValue - 1) / (maxValue - 1);
    let maxTurns = 6; // Количество оборотов при 100%
    let degreesPerTurn = 360; // Количество градусов в одном обороте
    let totalTurns = currentValuePercent * maxTurns; // Вычисляем количество оборотов
    let totalDegrees = totalTurns * degreesPerTurn; // Вычисляем количество градусов для вращения

    carving.style.width = `${width}%`;
    rangeTooltipImg.style.transform = `translate(-50%, 0) rotate(${totalDegrees}deg)`;

    if (withTransition) {
      carving.style.transition = '0.3s';
      rangeTooltipImg.style.transition = '0.3s';

      setTimeout(() => {
        rangeTooltipImg.style.transition = 'none';
        carving.style.transition = '0s';
      }, 300);
    }
  }

  createHtmlTooltip({ target }) {
    const noUiHandle = target.querySelector('.noUi-handle');
    const noUiConnects = target.querySelector('.noUi-connects')

    if (noUiHandle) {
      noUiHandle.insertAdjacentHTML('beforeend', `<div class="range-tooltip">
        <span></span>
        <img src="${this.app.pathPrefix}img/svg/range-icon.svg" class="range-tooltip_img" alt="Иконка"/>
        <img src="${this.app.pathPrefix}img/svg/range-icon-2.png" class="range-tooltip_img-bg" alt="Иконка"/>
      </div>`)
    }

    if (noUiConnects) {
      noUiConnects.insertAdjacentHTML('beforeend', `<span class="carving"><span>`)
    }
  }

  calcDiscount(month, dataPrice) {
    if (!month || !dataPrice) return 0
    if (month >= 6 && month <= 10) {
      return dataPrice['6']
    } else if (month > 10) {
      return dataPrice['11']
    } else return dataPrice['1']
  }
}

export default CalculatorSlider