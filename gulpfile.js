const   gulp                = require('gulp'),
        autoprefixer 	    = require('gulp-autoprefixer'),
        sass 			    = require('gulp-sass'),
        sourcemaps          = require('gulp-sourcemaps'),
        cleancss 		    = require('gulp-cleancss'),
        concat 			    = require('gulp-concat'),
        browsersync		    = require('browser-sync').create(),
        gulpif 			    = require('gulp-if'),
        notify              = require("gulp-notify"),
        plumber             = require('gulp-plumber'),
        uglify 			    = require('gulp-uglify'),
		babel               = require('gulp-babel'),
		cache 				= require('gulp-cached'),
		replace				= require('gulp-string-replace'),
		uniqid 				= require('uniqid'),
		imagemin			= require('gulp-imagemin'),
		svgSprite           = require('gulp-svg-sprite'),
		clean 				= require('gulp-clean');
		// ftp                 = require('vinyl-ftp'),

// Paths
const paths = {
	src: {
		sass: 		'./src/styles',
		js: 		'./src/scripts',
		img: 		'./src/images',
		icons:		'./src/icons',
		fonts:		'./src/fonts',
		php: 		'./src',
		temp:		'./src/temp'
	},
	dist: {
		css: 		'./build/css',
		js: 		'./build/js',
		img: 		'./build/images',
		sprite:		'./build/sprite',
		fonts:		'./build/fonts',
		php: 		'./build'
    },
    vendor: {
        bootstrap: {
            sass:   './node_modules/bootstrap/scss/bootstrap.scss',
            js:     './node_modules/bootstrap/js/src'
        },
        jquery: {
            full:   './node_modules/jquery/dist/jquery.min.js',
            slim:   './node_modules/jquery/dist/jquery.slim.min.js'
		},
		popperjs:	'./node_modules/popper.js/dist/popper.min.js'
	}
};

// FTP Settings
const ftp = {
	path:	'/home/clients/radarvertige/radarpersoneel/wp-content/themes/radarpersooneel',
	host:	'radarvertige.dev1-plusport.local',
	url: 	'https://radarvertige.dev1-plusport.local/radarpersoneel/',
	port:	22
}

// SVG sprite settings
const svgSpriteConfig = {
    shape: {
        spacing: {
            padding: 1
        }
    },
    mode: {
        css: {
            variables: {
                replaceSvgWithPng: function() {
                    return function(sprite, render) {
                        return render(sprite).split('.svg').join('.png');
                    }
                }
            },
            sprite: 'sprite.svg',
            render: {
				
                scss: {
                    template: './gulptemplates/sprite.scss'
				}
            }
        }
	}
}

let development = true;

function css() {
	return (
		gulp
            .src([paths.vendor.bootstrap.sass, paths.src.sass + '/styles.scss'])
            .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
			.pipe(gulpif(development, sourcemaps.init({
				largeFile: true
			})))
			.pipe(sass({
				errLogToConsole: true
            }))
            .pipe(concat('style.css'))
			.pipe(autoprefixer({
				browsers: ['last 2 versions', 'IE 9', 'IE 10', 'IE 11']
            }))
            .pipe(cleancss())
			.pipe(gulpif(development, sourcemaps.write('/')))
			.pipe(gulp.dest(paths.dist.css))
			.pipe(gulpif(development, browsersync.stream()))
	);
}

// Build Javascript
function javascript() {
	return (
		gulp
			.src([paths.vendor.jquery.slim /*, paths.vendor.popperjs */, paths.vendor.bootstrap.js, paths.src.js + '/**/*.js'])
            .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
            .pipe(babel({
				presets: ['@babel/env'],
				ignore: [paths.vendor.jquery.slim, paths.vendor.bootstrap.js]
            }))
			.pipe(gulpif(development,sourcemaps.init()))
			.pipe(uglify())
			.pipe(concat('scripts.js'))
			.pipe(gulpif(development,sourcemaps.write('/')))
			.pipe(gulp.dest(paths.dist.js))
			.pipe(gulpif(development, browsersync.stream()))
	);
}

// Template files
function php() {
	return (
		gulp
			.src(paths.src.php + '/**/*.php')
			.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
			.pipe(replace('###VERSIONNUMBER###', uniqid()))
			.pipe(gulp.dest(paths.dist.php))
			.pipe(gulpif(development, browsersync.stream()))
	);
}

// Optimize images
function images() {
	return(
		gulp
			.src(paths.src.img + '/*.{jpg,jpeg,png}')
			.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
			.pipe(cache())
			.pipe(imagemin())
			.pipe(gulp.dest(paths.dist.img))
			.pipe(gulpif(development, browsersync.stream()))
	);
}

// Create sprite functions
function createSprite() {
	return(
		gulp
			.src(paths.src.icons + '/**/*.svg')
			.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
			.pipe(svgSprite(svgSpriteConfig))
			.pipe(gulp.dest(paths.src.temp))
	);
}
function deleteOldSpritesheet() {
	return(
		gulp
			.src(paths.dist.sprite + '/*.svg')
			.pipe(clean())
	);
}
function moveSpriteStyle() {
	return(
		gulp
			.src(paths.src.temp + '/css/sprite.scss')
			.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
			.pipe(gulp.dest(paths.src.sass + '/modules/'))
	);
}
function moveSprite() {
	return(
		gulp
			.src(paths.src.temp + '/css/*.svg')
			.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
			.pipe(gulp.dest(paths.dist.sprite))
	);
}

// Clean up temp folder (used by some gulp tasks)
function cleanTemp() {
	return(
		gulp
			.src(paths.src.temp + '/*')
			.pipe(clean())
	);
}

// Watch files/folders
function watch(done) {
    development = true;

	browsersync.init({
		proxy: 'http://localhost/joomla3/'
    });
    
    gulp.watch(paths.src.sass + '/**/*.scss', css);
	gulp.watch(paths.src.js + '/**/*.js', javascript);
	gulp.watch(paths.src.php + '/**/*.php', php);
	gulp.watch(paths.src.img + '/**/*.{jpg,jpeg,png}', images);
	gulp.watch(paths.src.icons + '/**/*.svg', gulp.series(gulp.parallel(createSprite, deleteOldSpritesheet), gulp.parallel(moveSpriteStyle, moveSprite), cleanTemp));
}

// Tasks
gulp.task('default', watch);
gulp.task('watch', watch);
gulp.task('css', css);
gulp.task('js', javascript);
gulp.task('php', php);
gulp.task('images', images);
gulp.task('sprite', gulp.series(gulp.parallel(createSprite, deleteOldSpritesheet), gulp.parallel(moveSpriteStyle, moveSprite), cleanTemp));

// gulp.task('upload', function () {
//     const conn = ftp.create( {
// 		host:     'ftp.cgkdenhaag.nl',
// 		user:     'cgkdenha',
// 		password: 'CGK123dh1',
// 		parallel: 10
//     });
    
//     const globs = [
// 		'build/**/*',
//         'templateDetails.xml',
//         'index.php'
//     ];
    
//     return gulp.src(globs, { base: '.', buffer: false })
// 		.pipe( conn.newer('/web/test'))
// 		.pipe( conn.dest('/web/test'));
// });