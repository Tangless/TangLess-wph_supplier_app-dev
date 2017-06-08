var through = require('through2');
module.exports = function (opts) {

    var modsMap = {};
    
    return through.obj(function (file, enc, cb) {
        cb();
    }, function (cb) {
        console.log((Date.now()-opts)/1000)
        cb();
    });
};
