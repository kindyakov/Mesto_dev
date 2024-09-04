import CalculatorSlider from "./CalculatorSlider.js";

class CalculatorAreaSlider extends CalculatorSlider {
  constructor(range) {
    const replaceValue = ['1м³', '1.5м³', '2.2м³', '4.4м³', '5.5м³', '6.6м³', '7.7м³', '8.8м³', '9.9м³', '11м³', '12.1м³', '13.2м³', '14.3м³', '15.4м³', '16.5м³', '17.6м³', '18.7м³', '19.8м³', '20.9м³', '22м³']

    const options = {
      range: {
        'min': 1,
        'max': 11,
      },
      format: {
        to: value => {
          const integerPart = Math.floor(value);
          const decimalPart = value - integerPart;
          let val = '', i = 0

          if (value > 1 && value <= 2) {
            val = 1.5
          } else if (decimalPart === 0) {
            val = integerPart;
          } else if (decimalPart <= 0.5) {
            val = integerPart + 0.5;
          } else {
            val = Math.ceil(value);
          }

          i = (val < 2 ? val - 1 : val - 1.5) / 0.5

          return replaceValue[i]
        },
        from: value => parseFloat(value)
      },
      pips: {
        values: 11
      }
    }

    super(range, options)
    // console.log(this.slider.get('values'))
    this.imgPreviewRoom = document.querySelector('.img-preview-room')

    this.images = [
      `${this.app.pathPrefix}img/rooms/1_kub.png`,
      `${this.app.pathPrefix}img/rooms/1.5_kub.png`,
      `${this.app.pathPrefix}img/rooms/1_kv_m.png`,
      `${this.app.pathPrefix}img/rooms/2_kv_m.png`,
      `${this.app.pathPrefix}img/rooms/3_kv_m.png`,
      `${this.app.pathPrefix}img/rooms/4_kv_m.png`,
      `${this.app.pathPrefix}img/rooms/5_kv_m.png`,
      `${this.app.pathPrefix}img/rooms/6_kv_m.png`,
      `${this.app.pathPrefix}img/rooms/7_kv_m.png`,
      `${this.app.pathPrefix}img/rooms/8_kv_m.png`,
      `${this.app.pathPrefix}img/rooms/9_kv_m.png`,
      `${this.app.pathPrefix}img/rooms/9_kv_m.png`,
    ]

    this.loadImg(0)
  }

  onInit({ target }) {
    const elements = target.querySelectorAll('.noUi-value')
    const tooltip = target.querySelector('.noUi-tooltip')
    const values = ['1м³', '1.5м³', '2м²', '3м²', '4м²', '5м²', '6м²', '7м²', '8м²', '9м²', '10м²']

    tooltip.textContent = values[0]
    elements.length && elements.forEach((value, i) => {
      value.textContent = values[i]
    });
  }

  onChange({ unencoded }) {
    this.loadImg(parseInt(unencoded))
  }

  loadImg(i) {
    if (location.hostname !== "localhost") {
      const imgPathWebp = this.images[i].replace('.png', '.webp')
      const img = new Image()
      img.src = imgPathWebp
      img.onload = () => this.imgPreviewRoom.src = imgPathWebp;
      img.onerror = () => this.imgPreviewRoom.src = this.images[i]
    } else {
      this.imgPreviewRoom.src = this.images[i]
    }
  }
}

export default CalculatorAreaSlider