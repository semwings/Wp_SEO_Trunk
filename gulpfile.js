const { src, dest, parallel, watch, series } = require( "gulp" );
const gulp = require( "gulp" );
const postcss = require( "gulp-postcss" );
const rename = require( "gulp-rename" );
const zip = require( "gulp-zip" );
const sourcemaps = require( "gulp-sourcemaps" );
const rtlcss = require( "gulp-rtlcss" );
const fs = require( "fs" );
const spawn = require('cross-spawn');
const del = require( "del" );
const paths = require( "./config/webpack/paths" );


const cssFolder = "css/src/";
const cssDestLive = "css/dist/";
const vendorPrefixed = "vendor_prefixed/";

const artifactsFiles = [
	"css/dist/**/*",
	"packages/js/src/**/*.js",
	"packages/js/tests/**/*.js",
	"admin/**/*.php",
	"frontend/**/*.php",
	"inc/**/*.php",
	"src/**/*.php",
	"config/**/*.php",
	"package.json",
	"wp-seo-main.php",
	"wp-seo.php",
	"index.php",
	"README.md",
	"tests/**/*.php",
];
const artifactsFolder = "artifacts/";
const artifactsCompressed = "artifacts.zip";
const artifactsCompressedDest = "./";

const files = fs.readdirSync( "css/src" );
const json = JSON.parse( fs.readFileSync( "package.json" ) );

const pluginVersion = paths.flattenVersionForFile( json.yoast.pluginVersion );

var css = [];

/**
 * Css task.
 * */
files.forEach( function( task ) {
	gulp.task( task, function() {
		return src( cssFolder + task )
			.pipe( sourcemaps.init() )
			.pipe( postcss() )
			.pipe( rename( {
				suffix: "-" + pluginVersion,
			} ) )
			.pipe( sourcemaps.write( "." ) )
			.pipe( dest( cssDestLive ) );
	} );

	css.push( task );

	gulp.task( task + "-rtl", function() {
		return src( cssFolder + task )
			.pipe( sourcemaps.init() )
			.pipe( postcss() )
			.pipe( rename( {
				suffix: "-" + pluginVersion + "-rtl",
			} ) )
			.pipe( rtlcss() )
			.pipe( sourcemaps.write( "." ) )
			.pipe( dest( cssDestLive ) );
	} );

	css.push( task + "-rtl" );
} );

/**
 * Clean up the old css files.
 */
gulp.task( "clean:build-assets-css", function() {
	return del(
		[ cssDestLive + "*.css*", "!" + cssDestLive + "monorepo*.css" ]
	);
} );

/**
 * Clean up the old js files.
 */
gulp.task( "clean:build-assets-js", function() {
	return del(
		[ "js/dist", cssDestLive + "monorepo*.css" ]
	);
} );

gulp.task( "clean:build-assets", gulp.parallel( "clean:build-assets-js", "clean:build-assets-css" ) );

/**
 * Clean up the old css files.
 */
gulp.task( "clean:vendor-prefixed", function() {
	return del(
		[ vendorPrefixed + "**", "!" + vendorPrefixed, "!" + vendorPrefixed + "*.gitignore" ]
	);
} );

/**
 * Run `composer install`.
 */
gulp.task( "shell:composer-install", function( cb ) {
	spawn( "composer", [ "install" ], { stdio: "inherit" } )
		.on( "error", cb )
		.on( "close", code => code ? cb( new Error( code ) ) : cb() );
} );

/**
 * Run `composer compile-di`.
 */
gulp.task( "shell:compile-dependency-injection-container", function( cb ) {
	spawn( "composer", [ "compile-di" ], { stdio: "inherit" } )
		.on( "error", cb )
		.on( "close", code => code ? cb( new Error( code ) ) : cb() );
} );

/**
 * Run `rm ./src/generated/container.php.meta`.
 */
gulp.task( "shell:remove-dependency-injection-meta", function( cb ) {
	spawn( "rm", [ "./src/generated/container.php.meta" ], { stdio: "inherit" } )
		.on( "error", cb )
		.on( "close", code => code ? cb( new Error( code ) ) : cb() );
} );

/**
 * Run `composer install --prefer-dist --optimize-autoloader --no-dev --no-scripts`.
 */
gulp.task( "shell:composer-install-production", function( cb ) {
	spawn( "composer", [ "install", "--prefer-dist", "--optimize-autoloader", "--no-dev", "--no-scripts" ], { stdio: "inherit" } )
		.on( "error", cb )
		.on( "close", code => code ? cb( new Error( code ) ) : cb() );
} );

/**
 * Build the js files through webpack.
 */
gulp.task( "shell:webpack", function( cb ) {
	spawn.sync( "yarn", [ "cross-env", "NODE_ENV=development" ], { stdio: "inherit" } );
	spawn( "yarn", [ "run", "wp-scripts", "build", "--config", "config/webpack/webpack.config.js" ], { stdio: "inherit" } )
		.on( "error", cb )
		.on( "close", code => code ? cb( new Error( code ) ) : cb() );
} );

/**
 * Setup the watcher.
 */
gulp.task( "watch", function() {
	files.forEach( function( task ) {
		gulp.watch( cssFolder + task, gulp.parallel( task ) );
		gulp.watch( cssFolder + task, gulp.parallel( task + "-rtl" ) );
	} );
} );

gulp.task( "build:js", gulp.series( "clean:build-assets-js", "shell:webpack" ) );
gulp.task( "build:css", gulp.series( "clean:build-assets-css", gulp.parallel( css ) ) );
gulp.task( "default", gulp.parallel( "build:js", "build:css" ) );

/**
 * Clean artifacts preparation folder and compressed artifacts.
 */
gulp.task( "artifact:clean", function() {
	del(
		[
			artifactsFolder + "**",
			"!" + artifactsFolder,
			"!" + artifactsFolder + "*.gitignore",
			artifactsCompressedDest + artifactsCompressed
		]
	);
} );

/**
 * Copy all files that need to be included in artifacts.
 */
gulp.task( "artifact:copy", function() {
	del(
		[ artifactsFolder + "**", "!" + artifactsFolder, "!" + artifactsFolder + "*.gitignore" ]
	);
	return gulp.src( artifactsFiles, { base: "." } )
		.pipe( gulp.dest( artifactsFolder ) );
} );

/**
 * Compress all files included in artifacts folder.
 */
gulp.task( "artifact:compress", function() {
	del(
		[ artifactsCompressedDest + "**", "!" + artifactsCompressedDest, "!" + artifactsCompressedDest + "*.gitignore" ]
	);
	return gulp.src( artifactsFolder + "*" )
		.pipe( zip( artifactsCompressed ) )
		.pipe( gulp.dest( artifactsCompressedDest ) );
} );
