var path = require('path');
var argv = require('yargs').argv;
var domain = argv.domain || "wph.com";
var port = domain=='wph.com'?':9999':'';
var protocol = argv.http || 'http';
var apiurl = argv.api || 'http://a.88ba.com';
var appkey = domain=='wanpinghui.com'?'211cf33f06ece9b9934e91612362e2b8':'23604735bd9420bbe97a73ddd524cf73';
var dist = "/dist";

var metaData = {
    "VIEWSSRC": path.join(process.cwd(),"/src/node_modules/views").replace(/\\/g,'/'),
    "NODEJSSRC": path.join(process.cwd(),"/src/node_modules/nodejs").replace(/\\/g,'/'),
    "PHPSRC": path.join(process.cwd(),"/src/node_modules/php").replace(/\\/g,'/'),
    "VIEWSDIST": path.join(process.cwd(),dist+"/node_modules/views").replace(/\\/g,'/'),
    "NODEJSDIST": path.join(process.cwd(),dist+"/node_modules/nodejs").replace(/\\/g,'/'),
    "PHPDIST": path.join(process.cwd(),dist+"/node_modules/php").replace(/\\/g,'/'),
    "IMTOCKEN": "fde1aab0afa2589bbf2e3144ce3029a8",
    "URL@": function(url){
        return url;
    },
    "APIURL" : apiurl,
    "APPKEY" : appkey,
    "VIEWSURL" : protocol+'://sapp.'+domain+port,
    "SITEPORT" : (protocol=="http"?9999:9898),
    "HTTP": protocol+"://",
    "SITES": '{"app.'+domain+port+'":"m","sapp.'+domain+port+'":""}',
    "VIEWSSITE": 'sapp.'+domain+port,
    "SSITE" : protocol+"://app."+domain+port,
    "CURURL":"",//当前路径的url
    "MODURL":""//当前模块的路径
}

var config = {
    "VIEWS": metaData.VIEWSSRC,
    "NODEJS": metaData.NODEJSSRC,
    "PHP": metaData.PHPSRC,
    "_VIEWS": metaData.VIEWSDIST,
    "_NODEJS": metaData.NODEJSDIST,
    "_PHP":metaData.PHPDIST,
    "NODESERVER" : metaData.NODEJSDIST
    //"BOOTSTRAP": SRC+"/views/global/css/bootstrap"
};

var gulp = require("gulp");
var runSequence = require('run-sequence');
var ts = require("gulp-typescript");
var tsProject = ts.createProject(config.VIEWS+"/tsconfig.json", {
    //baseUrl: "/xampp/htdocs/typs/src/views",
    typeRoots: ["types"]
});
var nodetsProject = ts.createProject(config.NODEJS+"/tsconfig.json", {
    //baseUrl: "/xampp/htdocs/typs/src/nodejs",
    typeRoots: ["types"]
});

var merge = require("merge2");
var changed = require("gulp-changed");
var clean = require('gulp-clean');
var gutil = require("gulp-util");
var typedoc = require("gulp-typedoc");
var replace = require('gulp-replace');
var rename = require("gulp-rename");
var filter = require('gulp-filter');
var sass = require('gulp-sass');
var fileinclude = require("gulp-file-include");
var buildBundles = require("./gulps/build-bundles");
var buildControllers = require("./gulps/build-controllers");
var buildAmd = require("./gulps/build-amd");
var buildViews = require("./gulps/build-views");
var replaceMeta = require("./gulps/replace-meta");
var consume = require("./gulps/consume");
var htmlmin = require('gulp-htmlmin');
var webpack = require('webpack-stream');
var named = require('vinyl-named');
var autoprefixer = require("gulp-autoprefixer");
var childProcess = require('child_process');


