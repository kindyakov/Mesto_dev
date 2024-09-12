import axios from 'axios';
import { getCookie, deleteCookie } from '../utils/cookie.js'

const baseURL = 'https://store-demo-test.ru' // store-mesto.ru 

axios.defaults.timeout = 30000

const api = axios.create({ baseURL })

export const apiWithAuth = axios.create({
  baseURL,
  headers: {
    Authorization: getCookie('token'),
  },
});

apiWithAuth.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      location.href = `${location.origin}/authorization.html`
    }

    return Promise.reject(error);
  }
);

export const checkAuth = () => {
  const token = getCookie('token')

  const accountLink = document.querySelector('.header__account')
  let isAuth = false
  if (token && token.startsWith('Bearer')) {
    const tokenData = JSON.parse(atob(token.split('.')[1]))
    const tokenExpiration = new Date(tokenData.exp * 1000)
    const currentDate = new Date();

    if (currentDate > tokenExpiration) {
      deleteCookie('token');
      accountLink.href = `${window.location.origin}/authorization.html`
      isAuth = false
    } else {
      accountLink.href = `${window.location.origin}/account.html`
      isAuth = true
    }
  } else {
    isAuth = false
  }

  return isAuth
}

export default api;