var through = require('through2');

module.exports = function (opts) {

    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('custom', 'Streaming not supported'));
            return;
        }
        var str = String(file.contents);
        str = str.replace(/return \/\*\*\*\*\*\*\/ \(function\(modules\) \{ \/\/ webpackBootstrap[\S\s]*return/gm, 'return __webpackBootstrap')
        file.contents = new Buffer(str);
       
        cb(null, file);
    });
};
