import jsdoc from 'gulp-jsdoc3';
import { path } from '../config/path.js';
import jsdocConfig from '../../jsdoc.json' assert { type: 'json' };

const jsDoc = (cb) => {
  return (
    app.gulp.src([`${path.srcFolder}/js/**/*.js`], { read: false, allowEmpty: true }) // 'README.md',
      .pipe(jsdoc(jsdocConfig, cb))
  )
}

export default jsDoc;