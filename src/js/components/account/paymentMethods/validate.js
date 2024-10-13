import JustValidate from "just-validate";

export function validateLinkNewBankingDetails(form) {
  if (!form) return
  const validator = new JustValidate(form, {
    errorLabelStyle: {
      color: '#FF0505'
    }
  });

  const inputBik = form.querySelector('input[name="bik"]')
  const inputBank = form.querySelector('input[name="bank"]')
  const inputRs = form.querySelector('input[name="rs"]')
  const inputKs = form.querySelector('input[name="ks"]')

  validator.addField(inputBik, [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      validator: value => {
        if (value.length > 9) {
          inputBik.value = value.slice(0, 9)
        } else {
          inputBik.value = value.replace(/[^0-9]/g, '')
        }
        return inputBik.value.replace(/[^0-9]/g, '').length === 9
      },
      errorMessage: 'Неверный формат',
    }
  ]).addField(inputBank, [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      rule: 'customRegexp',
      value: /^[А-ЯЁа-яё\s]+$/,
      errorMessage: 'Неверный формат',
    },
  ]).addField(inputRs, [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      validator: value => {
        if (value.length > 20) {
          inputRs.value = value.slice(0, 20)
        } else {
          inputRs.value = value.replace(/[^0-9]/g, '')
        }
        return inputRs.value.replace(/[^0-9]/g, '').length === 20
      },
      errorMessage: 'Неверный формат',
    }
  ]).addField(inputKs, [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      validator: value => {
        if (value.length > 20) {
          inputKs.value = value.slice(0, 20)
        } else {
          inputKs.value = value.replace(/[^0-9]/g, '')
        }
        return inputKs.value.replace(/[^0-9]/g, '').length === 20
      },
      errorMessage: 'Неверный формат',
    }
  ])

  return validator
}