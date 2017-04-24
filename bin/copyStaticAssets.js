var shell = require('shelljs');

console.log("Copying static content...");

shell.cp('-R', 'src/public/css', 'dist/public/css');
shell.cp('-R', 'src/public/images', 'dist/public/images');
shell.cp('-R', 'src/public/js/libs', 'dist/public/js/libs');