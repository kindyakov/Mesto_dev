import api from "../settings/api.js"

export async function сallTouch(data) {
  if (!data) return
  try {
    const ct_site_id = 66514;
    const mod_id = 'ssr2n41b'

    const ct_data = {
      fio: data.firstname ? data.firstname : '',
      phoneNumber: data.username ? data.username : '',
      emailL: data.email ? data.email : '',
      subject: `Заявка с сайта ${location.host}`,
      tags: data.form ? data.form.getAttribute('data-tag-form') : '',
      comment: data.comment ? data.comment : '',
      requestUrl: location.href,
      sessionId: window.ct('calltracking_params', mod_id)?.sessionId
    };

    const new_ct_data = Object.keys(ct_data).reduce(function (e, t) {
      return ct_data[t] && e.push(t + "=" + encodeURIComponent(ct_data[t])), e
    }, []).join("&");

    const response = await api.post(`https://api.calltouch.ru/calls-service/RestAPI/requests/${ct_site_id}/register`, new_ct_data)
    if (response.status === 200) {
      return response.data
    } else null
  } catch (error) {
    console.error(error)
  }
}