gulp.task('clean', function () {
    return merge([
        gulp.src(config._VIEWS).pipe(clean()),
        gulp.src(config._NODEJS).pipe(clean())
    ])
});
gulp.task("tsc", function () {
    var stime = Date.now(); 
    var bundleFilter = filter('**/index.js');
    var tsResult = gulp.src(config.VIEWS + "/**/*.ts")
        .pipe(changed(config._VIEWS, { extension: '.js' }))
        .pipe(replaceMeta(metaData))
        .pipe(tsProject())
    return merge([
        tsResult.js.pipe(gulp.dest(config._VIEWS))
        .pipe(bundleFilter)
        .pipe(rename(function (path) {
            var arr = path.dirname.split(/[\\/]/);
            var mname = arr.pop();
            path.dirname = arr.join('/');
            path.basename = mname;
        }))
        .pipe(gulp.dest(config._VIEWS))
        
    ]);
});
gulp.task("nodets", function () {
    var stime = Date.now(); 
    var tsResult = gulp.src(config.NODEJS + "/**/*.ts")
        .pipe(changed(config._NODEJS, { extension: '.js' }))
        .pipe(replaceMeta(metaData))
        .pipe(nodetsProject())
    return merge([
        tsResult.js.pipe(gulp.dest(config._NODEJS)),
    ]);
});
gulp.task("php", function () {
    var stime = Date.now();
    return gulp.src([config.PHP + "/**/*"])
        .pipe(changed(config._PHP))
        .pipe(gulp.dest(config._PHP))
        
});
gulp.task("js", function () {
    var stime = Date.now();
    var bundleFilter = filter('**/index.js');
    return gulp.src(config.VIEWS + "/**/*.js")
        .pipe(changed(config._VIEWS))
        .pipe(replaceMeta(metaData))
        .pipe(gulp.dest(config._VIEWS))
        .pipe(bundleFilter)
        .pipe(rename(function (path) {
            var arr = path.dirname.split(/[\\/]/);
            var mname = arr.pop();
            path.dirname = arr.join('/');
            path.basename = mname;
        }))
        .pipe(gulp.dest(config._VIEWS))
        
});
gulp.task('sass', function () {
    var stime = Date.now();
  return gulp.src(config.VIEWS + "/**/*.scss")
    .pipe(changed(config._VIEWS, { extension: '.css' }))
    .pipe(replaceMeta(metaData))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(config._VIEWS))
    
});

gulp.task("webpack", function (callback) {
    var stime = Date.now();
    return gulp.src('src/entry.js')
    //.pipe(named())
    .pipe(webpack( require("./webpack.config.js") ))
    //.pipe(extractWebpack())
    //.pipe(replace(/return \/\*\*\*\*\*\*\/ \(function\(modules\) \{ \/\/ webpackBootstrap[\S\s]*\/\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\//m, 'return __webpackBootstrap'))
    .pipe(gulp.dest(config._VIEWS))
    
    // return webpack(Object.create(require("./webpack.config.js")), function (err, stats) {
    //     if (err) throw new gutil.PluginError("webpack", err);
    //     gutil.log("[webpack]", stats.toString({
    //         // output options
    //     }));
    //     callback();
    // });
});
gulp.task("html", function () {
    var stime = Date.now();
    var bundleFilter = filter('**/index.html');
    //var metaFilter = filter('**/*.+(html)');
    return gulp.src([config.VIEWS + "/**/*.html","!"+config.VIEWS + "**/node_modules/**/*.html"])
        .pipe(changed(config._VIEWS))
        .pipe(replaceMeta(metaData))
        .pipe(gulp.dest(config._VIEWS))
        .pipe(bundleFilter)
        .pipe(fileinclude({ basepath: '@file' }))
        .pipe(htmlmin({
            minifyJS: true,
            minifyCSS: true,
            removeComments: true,//清除HTML注释
            collapseWhitespace: true//压缩HTML
        }))
        .pipe(buildAmd())
        .pipe(rename(function (path) {
            var arr = path.dirname.split(/[\\/]/);
            var mname = arr.pop();
            path.dirname = arr.join('/');
            path.basename = mname;
            path.extname = ".js";
        }))
        .pipe(gulp.dest(config._VIEWS))    
});
gulp.task("files", function () {
    var stime = Date.now();
    return gulp.src([config.VIEWS + "/**/*.!(js|ts|scss|idx|json|html)","!"+config.VIEWS + "/**/*.d.ts"])
        .pipe(changed(config._VIEWS))
        .pipe(gulp.dest(config._VIEWS))
        
});
gulp.task("css", function () {
    var stime = Date.now();
    return gulp.src([config.VIEWS + "/**/*.css"])
        .pipe(changed(config._VIEWS))
        .pipe(replaceMeta(metaData))
        .pipe(gulp.dest(config._VIEWS))
        
});
gulp.task("nodejs", function () {
    var stime = Date.now();
    return gulp.src([config.NODEJS + "/**/*","!"+config.NODEJS + "/**/*.ts"])
       .pipe(changed(config._NODEJS))
        .pipe(fileinclude({ basepath: '@root' }))
        .pipe(replaceMeta(metaData))
        .pipe(gulp.dest(config._NODEJS))
});

