'use strict';

var fs = require( 'fs' );

var gulp = require( 'gulp' );
var del = require( 'del' );
var rename = require( 'gulp-rename' );
var concat = require( 'gulp-concat' );
var uglify = require( 'gulp-uglify' );
var header = require( 'gulp-header' );
var replace = require( 'gulp-replace-task' );

var jsdoc = require( 'gulp-jsdoc3' );
var config = require('./jsdoc.json');

var packageContent = require('./package.json');

var DIR = {
	BUILD: 'build/',
	DOCS: 'docs/',
	EXAMPLES: 'build/examples',
	TEST: 'test/'
};

function buildHeader() {
	return "/**\n" +
		"  * @author Kai Salmen / https://kaisalmen.de\n" +
		"  * Development repository: https://github.com/kaisalmen/WWOBJLoader\n" +
		"  */" +
		"\n\n'use strict';\n\n";
};

gulp.task( 'clean-build', function () {
	return del.sync( DIR.BUILD );
});

gulp.task( 'bundle-loader-support', function () {
	var builtHeader = buildHeader();
	gulp.src(
		[
			'src/loaders/support/LoaderCommons.js',
			'src/loaders/support/LoaderWorkerSupport.js',
			'src/loaders/support/LoaderWorkerDirector.js'
		]
	)
	.pipe( concat( 'LoaderSupport.js' ) )
	.pipe( header( builtHeader ) )
	.pipe( replace( {
		patterns: [
			{
				match: /var WORKER_SUPPORT_VERSION.*/g,
				replacement: "var WORKER_SUPPORT_VERSION = '"+ packageContent.versions.loader_worker_support + "';"
			},
			{
				match: /var LOADER_WORKER_DIRECTOR_VERSION.*/g,
				replacement: "var LOADER_WORKER_DIRECTOR_VERSION = '"+ packageContent.versions.loader_worker_director + "';"
			}
		]
	} ) )
	.pipe( gulp.dest( DIR.BUILD ) )

	.pipe( uglify( { mangle: false } ) )
	.pipe( rename( { basename: 'LoaderSupport.min' } ) )
	.pipe( gulp.dest( DIR.BUILD ) );
} );

gulp.task( 'bundle-objloader2', function () {
	var builtHeader = buildHeader();
	gulp.src(
			[
				'src/loaders/OBJLoader2.js'
			]
		)
		.pipe( concat( 'OBJLoader2.js' ) )
		.pipe( header( builtHeader ) )
		.pipe( replace( {
			patterns: [
				{
					match: /var OBJLOADER2_VERSION.*/g,
					replacement: "var OBJLOADER2_VERSION = '"+ packageContent.versions.loader_obj2 + "';"
				}
			]
		} ) )
		.pipe( gulp.dest( DIR.BUILD ) )

		.pipe( uglify( { mangle: false } ) )
		.pipe( rename( { basename: 'OBJLoader2.min' } ) )
		.pipe( gulp.dest( DIR.BUILD ) );
} );


gulp.task( 'create-docs', function ( cb ) {
	del.sync( DIR.DOCS + 'fonts' );
	del.sync( DIR.DOCS + 'img' );
	del.sync( DIR.DOCS + 'scripts' );
	del.sync( DIR.DOCS + 'styles' );
	del.sync( DIR.DOCS + '*.html' );
	del.sync( DIR.DOCS + '*.md' );
	gulp.src(
			[
				'README.md',
				'src/loaders/support/LoaderCommons.js',
				'src/loaders/support/LoaderWorkerSupport.js',
				'src/loaders/support/LoaderWorkerDirector.js',
				'src/loaders/OBJLoader2.js'
			],
			{
				read: false
			}
		)
		.pipe( jsdoc( config, cb ) );

	gulp.src( [ 'CHANGELOG.md' ] )
		.pipe( gulp.dest( DIR.DOCS ) );
});


var exampleDef = {
	css: {
		common: "",
		main: "",
		link_all_ref: "<link href=\"../common/Common.css\" type=\"text/css\" rel=\"stylesheet\"/\>\n\<link href=\"./main.css\" type=\"text/css\" rel=\"stylesheet\"/\>",
		link_all: "",
		link_tabs: "",
		style_all: "",
		style_tabs: ""
	},
	js: {
		inline_code: "",
		inline_tabs: "",
		ext_code: "",
		ext_three: "<script src=\"../../node_modules/three/build/three.js\"\>\</script\>",
		ext_tabs: ""
	},
	file: {
		src: "",
		out: ""
	},
	dir: {
		dest: ""
	}
};

