import JustValidate from 'just-validate';

export function validate(form) {
  if (!form) return
  const validator = new JustValidate(form);
  validator.addField(form.querySelector('input[name="current_password"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите старый пароль',
    },
    {
      rule: 'minLength',
      value: 5,
      errorMessage: 'Пароль должен содержать минимум 5 символов',
    },
  ]).addField(form.querySelector('input[name="password"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите новый пароль',
    },
    {
      rule: 'minLength',
      value: 5,
      errorMessage: 'Пароль должен содержать минимум 5 символов',
    },
  ]).addField(form.querySelector('input[name="repassword"]'), [
    {
      rule: 'required',
      errorMessage: 'Повторите новый пароль',
    },
    {
      validator: value => {
        const inputPassword = form.querySelector('input[name="password"]')
        return value === inputPassword.value
      },
      errorMessage: 'Пароли не совпадают',
    },
  ])

  return validator
}

export function validateCreatePassword(form) {
  if (!form) return
  const validator = new JustValidate(form);
  validator.addField(form.querySelector('input[name="password"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите новый пароль',
    },
    {
      rule: 'minLength',
      value: 5,
      errorMessage: 'Пароль должен содержать минимум 5 символов',
    },
  ]).addField(form.querySelector('input[name="repassword"]'), [
    {
      rule: 'required',
      errorMessage: 'Повторите новый пароль',
    },
    {
      validator: value => {
        const inputPassword = form.querySelector('input[name="password"]')
        return value === inputPassword.value
      },
      errorMessage: 'Пароли не совпадают',
    },
  ])

  return validator
}