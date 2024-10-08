import gulp from 'gulp'
import { path } from './gulp/config/path.js'
import plugins from './gulp/config/plugins.js'
import dotenv from 'dotenv'
import fs from 'fs'

function generateFileVersion() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // добавляем ведущий ноль, если месяц < 10
  const day = String(date.getDate()).padStart(2, '0'); // добавляем ведущий ноль, если день < 10
  const hours = String(date.getHours()).padStart(2, '0'); // добавляем ведущий ноль, если час < 10
  const minutes = String(date.getMinutes()).padStart(2, '0'); // добавляем ведущий ноль, если минута < 10
  const seconds = String(date.getSeconds()).padStart(2, '0'); // добавляем ведущий ноль, если секунда < 10

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

dotenv.config()

const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'))

const log = {
  error: (...args) => console.log(plugins.chalk.bold.red(...args)),
  warning: (...args) => console.log(plugins.chalk.hex('#FFA500')(...args)),
  success: (...args) => console.log(plugins.chalk.bold.green(...args)),
  info: (...args) => console.log(plugins.chalk.blue(...args)),
}
// Глобальные переменные
global.app = {
  path,
  gulp,
  plugins,
  isBuild: process.argv.includes('--build'),
  isDev: !process.argv.includes('--build'),
  version: generateFileVersion(),
  settings,
  dataFileName: '#pageData.json',
  log,
}

process.env.NODE_ENV = app.isBuild ? 'production' : 'development';
process.env.APP_VERSION = app.version;

import copy from './gulp/tasks/copy.js'
import reset from './gulp/tasks/reset.js'
import html, { htmlReplaceExtensionImg, generateHtmlData } from './gulp/tasks/html/html.js'
import server from './gulp/tasks/server.js'
import scss, { insertCriticalCss } from './gulp/tasks/scss.js'
import js from './gulp/tasks/js.js'
import images from './gulp/tasks/images.js'
import { otfToTtf, ttfToWoff, fontsStyle, iconsfonts } from './gulp/tasks/fonts.js'
import svgSprite from './gulp/tasks/svgSprite.js'
import { zip, zipDev } from './gulp/tasks/zip.js'
import ftp from './gulp/tasks/ftp.js'
import php from './gulp/tasks/php.js'
import { video } from "./gulp/tasks/video.js";
import { createRepo } from './gulp/tasks/git.js';
import jsDoc from './gulp/tasks/jsdoc.js'

import genPages from './gulp/tasks/html/gen/genPages.js'
import genTemplatePages from './gulp/tasks/html/genTemplatePages.js'

function watcher() {
  gulp.watch(path.watch.assets, copy)
  gulp.watch(path.watch.html, html)
  gulp.watch(path.watch.scssCritical, insertCriticalCss)
  gulp.watch(path.watch.scss, scss)
  gulp.watch(path.watch.js, js)
  gulp.watch(path.watch.images, images)
  gulp.watch(path.watch.php, php)
}

// Последовательная обработка шрифтов 
const fonts = gulp.series(otfToTtf, ttfToWoff, fontsStyle, iconsfonts)
// Основные задачи
const mainTasks = gulp.series(video,
  gulp.parallel(copy,
    gulp.series(insertCriticalCss, html, htmlReplaceExtensionImg, js), // genTemplatePages, genPages,
    scss, images, php))

const devTasks = gulp.series(
  video,
  gulp.parallel(copy,
    gulp.series(generateHtmlData, insertCriticalCss, html,), // genTemplatePages, genPages
    scss, js, images, php))

// Сценарий выполнения задач 
const dev = gulp.series(reset, devTasks, gulp.parallel(watcher, server))
const build = gulp.series(reset, mainTasks)
const deployZIP = gulp.series(reset, mainTasks, zip)
const deployZIP_DEV = gulp.series(zipDev)
const deployFTP = gulp.series(reset, mainTasks, ftp)
const deployGIT_DEV = gulp.series(createRepo)
const docs = gulp.series(jsDoc)

gulp.task('default', dev)

// export сценариев
export { dev, build, fonts, svgSprite, deployZIP, deployFTP, deployZIP_DEV, deployGIT_DEV, docs, }