// 引入 gulp
var gulp = require('gulp');

// 引入组件
var jshint = require('gulp-jshint'),
    runSequence = require('run-sequence'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    revCollector = require('gulp-rev-collector'), //替换路径
    rev = require('gulp-rev'), //对文件计算md5并加在文件名后面，需要修改源码
    gulpif = require('gulp-if'),
    del = require('del'),
    condition = true,
    minifyHtml = require('gulp-minify-html'),
    minifyCss = require('gulp-minify-css'),
    gulpUtil = require('gulp-util');
//var distDir = '/xx/xxx/front';
var distDir = 'dist';

// 检查脚本
gulp.task('lint', function() {
    gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// 合并，压缩文件js
gulp.task('miniJs', function() {
    var lastStream = null;
    return gulp.src('js/**/*.js')
        // .pipe(uglify().on('error', gulpUtil.log)) //压缩
        .pipe(rev()) //计算md5
        .pipe(gulp.dest(distDir + '/js')) //输出压缩后的
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/rev/js')) //生成rev-mainfest.json
});

gulp.task('miniHtml', function() {
    return gulp.src(['dist/rev/**/*.json', './*.html']) //读取rev目录下的版本映射文件并替换html中的路径
        .pipe(revCollector())
        .pipe(gulpif(
            condition, minifyHtml({
                empty: true,
                spare: true,
                quotes: true
            }) //压缩
        ))
        .pipe(gulp.dest(distDir)); //输出
});

//压缩CSS/生成版本号
gulp.task('miniCss', function() {
    return gulp.src('css/*.css')
        .pipe(gulpif(
            condition, minifyCss({
                compatibility: 'ie7'
            })
        ))
        .pipe(rev())
        .pipe(gulp.dest(distDir + '/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/rev/css')); //生成.json文件
});
//图片处理
gulp.task('revImg', function() {
    return gulp.src('img/*.{png,jpg,jpeg,gif,ico}') //知识点：匹配多个后缀
        .pipe(gulp.dest(distDir + '/img'))
});

//config配置处理
gulp.task('revConfig', function() {
    return gulp.src('config/master_config.js')
        .pipe(rev())
        .pipe(gulp.dest(distDir + '/config'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/rev/config'));
});

gulp.task('clean', del.bind(null, ['dist'], {
    force: true
}));

// 默认任务,使用runSequence保证任务按顺序执行，miniJs和miniCss是并行执行的，miniHtml是在前两个任务执行完后再执行
gulp.task('build', function(done) {
    runSequence(
        ['miniJs', 'miniCss', 'revImg' , 'revConfig'],
        'miniHtml',
        done);
})

gulp.task("start", function() {
    runSequence('clean', 'build');
});