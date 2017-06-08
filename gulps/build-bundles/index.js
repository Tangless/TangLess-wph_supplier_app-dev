var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

module.exports = function (opts) {

    var pathMap = {entry:{},externals:{}};
    var modsMap = {};
    

    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('custom', 'Streaming not supported'));
            return;
        }
         var str = path.relative(file.base, file.path);
         str = str.substr(0,str.lastIndexOf('.'));
         var arr = str.split(/[\\/]/);
         arr.pop();
         var arr2 = str.split(/[\\/]/);
         if(arr[0]=="node_modules"){
             modsMap[arr.slice(1).join('/')] = arr.join('/');
             pathMap.externals[arr.slice(1).join('/')] = arr.slice(1).join('/');
         }else{
             pathMap.externals['views'+'/'+arr.join('/')] = 'views'+'/'+arr.join('/');
         }
         arr2.unshift(opts.path);
         
         if(path.extname(file.path)==".ts"){
             if(/(\s|^)import [^\n;]+?['"](\.\/|\.\.\/).+?['"]/.test(String(file.contents))){
                pathMap.entry[arr.join('/')] = arr2.join('/');
             }
         }else{
             if(/(\s|^)define\s*\([^\{\)]+?['"](\.\/|\.\.\/).+?['"]/.test(String(file.contents))){
                pathMap.entry[arr.join('/')] = arr2.join('/');
            }
         }
        cb();
    }, function (cb) {
        var mapFile = new gutil.File({
            path: "webpack.json",
            contents: new Buffer(JSON.stringify(pathMap, null, '  '))
        });
        this.push(mapFile);
        var modFile = new gutil.File({
            path: "node_modules.json",
            contents: new Buffer(JSON.stringify(modsMap, null, '  ').replace(/"node_modules/g,'nodeModules+"'))
        });
        this.push(modFile);
        cb();
    });
};
