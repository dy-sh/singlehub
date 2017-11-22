/**
 * Created by Derwish (derwish.pro@gmail.com) on 18.06.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Node } from "../node";
import { Container, Side } from "../container";
import Utils from "../utils";


import * as fs from 'fs';
import { exec } from 'child_process';

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



export class SystemFileNode extends Node {

    constructor() {
        super();
        this.title = "File";
        this.descriprion = "This node can read and write any file on the disk. <br/>" +
            "Send the file name to the input named File Name. The path can be omitted. <br/>" +
            "With logic inputs named Read, Write, Clear you can perform the requested operation. <br/>" +
            "The input named Text set a text value to be written to the file. <br/>" +
            "The contents of the file will be sent to the output.";

        this.addInput("file name", "string");
        this.addInput("text", "string");
        this.addInput("read", "boolean");
        this.addInput("write", "boolean");
        this.addInput("clear", "boolean");

        this.addOutput("text", "string");

        // options.ProtectedAccess = true;
    }

    onInputUpdated() {
        //read
        if (this.inputs[2].updated && this.inputs[2].data) {
            let fileName = this.getInputData(0);
            if (fileName == null)
                return this.debugWarn("Cant read file. File name is not defined");

            fs.readFile(fileName, (err, buff) => {
                if (err) return this.debugErr(err);

                let text = buff.toString('utf8');

                this.setOutputData(0, text);
            });
        }

        //write
        if (this.inputs[3].updated && this.inputs[3].data) {
            let fileName = this.getInputData(0);
            if (fileName == null)
                return this.debugWarn("Cant write file. File name is not defined");

            let text = this.getInputData(1);

            fs.writeFile(fileName, text, (err) => {
                if (err) return this.debugErr(err);

                this.debugInfo("The file " + fileName + " was saved!");
            });
        }

        //clear
        if (this.inputs[4].updated && this.inputs[4].data) {
            let fileName = this.getInputData(0);
            if (fileName == null)
                return this.debugWarn("Cant write file. File name is not defined");

            fs.writeFile(fileName, "", (err) => {
                if (err) return this.debugErr(err);

                this.debugInfo("The file " + fileName + " was saved!");
            });

        }


    };
}
Container.registerNodeType("system/file", SystemFileNode);





export class SystemJsonFileNode extends Node {

    constructor() {
        super();
        this.title = "Json file";
        this.descriprion = "This node can read and write Json file on the disk. <br/>" +
            "Send the file name To the input named File Name. The path can be omitted. <br/>" +
            "With logic inputs named Read, Write, Delete File you can perform the requested operation. <br/>" +
            "Specify the key that you want to read/write. <br/>" +
            "The value that you want to write, send to Value input. <br/>" +
            "Read value will be sent to the output.";

        this.addInput("file name", "string");
        this.addInput("key", "string");
        this.addInput("value", "string");
        this.addInput("read", "boolean");
        this.addInput("write", "boolean");
        this.addInput("delete", "boolean");

        this.addOutput("value", "string");

        // options.ProtectedAccess = true;
    }

    onInputUpdated() {
        //read
        if (this.inputs[3].updated && this.inputs[3].data) {
            let fileName = this.getInputData(0);
            if (fileName == null)
                return this.debugWarn("Cant read file. File name is not defined");

            let key = this.getInputData(1);

            fs.readFile(fileName, 'utf8', (err, data) => {
                if (err) return this.debugErr(err);

                let obj = JSON.parse(data);
                let val = obj[key];
                this.setOutputData(0, val);
            });
        }

        //write
        if (this.inputs[4].updated && this.inputs[4].data) {
            let fileName = this.getInputData(0);
            if (fileName == null)
                return this.debugWarn("Cant write file. File name is not defined");

            let key = this.getInputData(1);
            let value = this.getInputData(2);

            fs.readFile(fileName, 'utf8', (err, data) => {
                let obj = {};

                if (data)
                    obj = JSON.parse(data);

                obj[key] = value;
                let json = JSON.stringify(obj);
                fs.writeFile(fileName, json, 'utf8', (err) => {
                    if (err) return this.debugErr(err);

                    this.debugInfo("The file " + fileName + " was saved!");
                });
            });
        }

        //delete
        if (this.inputs[5].updated && this.inputs[5].data) {
            let fileName = this.getInputData(0);
            if (fileName == null)
                return this.debugWarn("Cant delete file. File name is not defined");

            fs.unlink(fileName, (err) => {
                if (err) return this.debugErr(err);

                this.debugInfo("The file " + fileName + " was deleted!");
            });

        }


    };
}
Container.registerNodeType("system/json-file", SystemJsonFileNode);
