import JustValidate from "just-validate";
import Inputmask from "inputmask";

export const validates = {
  username: form => {
    if (!form) return
    const validator = new JustValidate(form);
    const inputPhone = form.querySelector('input[name="username"]')
    Inputmask.default("+7 (999) 999-99-99").mask(inputPhone)

    validator.addField(form.querySelector('input[name="username"]'), [
      {
        rule: 'required',
        errorMessage: 'Введите номер телефона',
      },
      {
        validator: value => {
          const unmaskPhone = Inputmask.default.unmask(value, { mask: "+7 (999) 999-99-99" });
          return Boolean(Number(unmaskPhone) && unmaskPhone.length === 10)
        },
        errorMessage: 'Неверный формат',
      }
    ])

    return validator
  },
  arrangeGuestVisit: form => {
    if (!form) return
    const validator = new JustValidate(form);
    const inputPhone = form.querySelector('input[name="username"]')
    Inputmask.default("+7 (999) 999-99-99").mask(inputPhone)

    validator.addField(form.querySelector('input[name="username"]'), [
      {
        rule: 'required',
        errorMessage: 'Введите номер телефона',
      },
      {
        validator: value => {
          const unmaskPhone = Inputmask.default.unmask(value, { mask: "+7 (999) 999-99-99" });
          return Boolean(Number(unmaskPhone) && unmaskPhone.length === 10)
        },
        errorMessage: 'Неверный формат',
      }
    ]).addField(form.querySelector('input[name="email"]'), [
      {
        rule: 'required',
        errorMessage: 'Введите почту',
      },
      {
        rule: 'email',
        errorMessage: 'Неверный формат',
      }
    ]).addField(form.querySelector('input[name="personal_data"]'), [
      {
        rule: 'required',
      },
    ])

    return validator
  }
}