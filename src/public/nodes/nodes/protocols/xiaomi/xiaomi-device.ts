/**
 * Created by Derwish (derwish.pro@gmail.com) on 12.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../../../node";
import Utils from "../../../utils";
import { Container, Side } from "../../../container";

import Models from './xiaomi-models';

let miio;
if (typeof (window) === 'undefined') { //for backside only
    miio = require('miio')
}

export interface IXiomiDeviceModel {
    onCreate(node: XiaomiDeviceNode): void;
    onConnected?(node: XiaomiDeviceNode): void;
    onDisconnected?(node: XiaomiDeviceNode): void;
    onInputUpdated?(node: XiaomiDeviceNode): void;
}

export class XiaomiDeviceNode extends Node {

    titlePrefix = "Xiaomi";
    device: any;
    connected = false;
    model: IXiomiDeviceModel;

    constructor() {
        super();
        this.title = this.titlePrefix;
        this.descriprion = 'This node allows to remote control Xiaomi devices.';
        this.addInput("[connect]", "boolean");
        this.addOutput("connected", "boolean");

        this.settings["enable"] = { description: "Enable", value: false, type: "boolean" };
        this.settings["address"] = { description: 'IP address', value: "10.0.0.18", type: "string" };
        this.settings["title"] = { description: "Title", type: "string", value: "" };

        this.properties['deviceModel'] = "";
    }

    onCreated() {
    }

    onAdded() {
        if (this.side == Side.server) {
            this.setOutputData(0, false);

            // connect if "connect" input disconnected or input data==true
            if (this.settings["enable"].value
                && (this.inputs[0].link == null || this.inputs[0].data == true))
                this.connectToDevice();
        }

        this.changeTitle();
    }

    changeTitle() {
        let t = this.settings["title"].value;
        if (t.length > 15)
            t = "..." + t.substring(t.length - 15, t.length);
        // t = t.substr(0, 10) + "...";

        if (t == this.titlePrefix || t == "")
            this.title = this.titlePrefix;
        else
            this.title = this.titlePrefix + ": " + t;

        this.size = this.computeSize();

        if (this.side == Side.editor)
            this.setDirtyCanvas(true, true);
    }


    connectToDevice() {
        let options: any = { address: this.settings["address"].value };

        miio.device(options).then(device => {
            // console.log(device)

            this.device = device;

            //load device model library
            if (Models[device.model])
                this.model = new Models[device.model];
            else
                this.debugWarn("Xiaomi device model " + device.model + " is not supported yet. Please, contact developer of singlehub.")


            //connected to new device
            if (this.properties['deviceModel'] != device.model) {
                this.properties['deviceModel'] = device.model;
                this.settings["title"].value = device.model;

                this.changeTitle();

                //update view title
                this.sendMessageToEditorSide({ title: this.settings["title"].value });

                //update db
                if (this.container.db)
                    this.container.db.updateNode(this.id, this.container.id, {
                        $set: { properties: this.properties, settings: this.settings }
                    });

                //remove old inputs
                this.changeInputsCount(1);
                this.changeOutputsCount(1);

                //call model event
                if (this.model)
                    this.model.onCreate(this);
            }

            //call model event
            if (this.model && this.model.onConnected)
                this.model.onConnected(this);

            // if (device.hasCapability('power')) {
            //     console.log('power is now', device.power);
            //     return device.setPower(!device.power);
            // }

            // if (device.hasCapability('power-channels')) {
            //     let power = device.property('power');

            //     //add inputs/outputs
            //     if (Object.keys(power).length > 1) {
            //         for (let key of Object.keys(power)) {
            //             this.addInput(`[power ${key}]`, "boolean");
            //             let outId = this.addOutput(`[${key}]`, "boolean");
            //             this.setOutputData(outId, power[key]);
            //         }
            //     }
            //     else {
            //         this.addInput(`[power]`, "boolean");
            //         let outId = this.addOutput(`[power]`, "boolean");
            //         this.setOutputData(outId, power);
            //     }
            // }


            this.connected = true;
            this.setOutputData(0, true);

        }).catch(console.error);
    }

    disconnectFromDevice() {
        this.model = null;
        this.connected = false;
        this.device = null;
        this.setOutputData(0, false);

        //call model event
        if (this.model && this.model.onDisconnected)
            this.model.onDisconnected(this);
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

        //call model event
        if (this.model && this.model.onInputUpdated)
            this.model.onInputUpdated(this);
    }

    onSettingsChanged() {

        this.changeTitle();

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

    onGetMessageToEditorSide(data) {
        if (data.title) {
            this.settings["title"].value = data.title;
            this.changeTitle();
        }
    };



}
Container.registerNodeType("protocols/xiaomi-device", XiaomiDeviceNode);

