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
        str = "(function(factory) {	if(typeof exports === 'object' && typeof module === 'object'){		module.exports = factory();	}else if(typeof define === 'function' && define.amd){		define(factory);	}})(function() { return '"+ str.replace(/'/g,"\\'") +"'});";
        file.contents = new Buffer(str);
        cb(null, file);
    });
};





		