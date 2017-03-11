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


export class MqttSubsriberNode extends Node {
    client;

    constructor() {
        super();
        this.title = "MQTT subsriber";
        this.descriprion = "";
        this.addOutput("connected", "boolean");
        this.addOutput("value");

        this.settings["server"] = {description: "Broker URL", value: "m20.cloudmqtt.com", type: "string"};
        this.settings["port"] = {description: "Broker port", value: "16758", type: "string"};
        this.settings["username"] = {description: "User name", value: "123", type: "string"};
        this.settings["password"] = {description: "Password", value: "123", type: "string"};
        this.settings["topic"] = {description: "Topic", value: "text", type: "string"};
    }

    onAdded() {
        if (this.side == Side.server) {
            this.setOutputData(0, false);
            this.connectToBrocker()
        }
    }


    connectToBrocker() {
        let options = {
            host: this.settings["server"].value,
            port: this.settings["port"].value,
            username: this.settings["username"].value,
            password: this.settings["password"].value
        };
        this.client = mqtt.connect(options);

        this.client.on('connect', () => {
            this.setOutputData(0, true);
            this.client.subscribe(this.settings["topic"].value);
            this.client.publish('text', '321')
        });

        this.client.on('close', () => {
            this.setOutputData(0, false);
            this.setOutputData(1, null);
        });

        this.client.on('error', (error) => {
            this.debugWarn(error);
        });

        this.client.on('message', (topic, message) => {
            message=message.toString();
            if (topic == this.settings["topic"].value)
                this.setOutputData(1, message);

            console.log(message)
        });
    }

    disconnectFromBrocker() {
        if (this.client)
            this.client.end();
    }

    onSettingsChanged() {
        this.disconnectFromBrocker();
        this.connectToBrocker();
    }


}
Container.registerNodeType("protocols/mqtt-subscriber", MqttSubsriberNode);

