var gulp = require('gulp');
var webserver = require('gulp-webserver');
 
gulp.task('webserver', function() {
  gulp.src('')
    .pipe(webserver({
      port: 8888,
      livereload: true,
      directoryListing: false,
      open: "index.html"
    }));
});
