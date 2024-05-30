export const validatesInputs = {
  rangeCount: (input, maxValue) => {
    const valueReplace = input.value.replace(/[^0-9]/g, '')

    if (input.value.length > maxValue.toString().length) {
      input.value = input.value.slice(0, maxValue.toString().length)
    } else {
      if (Number(valueReplace) > Number(maxValue)) {
        input.value = maxValue
      } else {
        input.value = valueReplace
      }
    }
    return valueReplace.length <= maxValue.toString().length
  },
  rangeCountArea: (input, maxValue) => {
    const valueReplace = input.value && input.value.replace(/[^0-9.]/g, '')
    if (!valueReplace) return false

    const decimalIndex = valueReplace.indexOf('.');
    if (decimalIndex !== -1) {
      const valueReplaceDecimal = valueReplace.slice(0, decimalIndex + 2)
      input.value = valueReplaceDecimal.replace(/,/g, '.') // Оставляем только один знак после запятой

      return true
    }

    if (Number(valueReplace) > Number(maxValue)) {
      input.value = maxValue;
    } else {
      input.value = valueReplace;
    }

    return true;
  },
}