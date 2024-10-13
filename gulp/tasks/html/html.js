import fs from 'fs'
import path from 'path'
import through2 from 'through2';
import fileinclude from "gulp-file-include"
import webpHtmlNosvg from "gulp-webp-html-nosvg"
import versionNumber from 'gulp-version-number'
import removeHtmlComments from 'gulp-remove-html-comments';
import { processFileName, injectCriticalCSS, updateLinks } from './pipes.js';

const dataFileName = '#pageData.json'

const html = () => {
  const __dirname = path.resolve()
  const pageData = JSON.parse(fs.readFileSync(path.resolve(__dirname, `src/${dataFileName}`), 'utf8'));

  return (
    app.gulp.src(['./src/**/*.html', '!./src/html/**/*.html', '!./src/pageData/**/*.html', '!./src/template/**/*.html'])
      .pipe(app.plugins.plumber(
        app.plugins.notify.onError({
          title: 'HTML',
          message: 'Error: <%= error.message %>'
        })
      ))
      .pipe(processFileName())
      .pipe(fileinclude({
        context: pageData // Передаем данные из JSON-файла
      }))
      .pipe(injectCriticalCSS(app))
      .pipe(app.plugins.if(app.isBuild, updateLinks(app)))
      // .pipe(app.plugins.replace(/@img\//g, 'img/'))
      // .pipe(app.plugins.if(app.isBuild, webpHtmlNosvg()))
      .pipe(app.plugins.if(app.isBuild, versionNumber({
        'value': '%DT%',
        'append': {
          'key': '_v',
          'cover': 0,
          'to': ['css',] // 'js'
        },
        'output': {
          'file': 'gulp/version.json'
        },
      })))
      // Удаляем версию из URL api-maps.yandex.ru
      .pipe(app.plugins.if(app.isBuild, app.plugins.replace(/(api-maps\.yandex\.ru[^"]*_v=)[^&"]*/g, 'api-maps.yandex.ru/v3/?apikey=b756749a-c9d8-4f04-a6c7-2653f5d9d0b7&lang=ru_RU')))
      .pipe(app.plugins.if(app.isBuild, removeHtmlComments())) // Убираем комментарии
      .pipe(app.gulp.dest(app.path.build.html))
      .pipe(app.plugins.browserSync.stream())
  )
}

export default html

export const htmlReplaceExtensionImg = () => {
  return app.gulp.src(app.path.build.html + '/**/*.html')
    .pipe(app.plugins.if(app.isBuild, app.plugins.replace(/\.png(?=\")/g, '.webp'))) // Заменить расширение в строках
    .pipe(app.plugins.if(app.isBuild, app.plugins.replace(/\.jpg(?=\")/g, '.webp'))) // Заменить расширение в строках
    .pipe(app.gulp.dest(app.path.build.html))
}

export const generateHtmlData = () => {
  const dataPath = path.join(app.path.srcFolder, dataFileName)

  if (fs.existsSync(dataPath)) {
    console.log(app.plugins.chalk.yellow(`Файл ${dataFileName} существует, чтобы обновить его, удалите файл ${dataFileName}`))
    return app.gulp.src('.') // возвращает пустой поток
  }

  let data = {}

  return app.gulp.src(['./src/**/*.html', '!./src/html/**/*.html', '!./src/pageData/'])
    .pipe(through2.obj(function (file, _, cb) {
      if (file.isBuffer()) {
        const fileName = path.basename(file.path, '.html')
        const relativePath = path.relative(app.path.srcFolder, file.path)

        const depth = relativePath.split('\\').length - 1;
        const pathPrefix = '../'.repeat(depth)

        data[fileName] = {
          "title": "",
          "description": "",
          "keywords": "",
          "path": depth > 0 ? pathPrefix : ""
        }

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
      }

      cb(null, file)
    }))
    .on('end', function () {
      console.log(app.plugins.chalk.green(`Данные о страницах успешно сгенерированы и сохранены в файле ${dataFileName}`))
    })
}