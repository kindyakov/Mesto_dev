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