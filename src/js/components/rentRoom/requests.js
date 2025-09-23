<<<<<<< HEAD
import { apiWithAuth } from '../../settings/api.js'

import { outputInfo } from '../../utils/outputinfo.js'
import { getCookie } from '../../utils/cookie.js'

export async function sendFormAgreementInvoice(formData, loader) {
	try {
		loader.enable()
		const response = await apiWithAuth.post('/_form_new_agreement_', formData, {
			headers: {
				Authorization: getCookie('token'),
				'Content-Type': 'multipart/form-data',
			},
		})

		if (response.status !== 200) return
		outputInfo(response.data)
		if (response.data.msg_type !== 'success') return null

		return response.data
	} catch (error) {
		console.error(error)
	} finally {
		loader.disable()
	}
}

export async function sendFormNewAgreement(formData, loader) {
	try {
		loader.enable()
		const response = await apiWithAuth.post('/_form_new_agreement_', formData, {
			headers: {
				Authorization: getCookie('token'),
				'Content-Type': 'multipart/form-data',
			},
		})

		if (response.status !== 200) return
		outputInfo(response.data)

		if (response.data.msg_type === 'success') {
			location.href = location.origin + '/account'
		}
	} catch (error) {
		console.error(error)
	} finally {
		loader.disable()
	}
}
=======
import { apiWithAuth } from "../../settings/api.js";

import { outputInfo } from "../../utils/outputinfo.js"
import { getCookie } from "../../utils/cookie.js";

export async function sendFormAgreementInvoice(formData, loader) {
  try {
    loader.enable()
    const response = await apiWithAuth.post('/_form_new_agreement_', formData, {
      headers: {
        Authorization: getCookie('token'),
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.status !== 200) return
    outputInfo(response.data)
    if (response.data.msg_type !== 'success') return null

    return response.data
  } catch (error) {
    console.error(error)
  } finally {
    loader.disable()
  }
}

export async function sendFormNewAgreement(formData, loader) {
  try {
    loader.enable()
    const response = await apiWithAuth.post('/_form_new_agreement_', formData, {
      headers: {
        Authorization: getCookie('token'),
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.status !== 200) return
    outputInfo(response.data)

    if (response.data.msg_type === 'success') {
      document.location.pathname = '/account.html'
    }
  } catch (error) {
    console.error(error)
  } finally {
    loader.disable()
  }
}
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
