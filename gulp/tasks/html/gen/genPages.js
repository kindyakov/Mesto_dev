import genRoomPages from "./genRoomPages.js"

const genPages = async () => {
  const { info, error } = app.log
  try {
    await genRoomPages()

  } catch (error) {
    app.log.error(error.message)
    throw error
  }
}

export default genPages