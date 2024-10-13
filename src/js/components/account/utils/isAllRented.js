export function isAllRented(rooms, rentedValue = 0.4) {
  return rooms.every(room => room.rented === rentedValue)
}

export function isOneRented(rooms, rentedValue = 1) {
  let isRented = false

  if (!rooms.length) return isRented

  for (const room of rooms) {
    if (room.rented === rentedValue) {
      isRented = true
      break
    }
  }

  return isRented
}