gulp.task( 'prepare-examples', function () {
	exampleDef.css.common = fs.readFileSync( 'test/common/common.css', 'utf8' );
	exampleDef.js.ext_tabs = "\t\t";
	exampleDef.dir.dest = DIR.EXAMPLES;
});


gulp.task( 'clean-examples', function () {
	del.sync( DIR.TEST + 'objloader2/' + 'main.html' );
	del.sync( DIR.TEST + 'objloader2/' + 'main.min.html' );
	del.sync( DIR.TEST + 'objloader2/' + 'main.src.html' );
	del.sync( DIR.TEST + 'objloader2/' + 'webgl_loader*.html' );
	del.sync( DIR.TEST + 'wwobjloader2/' + 'main.html' );
	del.sync( DIR.TEST + 'wwobjloader2/' + 'main.min.html' );
	del.sync( DIR.TEST + 'wwobjloader2/' + 'main.src.html' );
	del.sync( DIR.TEST + 'wwobjloader2/' + 'webgl_loader*.html' );
	del.sync( DIR.TEST + 'wwobjloader2stage/' + 'main.html' );
	del.sync( DIR.TEST + 'wwobjloader2stage/' + 'main.min.html' );
	del.sync( DIR.TEST + 'wwobjloader2stage/' + 'main.src.html' );
	del.sync( DIR.TEST + 'wwobjloader2stage/' + 'webgl_loader*.html' );
	del.sync( DIR.TEST + 'wwparallels/' + 'main.html' );
	del.sync( DIR.TEST + 'wwparallels/' + 'main.min.html' );
	del.sync( DIR.TEST + 'wwparallels/' + 'main.src.html' );
	del.sync( DIR.TEST + 'wwparallels/' + 'webgl_loader*.html' );
	del.sync( DIR.TEST + 'meshspray/' + 'main.html' );
	del.sync( DIR.TEST + 'meshspray/' + 'main.min.html' );
	del.sync( DIR.TEST + 'meshspray/' + 'main.src.html' );
	del.sync( DIR.TEST + 'meshspray/' + 'webgl_loader*.html' );
});


gulp.task( 'create-obj2-examples', function () {
	exampleDef.css.style_all = exampleDef.css.common;
	exampleDef.css.style_tabs = "\t\t\t";
	exampleDef.css.link_all = "";
	exampleDef.css.link_tabs = "";
	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderWorkerSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.inline_code = fs.readFileSync( 'test/objloader2/OBJLoader2Example.js', 'utf8' );
	exampleDef.js.inline_tabs = "\t\t\t";
	exampleDef.file.src = 'test/objloader2/template/main.three.html';
	exampleDef.dir.dest = 'test/objloader2';
	exampleDef.file.out = 'webgl_loader_obj2';
	buildExample();

	exampleDef.css.style_all = "";
	exampleDef.css.style_tabs = "";
	exampleDef.css.link_all =  "<link href=\"../common/Common.css\" type=\"text/css\" rel=\"stylesheet\"/\>";
	exampleDef.css.link_tabs = "\t\t";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./OBJLoader2Example.js\"\>\</script\>";
	exampleDef.js.inline_code = "";
	exampleDef.js.inline_tabs = "";
	exampleDef.file.out = 'main';
	buildExample();

	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.min.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.min.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.min.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./OBJLoader2Example.js\"\>\</script\>";
	exampleDef.file.out = 'main.min';
	buildExample();

	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/support/LoaderCommons.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/support/LoaderWorkerSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./OBJLoader2Example.js\"\>\</script\>";
	exampleDef.file.out = 'main.src';
	buildExample();
});


gulp.task( 'create-wwobj2-examples', function () {
	exampleDef.css.style_all = exampleDef.css.common;
	exampleDef.css.style_tabs = "\t\t\t";
	exampleDef.css.link_all = "";
	exampleDef.css.link_tabs = "";
	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderWorkerSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.inline_code = fs.readFileSync( 'test/wwobjloader2/WWOBJLoader2Example.js', 'utf8' );
	exampleDef.js.inline_tabs = "\t\t\t";
	exampleDef.file.src = 'test/wwobjloader2/template/main.three.html';
	exampleDef.dir.dest = 'test/wwobjloader2';
	exampleDef.file.out = 'webgl_loader_obj2_ww';
	buildExample();

	exampleDef.css.style_all = "";
	exampleDef.css.style_tabs = "";
	exampleDef.css.link_all =  "<link href=\"../common/Common.css\" type=\"text/css\" rel=\"stylesheet\"/\>";
	exampleDef.css.link_tabs = "\t\t";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./WWOBJLoader2Example.js\"\>\</script\>";
	exampleDef.js.inline_code = "";
	exampleDef.js.inline_tabs = "";
	exampleDef.file.out = 'main';
	buildExample();

	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.min.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.min.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.min.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./WWOBJLoader2Example.js\"\>\</script\>";
	exampleDef.file.out = 'main.min';
	buildExample();

	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/support/LoaderCommons.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/support/LoaderWorkerSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./WWOBJLoader2Example.js\"\>\</script\>";
	exampleDef.file.out = 'main.src';
	buildExample();
});


