import { Tabs } from "../../modules/myTabs.js"
import { Modal } from '../../modules/myModal.js'

const rentOut = () => {
  const rentOut = document.querySelector('.rent-out')
  if (!rentOut) return
  const rentOutTabs = new Tabs('tabs-rent-out',)
  const modalStorageSeasonalItems = new Modal('.modal-storage-seasonal-items', {
    modalBtnActive: '.btn-storage-seasonal-items'
  })
}

export default rentOut