// adding program wrapper for the command in the command line.
const path = require("path");
const colors = require('colors');
const fs = require("fs");
const icons = require('./icons.js');

function cleanArgs(args = '') {
    if (args == null)
        return [];
    console.log(args);

    args = args.trim();
    if (args.length == 0)
        return;

    return args.match(/".*"|'.*'|[^\s]+/gmi).map(m => m + '');
};


module.exports = async function (cmndPath, arglist, options) {
    cmndPath = path.resolve(cmndPath);

    if (!fs.existsSync(cmndPath))
        throw new Error('Command not found. You must specifiy the full path or ./ for files in current directory.');

    if (options.icon == null || options.icon.trim() == '') {
        options.icon = 'gear';
    }

    var config = {
        iconPath: await icons.resolveIconPath(options.icon),
        args: cleanArgs(arglist),
        cmnd: path.basename(cmndPath),
        startIn: path.dirname(cmndPath),
    }

    if (options.copyIcon === true) {
        var newIconPath =
            cmndPath + '.zwrap.icon' + path.extname(config.iconPath);
        await fs.copyFile(config.iconPath, newIconPath);
        config.iconPath = path.relative(config.startIn, newIconPath);
    }

    await fs.writeFileSync(cmndPath + '.zwrap.json', JSON.stringify(config, null, 2));
};