gulp.task("buildControllers", function () {
    var stime = Date.now();
    return gulp.src([config.NODEJS + "/**/controllers/**/*.con.+(js|ts)"])
        .pipe(buildControllers())
        .pipe(gulp.dest(config._NODEJS))
        
});
gulp.task("buildViews", function () {
    var stime = Date.now();
    return gulp.src(config.VIEWS + "/**/index.html")
        .pipe(buildViews())
        .pipe(gulp.dest(config._VIEWS))
        
});
gulp.task("buildBundles", function () {
    var stime = Date.now();
    return gulp.src([config.VIEWS + "/**/index.+(js|html|ts)"])
        .pipe(buildBundles({path:config._VIEWS}))
        .pipe(gulp.dest("./"))
        
});
gulp.task("includeFiles",function(){
    var stime = Date.now();
    return gulp.src([config.VIEWS + "/**/*.idx"])
        .pipe(fileinclude({ basepath: '@root' }))
        .pipe(replaceMeta(metaData))
        .pipe(rename(function (path) {
            var arr = path.basename.split("-");
            path.basename = arr[0];
            path.extname = "."+arr[1];
        }))
        .pipe(gulp.dest(config._VIEWS))
        
});

gulp.task('tscUpdate', function (callback) { runSequence(['tsc', "buildBundles"], 'webpack', "includeFiles", callback) });
gulp.task('jsUpdate', function (callback) { runSequence(['js', "buildBundles"], 'webpack', "includeFiles", callback) });
gulp.task('htmlUpdate', function (callback) { runSequence(['html',"buildBundles",'buildViews'], 'webpack', "includeFiles", callback) });
gulp.task('sassUpdate', function (callback) { runSequence('sass', 'webpack', "includeFiles", callback) });
gulp.task('cssUpdate', function (callback) { runSequence('css', 'webpack', "includeFiles", callback) });
gulp.task('filesUpdate', function (callback) { runSequence('files', "includeFiles", callback) });


gulp.task('watch', function (callback) {
    gulp.watch([config.VIEWS + "/**/*.ts","!"+config.VIEWS+"/node_modules/**/*"], ['tscUpdate']);
    gulp.watch([config.VIEWS + "/**/*.js","!"+config.VIEWS+"/node_modules/**/*"], ['jsUpdate']);
    gulp.watch([config.VIEWS + "/**/*.scss","!"+config.VIEWS+"/node_modules/**/*"], ['sassUpdate']);
    gulp.watch([config.VIEWS + "/**/*.css","!"+config.VIEWS+"/node_modules/**/*"], ['cssUpdate']);
    gulp.watch([config.VIEWS + "/**/*.!(js|ts|scss|d.ts|json|html|css)","!"+config.VIEWS+"/node_modules/**/*"], ['filesUpdate']);
    gulp.watch([config.VIEWS + "/**/*.html","!"+config.VIEWS+"/node_modules/**/*"], ['htmlUpdate']);
    gulp.watch([config.NODEJS + "/**/*","!"+config.NODEJS + "/**/*.ts","!"+config.NODEJS+"/node_modules/**/*"], ['nodejs']);
    gulp.watch([config.NODEJS + "/**/*.ts","!"+config.NODEJS+"/node_modules/**/*"], ['nodets']);
    callback();
});

