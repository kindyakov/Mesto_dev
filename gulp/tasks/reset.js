import { deleteAsync } from "del"

const reset = () => {
  return deleteAsync([
    `${app.path.clean}/**/*`,
    `!${app.path.clean}/fonts`,
    `!${app.path.clean}/.git`,
    `!${app.path.clean}/.gitignore`,
    `!${app.path.clean}/calculator`])
}

export default reset