const gulp = require('gulp');

gulp.task('move', function() {
  gulp.src('./src/collection.json').pipe(gulp.dest('./dist'));
  gulp.src(['LICENSE', 'package.json', 'README.md']).pipe(gulp.dest('./dist'));

  return gulp
    .src(['./src/**/*.d.ts', './src/**/files/**', './src/**/schema.json'])
    .pipe(gulp.dest('./dist'));
});
