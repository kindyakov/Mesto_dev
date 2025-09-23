<<<<<<< HEAD
import api, { apiWithAuth } from '../../settings/api.js'
// import { outputInfo } from '../../utils/outputinfo.js'

export const getClientTotalData = async () => {
	try {
		const response = await apiWithAuth.get(`/_get_client_total_for_client_`)
		if (response.status == 200) {
			return response.data
		} else {
			return null
		}
	} catch (error) {
		console.error('Ошибка при получение данных о пользователе:', error)
	}
}

export const getAgreement = async (queryParams = '') => {
	try {
		const response = await api.get(`/_update_floor_for_client_${queryParams}`)
		if (response.status == 200) {
			return response.data
		} else {
			return null
		}
	} catch (error) {
		console.error('Ошибка при получение данных о договорах:', error)
	}
}

export const getRoomsWarehouse = async (warehouse_id = 1) => {
	try {
		const response = await api.get(
			`/_get_all_rooms_?warehouse_id=${warehouse_id}`
		)
		if (response.status == 200) {
			return response.data
		} else {
			return null
		}
	} catch (error) {
		console.error('Ошибка при получение кладовок:', error)
	}
}
=======
import api, { apiWithAuth } from "../../settings/api.js"
import { outputInfo } from "../../utils/outputinfo.js"

export const getClientTotalData = async () => {
  try {
    const response = await apiWithAuth.get(`/_get_client_total_for_client_`)
    if (response.status == 200) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Ошибка при получение данных о пользователе:', error);
  }
}

export const getAgreement = async (queryParams = '') => {
  try {
    const response = await api.get(`/_update_floor_for_client_${queryParams}`)
    if (response.status == 200) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Ошибка при получение данных о договорах:', error);
  }
}
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