gulp.task( 'create-wwobj2_parallels-examples', function () {
	exampleDef.css.main = fs.readFileSync( 'test/wwparallels/main.css', 'utf8' );
	exampleDef.css.style_all = exampleDef.css.common + "\n" + exampleDef.css.main;
	exampleDef.css.style_tabs = "\t\t\t";
	exampleDef.css.link_all = "";
	exampleDef.css.link_tabs = "";
	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderWorkerSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.inline_code = fs.readFileSync( 'test/wwparallels/WWParallels.js', 'utf8' );
	exampleDef.js.inline_tabs = "\t\t\t";
	exampleDef.file.src = 'test/wwparallels/template/main.three.html';
	exampleDef.dir.dest = 'test/wwparallels';
	exampleDef.file.out = 'webgl_loader_obj2_ww_parallels';
	buildExample();

	exampleDef.css.style_all = "";
	exampleDef.css.style_tabs = "";
	exampleDef.css.link_all = exampleDef.css.link_all_ref;
	exampleDef.css.link_tabs = "\t\t";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./WWParallels.js\"\>\</script\>";
	exampleDef.js.inline_code = "";
	exampleDef.js.inline_tabs = "";
	exampleDef.file.out = 'main';
	buildExample();

	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.min.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.min.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.min.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./WWParallels.js\"\>\</script\>";
	exampleDef.file.out = 'main.min';
	buildExample();

	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/support/LoaderCommons.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/support/LoaderWorkerSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/support/LoaderWorkerDirector.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./WWParallels.js\"\>\</script\>";
	exampleDef.file.out = 'main.src';
	buildExample();
});


gulp.task( 'create-wwobj2_stage-examples', function () {
	exampleDef.css.main = fs.readFileSync( 'test/wwobjloader2stage/main.css', 'utf8' );
	exampleDef.css.style_all = exampleDef.css.common + "\n" + exampleDef.css.main;
	exampleDef.css.style_tabs = "\t\t\t";
	exampleDef.css.link_all = "";
	exampleDef.css.link_tabs = "";
	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderWorkerSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.inline_code = fs.readFileSync( 'test/wwobjloader2stage/WWOBJLoader2Stage.js', 'utf8' );
	exampleDef.js.inline_tabs = "\t\t\t";
	exampleDef.file.src = 'test/wwobjloader2stage/template/main.three.html';
	exampleDef.dir.dest = 'test/wwobjloader2stage';
	exampleDef.file.out = 'webgl_loader_obj2_ww_stage';
	buildExample();

	exampleDef.css.style_all = "";
	exampleDef.css.style_tabs = "";
	exampleDef.css.link_all = exampleDef.css.link_all_ref;
	exampleDef.css.link_tabs = "\t\t";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./WWOBJLoader2Stage.js\"\>\</script\>";
	exampleDef.js.inline_code = "";
	exampleDef.js.inline_tabs = "";
	exampleDef.file.out = 'main';
	buildExample();

	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.min.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.min.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.min.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./WWOBJLoader2Stage.js\"\>\</script\>";
	exampleDef.file.out = 'main.min';
	buildExample();

	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/support/LoaderCommons.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/support/LoaderWorkerSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./WWOBJLoader2Stage.js\"\>\</script\>";
	exampleDef.file.out = 'main.src';
	buildExample();
});


