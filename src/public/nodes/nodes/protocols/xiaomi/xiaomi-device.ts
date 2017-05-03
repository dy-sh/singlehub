/**
 * Created by Derwish (derwish.pro@gmail.com) on 12.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../../../node";
import Utils from "../../../utils";
import { Container, Side } from "../../../container";


let miio;
if (typeof (window) === 'undefined') { //for backside only
    miio = require('miio')
}


export class XiaomiDeviceNode extends Node {

    device: any;

    constructor() {
        super();
        this.title = "Xiaomi device";
        this.descriprion = 'This node allows to remote control any Xiaomi device.';
        this.addInput("[connect]", "boolean");
        this.addOutput("connected", "boolean");

        this.settings["enable"] = { description: "Enable", value: false, type: "boolean" };

        this.settings["address"] = { description: 'IP address', value: "10.0.0.18", type: "string" };

    }

    onCreated() {

    }

    onAdded() {

        if (this.side == Side.server) {
            this.setOutputData(0, false);

            // connect if "connect" input disconnected or input data==true
            if (this.settings["enable"].value
                && (this.inputs[0].link == null || this.inputs[0].data == true))
                this.connectToDevice()
        }
    }


    connectToDevice() {
        let options: any = { address: this.settings["address"].value };

        miio.device(options).then(device => {
            console.log(device)
            // if (device.hasCapability('power')) {
            //     console.log('power is now', device.power);
            //     return device.setPower(!device.power);
            // }
            this.device = device;

            if (device.hasCapability('power-channels')) {
                let power = device.property('power');

                //add inputs/outputs
                if (Object.keys(power).length > 1) {
                    for (let key of Object.keys(power)) {
                        this.addInput(`[power ${key}]`, "boolean");
                        let outId = this.addOutput(`[${key}]`, "boolean");
                        this.setOutputData(outId, power[key]);
                    }
                }
                else {
                    this.addInput(`[power]`, "boolean");
                    let outId = this.addOutput(`[power]`, "boolean");
                    this.setOutputData(outId, power);
                }
            }

            //update view
            if (this.side == Side.editor) {
                this.setDirtyCanvas(true, true);
            }
        }).catch(console.error);


    }

    disconnectFromDevice() {

    }


    onInputUpdated() {
        //connect/disconnect
        if (this.inputs[0].updated) {
            if (this.inputs[0].data == false)
                this.disconnectFromDevice();
            //auto connect when input disconnected
            else if (this.settings["enable"].value
                && (this.inputs[0].link == null || this.inputs[0].data == true))
                this.connectToDevice()
        }

        //power input updated
        if (this.inputs[1].updated) {
            this.device.setPower(this.inputs[1].data);
        }

        // for (let id in this.inputs) {
        //     let i = this.inputs[id];
        //     if (i.updated) {
        //         if (i.name.startsWith('[power')) {

        //         }
        //     }
        // }
    }

    onSettingsChanged() {

        //update db
        if (this.container.db)
            this.container.db.updateNode(this.id, this.container.id, {
                $set: { inputs: this.inputs, outputs: this.outputs, settings: this.settings }
            });

        if (this.side == Side.server) {
            this.disconnectFromDevice();

            if (this.settings["enable"].value)
                this.connectToDevice();
        }

    }


}
Container.registerNodeType("protocols/xiaomi-device", XiaomiDeviceNode);

