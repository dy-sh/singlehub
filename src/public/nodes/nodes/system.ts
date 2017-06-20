/**
 * Created by Derwish (derwish.pro@gmail.com) on 18.06.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Node } from "../node";
import { Container, Side } from "../container";
import Utils from "../utils";

let exec;
if (typeof (window) === 'undefined') { //for backside only
    exec = require('child_process').exec;
}


export class SystemBeepNode extends Node {

    constructor() {
        super();
        this.title = "Beep";
        this.descriprion = "This node plays a default system sound on the server (not in the browser).";

        this.addInput("start", "boolean");
    }

    onInputUpdated() {
        if (this.getInputData(0) == true)
            process.stderr.write('\x07');
        // console.log('\u0007');
    };
}
Container.registerNodeType("system/beep", SystemBeepNode);



export class SystemExecuteNode extends Node {

    constructor() {
        super();
        this.title = "Execute";
        this.descriprion = "This node can execute any system command.";

        this.addInput("command");
        this.addInput("start", "boolean");
    }

    onInputUpdated() {
        if (this.inputs[1].updated && this.inputs[1].data) {
            var command = this.inputs[0].data;
            exec(command, (err, stdout, stderr) => {
                if (err) this.debugErr(err);
                if (stdout) this.debugInfo(err);
                if (stderr) this.debugWarn(err);
            });
        }
    };
}
Container.registerNodeType("system/execute", SystemExecuteNode);