gulp.task('server', function(callback){
    console.log('start.....')
    var server = childProcess.spawn("node-dev",[config.NODESERVER],{shell:true});
    server.stdout.on("data", (data) => {
        console.log(data.toString());
    });
    server.stderr.on('data', function (data) { 
        console.log('服务器错误：\n' + data); 
    }); 
    server.on('exit', function (code, signal) { 
        console.log('服务器已关闭'); 
    }); 
    server.on('error', (err) => {  
        console.log(err);  
    });  
    callback();
});


gulp.task("tscdoc", function () {
    var stime = Date.now();
    return gulp.src([config.VIEWS + "/**/*.ts", '!' + config.VIEWS + "/**/*.d.ts"])
        .pipe(typedoc({
            // TypeScript options (see typescript docs) 
            module: "amd",
            target: "es5",
            includeDeclarations: false,
            // Output options (see typedoc docs) 
            out: config._VIEWS + "/docs",
            //json: "output/to/file.json",
            // TypeDoc options (see typedoc docs) 
            theme : "minimal",
            name: "tomato",
            ignoreCompilerErrors: false,
            version: true,
        }))
        
});











gulp.task('build', function (callback) { runSequence('tsc', 'nodets', 'sass', 'files', ['js','html','php','nodejs','buildViews','buildControllers','buildBundles'],"webpack", "includeFiles",callback) });
gulp.task('start', function(callback){runSequence('build', "watch", "server", callback) })
gulp.task('default', ["start"]);
//gulp.task('build', function (callback) { runSequence('clean', 'tsc', ['js','sass', 'html','nodejs','nodets','php','config'], 'buildBundles' ,'webpack', 'watch',  callback) });
//gulp.task('build', function (callback) { runSequence( "webpack", callback) });


var createView = function(isPage, viewPath, callback){
    var pathArr = viewPath.split(/[\\/]/);
    var viewName = pathArr.pop();
    var pathArr2 = viewPath.split(/[\\/]/);
    var type = isPage?"page":"module";
    pathArr2.pop();
    pathArr2.splice(1,0,'controllers');
    return merge([
        gulp.src(config.VIEWS + "/_create/**/"+type+".*")
        .pipe(replace(/`{ID}`/gm, viewName))
        .pipe(rename(function (path) {
            path.basename = "index";
            if(path.extname == ".tp"){
                path.extname = ".html";
                path.dirname = pathArr.join('/')+'/'+viewName+'Tpl';
            }else if(path.extname == ".ac"){
                path.extname = ".ts";
                path.dirname = pathArr.join('/')+'/'+viewName;
            }
            console.log("create "+type+": "+ config.VIEWS + "/" +  path.dirname + '/' + path.basename + path.extname);
        }))
        .pipe(gulp.dest(config.VIEWS)),
        gulp.src(config.NODEJS + "/_create/controller/**/"+type+".*")
        .pipe(replace(/`{PATH}`/gm, viewPath))
        .pipe(rename(function (path) {
            path.extname = ".ts";
            path.dirname = pathArr2.join('/');
            path.basename = viewName+'.con';
            console.log("create "+type+": "+ config.NODEJS + "/" +  path.dirname + '/' + path.basename + path.extname);
        }))
        .pipe(gulp.dest(config.NODEJS))
    ])
};

gulp.task('create-view', function(callback){
    if(argv.path){
        return createView(argv.page,argv.path,callback)
    }else{
       callback(); 
    }
});

gulp.task('bootstrap',function(){
    return gulp.src("./bootstrap/bootstrap.scss")
        .pipe(sass().on('error', sass.logError))
        //.pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
        .pipe(gulp.dest(config.BOOTSTRAP))
});


