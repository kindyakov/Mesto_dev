export function thing(data, pathPrefix) {
  return `
  <div class="calculator__thing thing-calculator" data-thing-id=${data.id}>
    <div class="calculator__thing_img">
      <img src="${pathPrefix}${data.img}" alt="Иконка">
    </div>
    <span class="calculator__thing_name">${data.title}</span>
    <div class="calculator__thing_counter">
      <button class="counter-btn minus"></button>
      <input type="number" readonly="true" value="${data.count}" min="0" max="100" class="count" data-value-area="${data.area}">
      <button class="counter-btn plus"></button>
    </div>
  </div>`
}