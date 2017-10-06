/**
 * Created by Derwish (derwish.pro@gmail.com) on 12.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../../../node";
import Utils from "../../../utils";
import { Container, Side } from "../../../container";

import Models from './xiaomi-models';
import * as miio from 'miio';



export interface IXiomiDeviceModel {
    //called on server and editor side
    onCreate(node: XiaomiDeviceNode): void;
    onConnected?(node: XiaomiDeviceNode): void;
    onDisconnected?(node: XiaomiDeviceNode): void;

    //called on server side only
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
        this.descriprion = 'This node allows to remote control Xiaomi devices. <br><br>' +
            'In the node settings you need to specify the IP address of the device. <br><br>' +
            'The device type will be determined automatically. ' +
            'The corresponding control pins will be created for each type of device. <br><br>' +
            'You can specify Update Interval in the node settings. ' +
            'The program will send messages to the device ' +
            'no more often than specified in this setting. ' +
            'This ensures that the device will not be flooded with a large number of messages. ' +
            'Too many messages will be discarded and will not be sent, ' +
            'but the device will always have the current state, ' +
            'because The last message will be sent in any case. ' +
            'The recommended setting is 500 ms, but you can try less.';

        this.addInput("[connect]", "boolean");
        this.addOutput("connected", "boolean");

        this.settings["enable"] = { description: "Enable", value: false, type: "boolean" };
        this.settings["address"] = { description: 'IP address', value: "10.0.0.18", type: "string" };
        this.settings["title"] = { description: "Title", type: "string", value: "" };
        this.settings["update-interval"] = { description: "Update interval", type: "number", value: 500 };

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

        this.UPDATE_INPUTS_INTERVAL = this.settings["update-interval"].value;
    }

    changeTitle() {
        let t = this.settings["title"].value;
        if (t && t.length > 15)
            t = "..." + t.substring(t.length - 15, t.length);
        // t = t.substr(0, 10) + "...";

        if (t == this.titlePrefix || t == "" || t == null)
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

            //call onConnected events on server and editor side
            if (this.properties['deviceModel'] != device.model) {
                this.onFirstTimeConnected(device.model);
                this.sendMessageToEditorSide({ onFirstTimeConnected: this.device.model });
            }
            else {
                this.onConnected(device.model);
                this.sendMessageToEditorSide({ onConnected: this.device.model });
            }

            this.connected = true;
            this.setOutputData(0, true);

        }).catch(console.error);
    }

    onGetMessageToEditorSide(data) {
        if (data["onFirstTimeConnected"])
            this.onFirstTimeConnected(data["onFirstTimeConnected"]);

        if (data["onConnected"])
            this.onConnected(data["onConnected"]);

        if (data["onDisconnected"] && this.model && this.model.onDisconnected)
            this.model.onDisconnected(this);
    };

    onConnected(deviceModel: string) {
        //load device model library
        if (Models[deviceModel])
            this.model = new Models[deviceModel];
        else
            this.debugWarn("Xiaomi device model " + deviceModel + " is not supported yet. Please, contact developer of singlehub.")

        //call model event
        if (this.model && this.model.onConnected)
            this.model.onConnected(this);
    }

    onFirstTimeConnected(deviceModel: string) {
        //load device model library
        if (Models[deviceModel])
            this.model = new Models[deviceModel];
        else
            this.debugWarn("Xiaomi device model " + deviceModel + " is not supported yet. Please, contact developer of singlehub.")

        //remove old inputs
        this.changeInputsCount(1);
        this.changeOutputsCount(1);

        this.properties['deviceModel'] = deviceModel;

        //change title
        this.settings["title"].value = deviceModel;
        this.changeTitle();

        //call model event
        if (this.model)
            this.model.onCreate(this);

        //update db
        if (this.container.db)
            this.container.db.updateNode(this.id, this.container.id, {
                $set: { properties: this.properties, settings: this.settings, inputs: this.inputs, outputs: this.outputs }
            });

        if (this.side == Side.editor)
            this.setDirtyCanvas(true, true)
    }


    disconnectFromDevice() {

        //call model event
        if (this.model && this.model.onDisconnected)
            this.model.onDisconnected(this);

        this.sendMessageToEditorSide({ onDisconnected: "" });

        this.model = null;
        this.connected = false;
        this.device = null;
        this.setOutputData(0, false);
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

        this.UPDATE_INPUTS_INTERVAL = this.settings["update-interval"].value;

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

