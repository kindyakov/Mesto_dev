import { declOfNum } from "../../../utils/declOfNum.js"

export class Watch {
  constructor(wrapper) {
    if (!wrapper) return
    this.watch = wrapper.querySelector('.watch')
    if (!this.watch) return

    this.countDays = this.watch.querySelectorAll('.count-days')
    this.countHours = this.watch.querySelectorAll('.count-hours')
    this.countMinutes = this.watch.querySelectorAll('.count-minutes')
    this.countSeconds = this.watch.querySelectorAll('.count-seconds')

    this.timeDays = this.watch.querySelector('.time-days')
    this.timeHours = this.watch.querySelector('.time-hours')
    this.timeMinutes = this.watch.querySelector('.time-minutes')
    this.timeSeconds = this.watch.querySelector('.time-seconds')

    this.newData = null
    this.interval = null
  }

  updateTime(count, countEl, timeEl, arr) {
    if (count < 10) {
      countEl[0].innerHTML = `<span>0<span>`
      countEl[1].innerHTML = `<span>${count}<span>`
    } else {
      let str = count.toString()
      countEl[0].innerHTML = `<span>${str[0]}<span>`
      countEl[1].innerHTML = `<span>${str[1]}<span>`
    }
    timeEl.textContent = declOfNum(count, arr)
  }

  timeCount() {
    let now = new Date()
    let leftUntil = this.newData - now

    let days = Math.floor(leftUntil / 1000 / 60 / 60 / 24)
    let hours = Math.floor(leftUntil / 1000 / 60 / 60) % 24
    let minutes = Math.floor(leftUntil / 1000 / 60) % 60
    let seconds = Math.floor(leftUntil / 1000) % 60

    this.updateTime(days, this.countDays, this.timeDays, ['день', 'дня', 'дней'])
    this.updateTime(hours, this.countHours, this.timeHours, ['час', 'часа', 'часов'])
    this.updateTime(minutes, this.countMinutes, this.timeMinutes, ['минута', 'минуты', 'минут'])
    this.updateTime(seconds, this.countSeconds, this.timeSeconds, ['секунда', 'секунды', 'секунд'])
  }

  init(time) {
    this.newData = new Date(time)
    this.timeCount()
    clearInterval(this.interval)
    this.interval = setInterval(() => this.timeCount(), 1000);
  }
}