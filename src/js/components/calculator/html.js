export function thing(data) {
<<<<<<< HEAD
	let imgSrc = `${location.origin}/${data.img}`
	// const imgPathWebp = imgSrc.replace('.png', '.webp')
	// const img = new Image()

	// if (location.hostname !== 'localhost') {
	// 	img.src = imgPathWebp
	// 	img.onload = () => (imgSrc = imgPathWebp)
	// }

	return `
  <div class="calculator__thing thing-calculator" data-thing-id=${data.id}>
    <div class="calculator__thing_img">
      <img src="${imgSrc}" alt="Иконка" loading="lazy">
=======
  let imgSrc = `${location.origin}/${data.img}`
  const imgPathWebp = imgSrc.replace('.png', '.webp')
  const img = new Image()

  if (location.hostname !== "localhost") {
    img.src = imgPathWebp
    img.onload = () => imgSrc = imgPathWebp;
  }

  return `
  <div class="calculator__thing thing-calculator" data-thing-id=${data.id}>
    <div class="calculator__thing_img">
      <img src="${imgSrc}" alt="Иконка">
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
    </div>
    <span class="calculator__thing_name">${data.title}</span>
    <div class="calculator__thing_counter">
      <button class="counter-btn minus"></button>
      <input type="number" readonly="true" value="${data.count}" min="0" max="100" class="count" data-value-area="${data.area}">
      <button class="counter-btn plus"></button>
    </div>
  </div>`
<<<<<<< HEAD
}
=======
}
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
