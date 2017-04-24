var fs = require('fs');
var config = require('../config.json');

console.log("Reset config file...");

config.firstRun = true;
fs.writeFileSync(__dirname + ' /../config.json', JSON.stringify(config, null, '\t'));
