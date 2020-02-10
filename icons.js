// reads icons from the list or the file system.
const path = require("path");
const colors = require('colors');
const fs = require("fs");
const toIco = require('to-ico');
const encodeImageStream = require('encode-image-stream');
const concatStream = require('concat-stream');
const streamifer = require('streamifier');
const resizeImg = require('resize-img');
const util = require('util');


async function imgStreamToBase64(buf) {
    // create the temp file.
    return await (new Promise((resolve, reject) => {
        try {
            streamifer.createReadStream(buf)
                .pipe(encodeImageStream())
                .pipe(concatStream((buf) => {
                    resolve(buf.toString('utf-8'));
                }));
        }
        catch (err) {
            reject(err);
        }

    }));
}


function fromDir(startPath, filter, subfolders = true) {

    if (!fs.existsSync(startPath)) {
        throw new Error('Cannot find folder ' + startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    var found = [];
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            if (subfolders)
                fromDir(filename, filter); //recurse
        }
        else if (filename.indexOf(filter) >= 0) {
            found.push(filename);
        };
    };
    return found;
};


module.exports.list = function (match) {
    // list all current icons.
    var names = fromDir(__dirname + '/default_icons', '.png');
    var all = names.map((fn) => {
        return {
            path: fn,
            name: path.basename(fn, '.png'),
        };
    });

    all.sort((a, b) => {
        var aidx = a.name.indexOf(match);
        var bidx = b.name.indexOf(match);
        if (aidx == bidx)
            return a.name.length - b.name.length;
        else return aidx - bidx;
    });

    if (match == null || match.length == 0)
        return all;
    var matchRegExp = new RegExp('.*' + match + '.*', 'gmi');
    return all.filter(i => i.name.match(matchRegExp));
}

module.exports.resolveIconPath = async function (fpath) {
    if (fpath == null)
        throw new Error('Please provide an icon path or name.');

    if (!fs.existsSync(path.resolve(fpath))) {
        // try icon name.   
        var fromName = this.list(fpath);
        if (fromName.length == 0)
            throw new Error('Icon file with path/name ' + fpath + ' not found.');
        fpath = fromName[0].path;
    }
    else fpath = path.resolve(fpath);
    return fpath;
}


// returns 
module.exports.getIconAsBase64String = async function (fn, makeIco = true, size = { width: 64, height: 64 }) {
    fn = await this.resolveIconPath(fn);
    var fbuf = await util.promisify(fs.readFile)(fn);
    fbuf = await resizeImg(fbuf, size);
    if (makeIco) {
        fbuf = await toIco(fbuf);
    }
    return await imgStreamToBase64(fbuf);
}

