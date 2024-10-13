import JustValidate from "just-validate";

export function validatePasswordRecovery(form) {
  if (!form) return
  const validator = new JustValidate(form, {
    errorLabelStyle: {
      color: '#FF0505'
    }
  });

  validator.addField(form.querySelector('input[name="password"]'), [
    {
      rule: 'required',
      errorMessage: 'Введите пароль',
    },
    {
      rule: 'minLength',
      value: 5,
      errorMessage: 'Пароль должен содержать минимум 5 символов',
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
  ])

  return validator
}