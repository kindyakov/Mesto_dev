import JustValidate from "just-validate";
import Inputmask from "inputmask";
import AirDatepicker from "air-datepicker";
import JustValidatePluginDate from 'just-validate-plugin-date';

export function validatePassport(form) {
  if (!form) return
  const validator = new JustValidate(form, {
    errorLabelStyle: {
      color: '#FF0505'
    }
  });
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const inputSeries = form.querySelector('input[name="series"]')
  const inputNo = form.querySelector('input[name="no"]')
  const inputIssueDate = form.querySelector('input[name="issue_date"]')
  const inputSubdivision = form.querySelector('input[name="subdivision"]')

  Inputmask.default("9999").mask(inputSeries)
  Inputmask.default("999999").mask(inputNo)
  // Inputmask.default("99-99-9999").mask(inputIssueDate)
  Inputmask.default("999-999").mask(inputSubdivision)

  const dataPickerIssueDate = new AirDatepicker(inputIssueDate, {
    dateFormat: 'yyyy-MM-dd',
    position: 'bottom center',
    autoClose: true,
    // maxDate: calculateMinDate(),
    isMobile: isMobile,
  });

  validator.addField(inputSeries, [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      validator: value => {
        const unmaskInput = Inputmask.default.unmask(value, { mask: "9999" });
        return Boolean(Number(unmaskInput) && unmaskInput.length === 4)
      },
      errorMessage: 'Неверный формат',
    }
  ]).addField(inputNo, [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      validator: value => {
        const unmaskInput = Inputmask.default.unmask(value, { mask: "999999" });
        return Boolean(Number(unmaskInput) && unmaskInput.length === 6)
      },
      errorMessage: 'Неверный формат',
    }
  ]).addField(inputIssueDate, [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      plugin: JustValidatePluginDate((fields) => ({
        required: true,
        format: 'yyyy-MM-dd',
      })),
      errorMessage: 'Неверный формат',
    }
  ]).addField(inputSubdivision, [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      validator: value => {
        const unmaskInput = Inputmask.default.unmask(value, { mask: "999-999" });
        return Boolean(Number(unmaskInput) && unmaskInput.length === 6)
      },
      errorMessage: 'Неверный формат',
    }
  ]).addField(form.querySelector('input[name="issued_by"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
  ])

  return validator
}

export function validateUrData(form) {
  if (!form) return
  const validator = new JustValidate(form, {
    errorLabelStyle: {
      color: '#FF0505'
    }
  });

  const inputBik = form.querySelector('input[name="bik"]')
  const inputInn = form.querySelector('input[name="inn"]')
  const inputKpp = form.querySelector('input[name="kpp"]')
  const inputBank = form.querySelector('input[name="bank"]')
  const inputRs = form.querySelector('input[name="rs"]')
  const inputKs = form.querySelector('input[name="ks"]')

  validator.addField(form.querySelector('input[name="fullname"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
  ]).addField(form.querySelector('input[name="address"]'), [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
  ]).addField(inputBik, [
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
  ]).addField(inputInn, [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      validator: value => {
        if (value.length > 10) {
          inputInn.value = value.slice(0, 10)
        } else {
          inputInn.value = value.replace(/[^0-9]/g, '')
        }
        return inputInn.value.replace(/[^0-9]/g, '').length === 10
      },
      errorMessage: 'Неверный формат',
    }
  ]).addField(inputKpp, [
    {
      rule: 'required',
      errorMessage: 'Заполните поле',
    },
    {
      validator: value => {
        if (value.length > 9) {
          inputKpp.value = value.slice(0, 9)
        } else {
          inputKpp.value = value.replace(/[^0-9]/g, '')
        }
        return inputKpp.value.replace(/[^0-9]/g, '').length === 9
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