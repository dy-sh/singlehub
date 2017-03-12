/**
 * Created by Derwish (derwish.pro@gmail.com) on 12.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import {Node} from "../../../node";
import Utils from "../../../utils";
import {Container, Side} from "../../../container";


//console logger back and front
let mqtt;
declare let Logger: any; // tell the ts compiler global variable is defined
if (typeof (window) === 'undefined') { //for backside only
    mqtt = require('mqtt')
}


export class MqttClientNode extends Node {
    client: any;
    topicsCount = 0;

    constructor() {
        super();
        this.title = "MQTT client";
        this.descriprion = 'This is MQTT node. Turn on the "enable" switch in settings to activate the node. If "connect" input is not connected, the node will be active (if it is enabled in the settings). The node will reconnect to the server if you press "OK" in the settings. The client automatically subscribes to all specified topics. You can send the values (using inputs), and to receive the values from the server (at the outputs). You need to specify the server address in the settings. Additionally you can specify the port, user name and password, if necessary. In case of connection problems, follow the debug messages on the MyNodes server, to determine the cause.';
        this.addInput("[connect]", "boolean");
        this.addOutput("connected", "boolean");


        this.settings["enable"] = {description: "Enable", value: false, type: "boolean"};

        this.settings["server"] = {description: "Broker URL", value: "", type: "string"};
        this.settings["port"] = {description: "Broker port", value: "", type: "string"};
        this.settings["username"] = {description: "User name", value: "", type: "string"};
        this.settings["password"] = {description: "Password", value: "", type: "string"};

        this.settings["topics_count"] = {
            description: "Topic count (reopen settings if change this)",
            value: 1,
            type: "number"
        };

    }

    onCreated() {
        this.changeTopicsCount(1);
        this.renameInputsOutputs();
    }

    onAdded() {
        this.topicsCount = this.settings["topics_count"].value;

        if (this.side == Side.server) {
            this.setOutputData(0, false);

            // connect if "connect" input disconnected or input data==true
            if (this.settings["enable"].value
                && (this.inputs[0].link == null || this.inputs[0].data == true))
                this.connectToBrocker()
        }
    }


    connectToBrocker() {
        let options: any = {host: this.settings["server"].value};

        if (this.settings["port"].value != null
            && this.settings["port"].value != "")
            options.port = this.settings["port"].value;

        if (this.settings["username"].value != null
            && this.settings["username"].value != "")
            options.username = this.settings["username"].value;

        if (this.settings["password"].value != null
            && this.settings["password"].value != "")
            options.password = this.settings["password"].value;

        this.client = mqtt.connect(options);

        this.client.on('connect', () => {
            this.setOutputData(0, true);

            //subscribe
            for (let i = 1; i <= this.topicsCount; i++) {
                let topic = this.settings['topic' + i].value;
                this.client.subscribe(topic);
            }
        });

        this.client.on('close', () => {
            this.setOutputData(0, false);
            this.setOutputData(1, null);
        });

        this.client.on('error', (error) => {
            this.debugWarn(error);
        });

        this.client.on('message', (topic, message) => {
            message = message.toString();

            //send data to output
            for (let i = 1; i <= this.topicsCount; i++) {
                if (topic == this.settings['topic' + i].value)
                    this.setOutputData(i, message);
            }

        });
    }

    disconnectFromBrocker() {
        if (this.client)
            this.client.end();
    }


    onInputUpdated() {
        //connect/disconnect
        if (this.inputs[0].updated) {
            if (this.inputs[0].data == false)
                this.disconnectFromBrocker();
            //auto connect when input disconnected
            else if (this.settings["enable"].value
                && (this.inputs[0].link == null || this.inputs[0].data == true))
                this.connectToBrocker()
        }

        //publish message
        if (this.settings["enable"].value && this.client && this.client.connected) {
            for (let i = 1; i < this.getInputsCount(); i++) {
                if (this.inputs[i].updated) {
                    let topic = this.settings['topic' + i].value;
                    this.client.publish(topic, "" + this.inputs[i].data);
                }
            }
        }
    }

    onSettingsChanged() {

        let topics = this.settings["topics_count"].value;
        topics = Utils.clamp(topics, 1, 100);
        this.settings["topics_count"].value = topics;

        //change topics count
        if (this.topicsCount != topics)
            this.changeTopicsCount(topics);

        //rename inputs, outputs
        this.renameInputsOutputs();

        //update db
        if (this.container.db)
            this.container.db.updateNode(this.id, this.container.id, {
                $set: {inputs: this.inputs, outputs: this.outputs, settings: this.settings}
            });

        if (this.side == Side.server) {
            this.disconnectFromBrocker();

            if (this.settings["enable"].value)
                this.connectToBrocker();
        }

    }

    changeTopicsCount(target_count) {
        let diff = target_count - this.topicsCount;
        if (diff == 0)
            return;

        //add inputs, outputs
        this.changeInputsCount(target_count + 1);
        this.changeOutputsCount(target_count + 1);

        //change settings for topics
        if (diff > 0) {
            for (let i = this.topicsCount + 1; i <= target_count; i++) {
                this.settings['topic' + i] = {description: "Topic " + i, value: "", type: "string"};
            }
        }
        else if (diff < 0) {
            for (let i = this.topicsCount; i > target_count; i--)
                delete this.settings['topic' + i];
        }

        this.topicsCount = target_count;
    }

    renameInputsOutputs() {
        for (let i = 1; i <= this.topicsCount; i++) {
            this.inputs[i].name = "[" + i + "]";
            let topic = this.settings['topic' + i].value;
            if (topic.length > 20)
                topic = "..." + topic.substr(topic.length - 20, 20);
            this.outputs[i].name = topic + " | " + i;
        }

        if (this.side == Side.editor) {
            for (let i = 1; i <= this.topicsCount; i++) {
                this.inputs[i].label = this.inputs[i].name;
                this.outputs[i].label = this.outputs[i].name;
            }
            this.setDirtyCanvas(true, true);
        }
    }

}
Container.registerNodeType("protocols/mqtt-client", MqttClientNode);

