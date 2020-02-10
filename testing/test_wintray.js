const path = require("path");
const colors = require('colors');
const fs = require("fs");
const resizeImg = require('resize-img');
const util = require('util');
const icons = require('../icons.js');

console.log('Starting...');

const SysTray = require("systray");

(async function () {
    console.log('Starting convert.');
    var resizedAsString = await icons.getIconAsBase64String('gear');

    // base 64 example:
    console.log(resizedAsString.length);

    console.log('Starting system tray.');

    var systray = new SysTray.default({
        menu: {
            // you should using .png icon in macOS/Linux, but .ico format in windows
            icon: resizedAsString,
            title: "This is my system tray icon",
            tooltip: "Some tooltip",
            items: [{
                title: "aa",
                tooltip: "bb",
                // checked is implement by plain text in linux
                checked: true,
                enabled: true
            }, {
                title: "aa2",
                tooltip: "bb",
                checked: false,
                enabled: true
            }, {
                title: "Exit",
                tooltip: "bb",
                checked: false,
                enabled: true
            }]
        },
        debug: true,
    });
})();

console.log('Press any key to exit.'.gray);

process.stdin.resume();