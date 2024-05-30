export function formattingPrice(price) {
  if (!price || price == 'null') return 0 + ' ₽'
  return Number(price).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}