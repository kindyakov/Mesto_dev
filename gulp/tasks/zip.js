import { deleteAsync } from "del"
import zipPlugins from "gulp-zip"
import git from 'simple-git';

export const zip = () => {
  deleteAsync(`./${app.path.rootFolder}_build.zip`)
  return (
    app.gulp.src(app.path.build.project)
      .pipe(app.plugins.plumber(
        app.plugins.notify.onError({
          title: 'ZIP',
          message: 'Error: <%= error.message %>'
        })
      ))
      .pipe(zipPlugins(`${app.path.rootFolder}_build.zip`))
      .pipe(app.gulp.dest('./'))
  )
}

export const zipDev = () => {
  deleteAsync(`./${app.path.rootFolder}_dev.zip`); // Удаляем старый архив, если есть
  return (
    app.gulp.src([
      'gulp/**/*', // gulp и все вложенные файлы и папки
      'src/**/*', // src и все вложенные файлы и папки
      'shared/**/*',
      'package.json',
      'gulpfile.js',
    ], { base: '.' }) // Указываем базовую директорию для корректной структуры в архиве
      .pipe(zipPlugins(`${app.path.rootFolder}_dev.zip`))
      .pipe(app.gulp.dest('./'))
      .on('end', async () => {
        console.log(app.plugins.chalk.blue('Архив создан. Начинаем инициализацию git...'));
        const gitInstance = git();
        await gitInstance.init();
        console.log(app.plugins.chalk.green('Git инициализирован.'));
        await gitInstance.add('./*');
        await gitInstance.commit(app.version);
        console.log(app.plugins.chalk.green(`Коммит "${app.version}" создан.`));

        if (app.settings.useExistingRepo) {
          console.log(app.plugins.chalk.blue('Пушим в существующий репозиторий...'));
          await gitInstance.push('origin', 'master');
        } else {
          console.log(app.plugins.chalk.blue('Добавляем удаленный репозиторий и пушим...'));
          await gitInstance.addRemote('origin', app.settings.repoUrl);
          await gitInstance.push('origin', 'master', { '--repo': app.settings.repoUrl });
          app.settings.useExistingRepo = true;
          fs.writeFileSync('settings.json', JSON.stringify(app.settings, null, 2));
        }

        console.log(app.plugins.chalk.green('Обновления добавлены'))
      })
      .on('error', (err) => console.error('Failed to commit+push', err))
  )
}

