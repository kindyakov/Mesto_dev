import api, { apiWithAuth } from "./api.js";
import { getCookie } from "../utils/cookie.js";
import { outputInfo } from "../utils/outputinfo.js";
import { getFormattedDate } from "../utils/getFormattedDate.js";

export async function getWarehousesInfo() {
  try {
    const response = await api.get('/_get_warehouses_info_')

    if (!response.data) return null
    return response.data;
  } catch (error) {
    console.error('Ошибка:', error);
    throw error
  }
}

export async function payBeforeAgreement(formData, loader) {
  try {
    loader.enable()
    const response = await apiWithAuth.post('/_pay_before_agreement_', formData, {
      headers: {
        Authorization: getCookie('token'),
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.status !== 200) return
    if (response.data.msg_type === 'success') {
      location.href = response.data.payment_url
    } else {
      outputInfo(response.data)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loader.disable()
  }
}

export async function payAfterAgreement(formData, loader) {
  try {
    loader.enable()
    const response = await apiWithAuth.post('/_pay_after_agreement_', formData, {
      headers: {
        Authorization: getCookie('token'),
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.status !== 200) return

    if (response.data.msg_type === 'success') {
      if (response.data.payment_url) {
        location.href = response.data.payment_url
      } else if (response.data.bill_id) {
        downloadBill(response.data.bill_id, loader)
        outputInfo(response.data)
      }
    } else {
      outputInfo(response.data)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loader.disable()
  }
}

export const replaceRoomForClient = async (data, loader) => {
  try {
    loader.enable();
    const response = await apiWithAuth.post('/_replace_room_for_client_', data)
    if (response.status !== 200) return null
    outputInfo(response.data)
    if (response.data.msg_type === 'success') {
      if (response.data.payment_url) {
        location.href = response.data.payment_url
      } else if (response.data.bill_id) {
        downloadBill(response.data.bill_id, loader)
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    loader.disable()
  }
}

export async function downloadBill(bill_id, loader, redirect = '') {
  try {
    loader.enable()

    const response = await apiWithAuth.get(`/_download_bill_/${bill_id}`, { responseType: 'blob' })

    if (response.status !== 200) return

    if (response.data.msg_type) {
      outputInfo(response.data)
    } else {
      const blob = new Blob([response.data], { type: response.headers['content-type'] })

      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url;
      link.download = `МЕСТО. Счет №${bill_id} от ${getFormattedDate()}.xlsx`
      link.click()
      URL.revokeObjectURL(url)

      if (redirect) {
        location.href = location.origin + redirect
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    loader.disable()
  }
}