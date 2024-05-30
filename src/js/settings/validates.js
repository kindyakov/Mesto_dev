import JustValidate from "just-validate";
import Inputmask from "inputmask";

export const validatesInput = {
  username: form => {
    if (!form) return
    const validator = new JustValidate(form, {
      errorLabelStyle: {
        color: '#FF0505'
      }
    });
    const inputPhone = form.querySelector('input[name="username"]')
    Inputmask.default("+7 (999) 999-99-99").mask(inputPhone)

    validator.addField(form.querySelector('input[name="username"]'), [
      {
        rule: 'required',
        errorMessage: 'Введите телефон',
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
  code: form => {
    if (!form) return
    const validator = new JustValidate(form, {
      errorLabelStyle: {
        color: '#FF0505'
      }
    });
    const input = form.querySelector('input[name="code"]')

    validator.addField(input, [
      {
        rule: 'required',
        errorMessage: 'Введите код',
      },
      {
        validator: value => {
          if (value.length > 5) {
            input.value = value.slice(0, 5)
          } else {
            input.value = value.replace(/[^0-9]/g, '')
          }
          return input.value.replace(/[^0-9]/g, '').length === 5
        },
        errorMessage: 'Неверный формат',
      }
    ])

    return validator
  },
  email: form => {
    if (!form) return
    const validator = new JustValidate(form, {
      errorLabelStyle: {
        color: '#FF0505'
      }
    });

    validator.addField(form.querySelector('input[name="email"]'), [
      {
        rule: 'required',
        errorMessage: 'Введите почту',
      },
      {
        rule: 'email',
        errorMessage: 'Неверный формат',
      }
    ])

    return validator
  },
  birthday: form => {
    if (!form) return
    const validator = new JustValidate(form, {
      errorLabelStyle: {
        color: '#FF0505'
      }
    });
    const inputBirthday = form.querySelector('input[name="birthday"]')

    Inputmask.default("99-99-9999").mask(inputBirthday)

    validator.addField(inputBirthday, [
      {
        rule: 'required',
        errorMessage: 'Заполните поле',
      },
      {
        validator: value => {
          let isValid = false,
            valYear = +value.split('-')[2],
            valMonth = +value.split('-')[1],
            valDay = +value.split('-')[0];

          if (valYear <= year - 18) {
            isValid = true
          }
          return isValid
        },
        errorMessage: 'Вам нет 18',
      }
    ])

    return validator
  },
  familyname: form => {
    if (!form) return
    const validator = new JustValidate(form, {
      errorLabelStyle: {
        color: '#FF0505'
      }
    });

    validator.addField(form.querySelector('input[name="familyname"]'), [
      {
        rule: 'required',
        errorMessage: 'Введите фамилию',
      },
      {
        rule: 'customRegexp',
        value: /^[А-ЯЁа-яё]+$/,
        errorMessage: 'Неверный формат',
      },
    ])

    return validator
  },
  firstname: form => {
    if (!form) return
    const validator = new JustValidate(form, {
      errorLabelStyle: {
        color: '#FF0505'
      }
    });

    validator.addField(form.querySelector('input[name="firstname"]'), [
      {
        rule: 'required',
        errorMessage: 'Введите имя',
      },
      {
        rule: 'customRegexp',
        value: /^[А-ЯЁа-яё]+$/,
        errorMessage: 'Неверный формат',
      },
    ])

    return validator
  },
  patronymic: form => {
    if (!form) return
    const validator = new JustValidate(form, {
      errorLabelStyle: {
        color: '#FF0505'
      }
    });

    validator.addField(form.querySelector('input[name="patronymic"]'), [
      {
        rule: 'required',
        errorMessage: 'Введите отчество',
      },
      {
        rule: 'customRegexp',
        value: /^[А-ЯЁа-яё]+$/,
        errorMessage: 'Неверный формат',
      },
    ])

    return validator
  }
}