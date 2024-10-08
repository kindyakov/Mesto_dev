import webpack from 'webpack-stream'

const js = () => {
  return (
    app.gulp.src(app.path.src.js, { sourcemaps: app.isDev })
      .pipe(app.plugins.plumber(
        app.plugins.notify.onError({
          title: 'JS',
          message: 'Error: <%= error.message %>'
        })
      ))
      .pipe(webpack({
        mode: app.isBuild ? 'production' : 'development',
        output: {
          filename: app.isBuild ? `app.min.${app.version}.js` : 'app.min.js'
        },
        module: {
          rules: [
            {
              test: /\.css$/,
              use: ['style-loader', 'css-loader']
            }
          ]
        },
      }))
      .pipe(app.gulp.dest(app.path.build.js))
      .pipe(app.plugins.browserSync.stream())
  );
}

export default js;