import { modalOpening } from "./modals/modalOpening.js"
import { isTimeInRange } from "../utils/isTimeInRange.js"

export function plug() {
  if (isTimeInRange()) {
    const linkRentStorageRoom = document.querySelectorAll('.link-rent-storage-room')
    linkRentStorageRoom.length && linkRentStorageRoom.forEach(link => {
      link.classList.remove('btn-arrange-guest-visit', 'btn-rent-room')
    })

    document.addEventListener('click', e => {
      if (e.target.closest('.link-rent-storage-room')) {
        e.preventDefault()
        const link = e.target.closest('.link-rent-storage-room')
        link.classList.remove('btn-arrange-guest-visit', 'btn-rent-room')
        modalOpening.open()
      }
    })
  }
}