gulp.task( 'create-meshspray-examples', function () {
	exampleDef.css.main = "";
	exampleDef.css.style_all = exampleDef.css.common;
	exampleDef.css.style_tabs = "\t\t\t";
	exampleDef.css.link_all = "";
	exampleDef.css.link_tabs = "";
	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderWorkerSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.inline_code = fs.readFileSync( 'test/meshspray/MeshSpray.js', 'utf8' );
	exampleDef.js.inline_tabs = "\t\t\t";
	exampleDef.file.src = 'test/meshspray/template/main.three.html';
	exampleDef.dir.dest = 'test/meshspray';
	exampleDef.file.out = 'webgl_loader_ww_meshspray';
	buildExample();

	exampleDef.css.style_all = "";
	exampleDef.css.style_tabs = "";
	exampleDef.css.link_all =  "<link href=\"../common/Common.css\" type=\"text/css\" rel=\"stylesheet\"/\>";
	exampleDef.css.link_tabs = "\t\t";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./MeshSpray.js\"\>\</script\>";
	exampleDef.js.inline_code = "";
	exampleDef.js.inline_tabs = "";
	exampleDef.file.out = 'main';
	buildExample();

	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.min.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../build/LoaderSupport.min.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../build/OBJLoader2.min.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./MeshSpray.js\"\>\</script\>";
	exampleDef.file.out = 'main.min';
	buildExample();

	exampleDef.js.ext_three = "<script src=\"../../node_modules/three/build/three.js\"\>\</script\>";
	exampleDef.js.ext_code = "";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/support/LoaderCommons.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/support/LoaderWorkerSupport.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/OBJLoader2.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"../../src/loaders/support/LoaderWorkerDirector.js\"\>\</script\>\n";
	exampleDef.js.ext_code += "<script src=\"./MeshSpray.js\"\>\</script\>";
	exampleDef.file.out = 'main.src';
	buildExample();
});


function buildExample() {
	var js_inline_code = exampleDef.js.inline_code;
	var js_ext_code = exampleDef.js.ext_code;
	var js_ext_three = exampleDef.js.ext_three;
	var css_style_all = exampleDef.css.style_all;
	var css_link_all = exampleDef.css.link_all;

	if ( js_inline_code != "" ) {

		if ( exampleDef.js.inline_tabs != "" ) {

			js_inline_code = exampleDef.js.inline_tabs + js_inline_code;
			js_inline_code = js_inline_code.replace( /\n/g, '\n' + exampleDef.js.inline_tabs );

		}

	}

	if ( js_ext_three != "" ) {

		if ( exampleDef.js.ext_tabs != "" ) {

			js_ext_three = exampleDef.js.ext_tabs + js_ext_three;
			js_ext_three = js_ext_three.replace( /\n/g, '\n' + exampleDef.js.ext_tabs );

		}

	}

	if ( js_ext_code != "" ) {

		if ( exampleDef.js.ext_tabs != "" ) {

			js_ext_code = exampleDef.js.ext_tabs + js_ext_code;
			js_ext_code = js_ext_code.replace( /\n/g, '\n' + exampleDef.js.ext_tabs );

		}

	}

	if ( css_style_all != "" ) {

		if ( exampleDef.css.style_tabs != "" ) {

			css_style_all = exampleDef.css.style_tabs + css_style_all;
			css_style_all = css_style_all.replace( /\n/g, '\n' + exampleDef.css.style_tabs );

		}
		css_style_all = "\n\t\t\<style\>\n" + css_style_all + "\n\t\t\</style\>";

	}

	if ( css_link_all != "" ) {

		if ( exampleDef.css.link_tabs != "" ) {

			css_link_all = exampleDef.css.link_tabs + css_link_all;
			css_link_all = css_link_all.replace( /\n/g, '\n' + exampleDef.css.link_tabs );

		}

	}

	gulp.src( [ exampleDef.file.src ] )
		.pipe( replace( {
			patterns: [
				{
					match: /\/\*STUB_JS_THREE\*\//g,
					replacement: js_ext_three
				},
				{
					match: /\/\*STUB_JS_EXT\*\//g,
					replacement: js_ext_code
				},
				{
					match: /\/\*STUB_JS_INLINE\*\//g,
					replacement: js_inline_code
				},
				{
					match: /\/\*STUB_CSS_LINK\*\//g,
					replacement: css_link_all
				},
				{
					match: /\/\*STUB_CSS_EMBED\*\//g,
					replacement: css_style_all
				}
			]
		} ) )
		.pipe( rename( { basename: exampleDef.file.out } ) )
		.pipe( gulp.dest( exampleDef.dir.dest ) );
};

gulp.task(
	'build-examples',
	[
		'prepare-examples',
		'create-obj2-examples',
		'create-wwobj2-examples',
		'create-wwobj2_stage-examples',
		'create-wwobj2_parallels-examples',
		'create-meshspray-examples'
	]
);


gulp.task(
	'default',
	[
		'clean-build',
		'bundle-loader-support',
		'bundle-objloader2',
		'create-docs',
		'build-examples'
	]
);
