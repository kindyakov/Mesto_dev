import fs from 'fs';
import path from 'path';
import fileInclude from 'gulp-file-include';
import through2 from 'through2';
import removeHtmlComments from 'gulp-remove-html-comments';
import { processFileName, injectCriticalCSS, updateLinks } from './pipes.js';

const genTemplatePages = (done) => {
  const __dirname = path.resolve();
  const { info, error, success } = app.log;

  try {
    // Загружаем JSON с данными страниц
    const pageData = JSON.parse(fs.readFileSync(path.resolve(__dirname, `src/${app.dataFileName}`), 'utf8'));

    info('Начинаем обрабатывать шаблоны...');

    const stream = app.gulp.src('./src/template/*.html')
      .pipe(processFileName()) // Обрабатываем имя файла
      .pipe(fileInclude({ context: pageData })) // Передаем данные из JSON-файла
      .pipe(injectCriticalCSS(app)) // Вставляем критический CSS
      // .pipe(app.plugins.if(app.isBuild, updateLinks(app))) // Обновляем ссылки
      .pipe(app.plugins.if(app.isBuild, removeHtmlComments(app))) // Убираем комментарии
      .pipe(app.plugins.if(app.isBuild, app.plugins.replace(/(api-maps\.yandex\.ru[^"]*_v=)[^&"]*/g, 'api-maps.yandex.ru/v3/?apikey=b756749a-c9d8-4f04-a6c7-2653f5d9d0b7&lang=ru_RU')))
      .pipe(through2.obj(function (file, _, cb) {
        if (file.isBuffer()) {
          const fileName = path.basename(file.path);
          const outputFileName = `template-${fileName}`; // Новое имя файла
          fs.writeFileSync(path.resolve(__dirname, `./src/template/ready/${outputFileName}`), file.contents);
          info(`Шаблон ${outputFileName} собран`);
        }
        cb(null, file); // Передача контроля дальше
      }))
      .on('end', () => {
        success('Все шаблоны собраны');
        done(); // Завершение задачи
      })
      .on('error', (err) => {
        error(err);
        done(err); // Завершение с ошибкой
      });

    return stream; // Возвращаем поток
  } catch (err) {
    error('Произошла ошибка при обработке шаблонов:', err);
    done(err); // Завершение с ошибкой
  }
};
export default genTemplatePages;