/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
//set DEBUG environment variable if nod defined
if (!process.env.DEBUG)
    process.env.DEBUG = "server:*,gateway:*,-gateway:mys:log*,nodes:*,container:*";
process.env.DEBUG_DIFF = 0;
//set debug format (added time stamp)
var deb = require('debug');
deb.formatArgs = function formatArgs() {
    var args = arguments;
    var useColors = this.useColors;
    var name = this.namespace;
    var c = this.color;
    args[0] = (new Date()).toLocaleString() +
        '  \u001b[3' + c + 'm' + name + ' '
        + '\u001b[0m'
        + args[0] + '\u001b[3' + c + 'm'
        + ' +' + deb.humanize(this.diff) + '\u001b[0m';
    return args;
};
//# sourceMappingURL=configure.js.map