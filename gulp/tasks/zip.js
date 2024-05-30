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
        const gitInstance = git();
        await gitInstance.init();
        await gitInstance.add('./*');
        await gitInstance.commit(app.version);

        if (app.settings.useExistingRepo) {
          await gitInstance.push('origin', 'master');
        } else {
          await gitInstance.addRemote('origin', process.env.REPO_URL);
          await gitInstance.push('origin', 'master', { '--repo': process.env.REPO_URL });
          app.settings.useExistingRepo = true;
          fs.writeFileSync('settings.json', JSON.stringify(settings, null, 2));
        }

        console.log(app.plugins.chalk.green('Обновления добавлены'))
      })
      .on('error', (err) => console.error('Failed to commit+push', err))
  )
}

