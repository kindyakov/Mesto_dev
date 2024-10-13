import through2 from 'through2';
import fs from 'fs';
import cheerio from 'cheerio';
import path from 'path';

export const processFileName = () => {
  return through2.obj(function (file, _, cb) {
    if (file.isBuffer()) {
      const fileName = path.basename(file.path, '.html');
      let fileContents = file.contents.toString();

      if (fileContents.includes('@@fileName')) {
        fileContents = fileContents.replace(/fileName/g, fileName);
      }

      file.contents = Buffer.from(fileContents);
    }
    cb(null, file);
  });
};

export const injectCriticalCSS = (app) => {
  return through2.obj(function (file, _, cb) {
    if (file.isBuffer()) {
      const fileName = path.basename(file.path, '.html');
      const fileStylePath = path.join(app.path.shared.css, `${fileName}.css`);
      let fileContents = file.contents.toString();

      if (fileContents.includes('@@critical-css')) {
        if (fs.existsSync(fileStylePath)) {
          const cssContent = fs.readFileSync(`${app.path.shared.css}${fileName}.css`, 'utf8');
          fileContents = fileContents.replace(/@@critical-css/g, `<style>${cssContent}</style>`);
        } else {
          fileContents = fileContents.replace(/@@critical-css/g, '');
        }
      }

      if (app.isBuild && fileContents.includes('app.min.js')) {
        fileContents = fileContents.replace(/app.min.js/g, `app.min.${app.version}.js`);
      }

      file.contents = Buffer.from(fileContents);
    }
    cb(null, file);
  });
};

export const updateLinks = () => {
  return through2.obj(function (file, _, cb) {
    if (file.isBuffer()) {
      let fileContents = file.contents.toString();
      const $ = cheerio.load(fileContents, { decodeEntities: false });
      const baseURL = "https://mesto-store.ru/";

      $('a[href]').each(function () {
        let href = $(this).attr('href');

        // Проверяем, является ли ссылка относительной
        if (!/^(http|https|\/)/.test(href) && (href.includes('.html') || href.includes('.pdf'))) {
          // Получаем директорию текущего файла
          let currentDir = path.dirname(file.relative);
          // Создаем абсолютный путь для ссылки
          let absoluteHref = path.resolve(currentDir, href);
          // Получаем относительный путь от корневого каталога
          let relativeHref = path.relative('.', absoluteHref);
          // Убираем расширение .html и заменяем слэши на URL-формат
          let newHref = baseURL + relativeHref.replace(/\\/g, '/').replace(/\.html$/, '');

          $(this).attr('href', newHref);
        }
      });

      fileContents = $.html();
      file.contents = Buffer.from(fileContents);
    }
    cb(null, file);
  });
};