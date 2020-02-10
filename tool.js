#!/usr/bin/env node
// command line tool for commands implementation.

const fs = require('fs');
const extend = require('extend');
const path = require('path');
const colors = require('colors');
const icons = require('./icons');
const packageAsJson = require('./package.json');

var cmndr = require('commander');

var arglist = null;

// list all icons
cmndr.description('Command line tool for wrapping command line into an app that can run at startup and has an icon. (with exit context menu).')
    .version(packageAsJson.version);

cmndr.command('list_icons')
    .description('Lists available icons')
    .option('-n, --name [value]', 'Search icons by name, you may provide any name or partial name both here and in the "make" command.', null, null)
    .action((cmnd) => {
        var icos = icons.list(cmnd.name);
        if (icos.length == 0)
            console.log(' . No icons found.');
        else {
            console.log('-> Found:'.cyan);
            console.log(icos.map(i => ' . '.gray + i.name + ' @ ' + i.path.gray).join('\n'));
        }
    });

cmndr.command('make <name>')
    .description('Make the command json object that can be later run. Name is the command names. NOTE! arguments can be added after the symbol ~.\n example> zwrap make somthing.bat --copyIcon ~ -a arg1 ')
    .option('-i, --icon [value]', 'The icon name or icon path to use with the command.', null, 'script_gear')
    .option('--copyIcon', 'Copy the icon to the destination')
    .action((cmndPath, options) => {
        require('./wrapProgram.js')(cmndPath, arglist, options);
    });

cmndr.on('command:*', function () {
    console.error(' ! Invalid command:'.red + ' %s' + '\n . See --help for a list of available commands.'.gray, cmndr.args.join(' '));
    process.exit(1);
});

console.log(process.argv);

var passthroughArgs = null;
var cmndArgs = [];
for (var i = 0; i < process.argv.length; i++) {
    var arg = process.argv[i];
    if (arg == '~') {
        passthroughArgs = [];
        continue;
    }
    if (passthroughArgs != null)
        passthroughArgs.push(arg);
    else cmndArgs.push(arg);
}

if (passthroughArgs != null)
    arglist = passthroughArgs.join(' ');

console.log(cmndArgs);

cmndr.parse(cmndArgs);

if (!process.argv.slice(2).length) {
    console.log('Command not fund, please select a command.'.red);

    cmndr.outputHelp(function (txt) {
        return txt;
    });
}
