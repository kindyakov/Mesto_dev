import anime from 'animejs/lib/anime.es.js';

class RouteScheme {
  constructor() {
    this.stroke = '#004d56'
    this.strokeWidth = 2
    this.roadCenter = 8.67245
  }

  drawing(cells) {
    if (!cells?.length) return

    cells.forEach(cell => {
      let rect = cell.querySelector('rect')
      let rectX = +rect.getAttribute('x')
      let rectY = +rect.getAttribute('y')
      let rectH = +rect.getAttribute('height')
      let rectW = +rect.getAttribute('width')
      this.renderingPath(cell, { rectX, rectY, rectW, rectH })
    });
  }

  renderingPath(cell, { rectX, rectY, rectW, rectH }) {
    return
    if (cell.classList.contains('_path')) return
    cell.classList.add('_path')

    const scheme = cell.closest('.scheme')
    const entrance = scheme.querySelector('.entrance')

    // const sector = cell.closest('.sector')
    // const sectorNum = +sector.getAttribute('data-sector')

    // const group = cell.closest('.group')
    const groupLocation = cell.getAttribute('data-location-entrance')
    const cellLocation = cell.getAttribute('data-type-location')

    let entranceX = +entrance?.getAttribute('x') || 1100
    let entranceY = +entrance?.getAttribute('y') || 0
    let entranceW = 41

    const path = this.createPath(cell)
    const d = this.getPathD(groupLocation, cellLocation, { entranceX, entranceY, entranceW, rectX, rectY, rectW, rectH })
    console.log(path, d)

    path.setAttributeNS(null, "d", d)

    let animation = anime({
      targets: path,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine',
      duration: 700,
    });

    scheme.appendChild(path);
  }

  getPathD(groupLocation, cellLocation, { entranceX, entranceY, entranceW, rectX, rectY, rectW, rectH }) {
    switch (groupLocation) {
      case 'up':
        return `M ${entranceX + entranceW} ${entranceY} L ${entranceX + entranceW} ${rectY - this.roadCenter} L ${rectX + rectW / 2} ${rectY - this.roadCenter} L ${rectX + rectW / 2} ${rectY}`
      case 'down':
        return `M ${entranceX + entranceW} ${entranceY} L ${entranceX + entranceW} ${rectY + rectH + this.roadCenter} L ${rectX + rectW / 2} ${rectY + rectH + this.roadCenter} L ${rectX + rectW / 2} ${rectY + rectH}`
      case 'left':
        return `M ${entranceX + entranceW} ${entranceY} L ${entranceX + entranceW} -${this.roadCenter} L ${rectX - this.roadCenter} -${this.roadCenter} L ${rectX - this.roadCenter} ${rectY + rectH / 2} L ${rectX} ${rectY + rectH / 2}`
      case 'right':
        if (cellLocation == 'side-right') {
          return `M ${entranceX + entranceW} ${entranceY} L ${entranceX + entranceW} ${rectY + rectH / 2} L ${rectX + rectW} ${rectY + rectH / 2}`
        } else if (cellLocation == 'side-left') {
          return `M ${entranceX + entranceW} ${entranceY} L ${entranceX + entranceW} -${this.roadCenter} L ${rectX + rectW + this.roadCenter} -${this.roadCenter} L ${rectX + rectW + this.roadCenter} ${rectY + rectH / 2} L ${rectX + rectW} ${rectY + rectH / 2}`
        }
        break;
    }
  }

  createPath(cell) {
    const cellNum = cell.getAttribute('data-cell-num')
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttributeNS(null, "stroke", this.stroke);
    path.setAttributeNS(null, "stroke-width", this.strokeWidth);
    path.setAttributeNS(null, "fill", "none");
    path.setAttributeNS(null, "data-cell-num", cellNum);
    return path;
  }

  deletePath(cell) {
    const cellNum = cell.getAttribute('data-cell-num')
    const scheme = cell.closest('.scheme')
    const paths = scheme.querySelectorAll(`path[data-cell-num="${cellNum}"]`)
    cell.classList.remove('_path')

    if (paths.length) {
      anime({
        targets: paths,
        opacity: [1, 0],
        duration: 300, // продолжительность анимации в миллисекундах
        easing: 'linear',
        complete: () => {
          paths.forEach(path => path.remove())
        }
      })
    }
  }

  clear(scheme) {
    const paths = scheme.querySelectorAll('path')
    const cells = scheme.querySelectorAll('.warehouse__svg-cell')
    paths.length && paths.forEach(path => path.remove())
    cells.length && cells.forEach(cell => cell.classList.remove('_path'))
  }
}

export default RouteScheme