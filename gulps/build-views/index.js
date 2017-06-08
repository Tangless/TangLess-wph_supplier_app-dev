var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

module.exports = function (opts) {

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
         var arr = str.split(/[\\/]/);
         arr.pop();
         modsMap[arr.join('/')] = arr.join('/');
         cb();
    }, function (cb) {
        var modFile = new gutil.File({
            path: "views.json",
            contents: new Buffer(JSON.stringify(modsMap, null, '  '))
        });
        this.push(modFile);
        cb();
    });
};
