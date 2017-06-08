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
         str = str.substr(0,str.lastIndexOf('.con.'));
         var arr = str.replace(/controllers[\\/]/,'').split(/[\\/]/);
         var arr2 = str.split(/[\\/]/);
         modsMap[arr.join('/')] = arr2.join('/')+'.con';
         cb();
    }, function (cb) {
        var modFile = new gutil.File({
            path: "controllers.json",
            contents: new Buffer(JSON.stringify(modsMap, null, '  '))
        });
        this.push(modFile);
        cb();
    });
};
