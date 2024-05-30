import JustValidate from "just-validate";
import Inputmask from "inputmask";

export function validateAuth(form) {
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
  ]).addField(form.querySelector('input[name="password"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите пароль',
    },
    {
      rule: 'minLength',
      value: 6,
      errorMessage: 'Пароль должен содержать минимум 6 символов',
    },
  ])

  return validator
}

export function validateReg(form) {
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
  ]).addField(form.querySelector('input[name="password"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите пароль',
    },
    {
      rule: 'minLength',
      value: 6,
      errorMessage: 'Пароль должен содержать минимум 6 символов',
    },
  ]).addField(form.querySelector('input[name="repassword"]'), [
    {
      rule: 'required',
      errorMessage: 'Повторите пароль',
    },
    {
      validator: value => {
        const inputPassword = form.querySelector('input[name="password"]')
        return value === inputPassword.value
      },
      errorMessage: 'Пароли не совпадают',
    },
  ]).addField(form.querySelector('input[name="privacy_policy"]'), [
    {
      rule: 'required',
    },
  ])

  return validator
}