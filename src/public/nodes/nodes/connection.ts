/**
 * Created by Derwish (derwish.pro@gmail.com) on 06.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../node";
import Utils from "../utils";
import { Container, Side } from "../container";
import * as request from "request";




let hubDesc = "This node sends a value from any of its inputs to all its outputs. <br/>" +
    "The usage of this node can be very wide. Lets consider a few examples. <br/><br/>" +

    "Connecting many-to-one. <br/>" +
    "For example, you want to connect several different nodes to " +
    "the input of one node. By default, this is impossible, " +
    "because one input can only have one connection. " +
    "But you can work around this limitation by using a hub. " +
    "Connect multiple devices to the hub, then connect " +
    "the hub to the input of the node.<br/><br/>" +

    "Connecting one-to-many.  <br/>" +
    "If you connect multiple nodes to one output of a node, " +
    "node will send the value to all nodes that are connected, " +
    "but you can't control the order in which it will do it. " +
    "But you can work around this limitation by using a hub. " +
    "Connect the output of the node to the hub and then " +
    "connect the other nodes to the hub's outputs " +
    "in the order in which they should receive the value. " +
    "The hub sends a value on the outputs starting with the first output. <br/><br/>" +

    "Connecting many-to-many.  <br/>" +
    "Create many inputs and outputs in the hub to link several nodes. " +
    "All devices on the outputs of the hub " +
    "will receive a message from any node in the input.";


class HubNode extends Node {
    constructor() {
        super();

        this.title = "Hub";
        this.descriprion = hubDesc;

        this.addInput();
        this.addOutput();

        this.settings["inputs"] = { description: "Inputs count", value: 1, type: "number" };
        this.settings["outputs"] = { description: "Outputs count", value: 1, type: "number" };
    }

    onInputUpdated() {
        let val;
        for (let i in this.inputs)
            if (this.inputs[i].updated)
                val = this.inputs[i].data;

        for (let i in this.outputs)
            this.setOutputData(+i, val);
    }

    onSettingsChanged() {
        let inputs = this.settings["inputs"].value;
        let outputs = this.settings["outputs"].value;

        inputs = Utils.clamp(inputs, 1, 1000);
        outputs = Utils.clamp(outputs, 1, 1000);

        this.changeInputsCount(inputs);
        this.changeOutputsCount(outputs);

        //update db
        if (this.container.db)
            this.container.db.updateNode(this.id, this.container.id, {
                $set: {
                    inputs: this.inputs,
                    outputs: this.outputs
                }
            });
    }
}
Container.registerNodeType("connection/hub", HubNode);


class GateNode extends Node {
    constructor() {
        super();

        this.title = "Gate";
        this.descriprion = "This node can block the transfer of messages from one node to another. <br/>" +
            "Send \"1\" to \"Key\" to allow the transfer or \"0\" to block the transfer. <br/>" +
            "If you enable the option \"Send null when closed\" in the settings node, " +
            "then the node will send null to the output when the transmission is locked.";

        this.addInput("value");
        this.addInput("key", "boolean");
        this.addOutput("value");

        this.settings["send-null"] = { description: "Send null when closed", value: false, type: "boolean" };
    }

    onInputUpdated() {
        let key = this.getInputData(1);

        if (key)
            this.setOutputData(0, this.getInputData(0));
        else if (this.settings["send-null"].value
            && this.outputs[0].data != null)
            this.setOutputData(0, null);
    }
}
Container.registerNodeType("connection/gate", GateNode);


class RouterOneToMultipleNode extends Node {
    constructor() {
        super();

        this.title = "Router 1-multiple";
        this.descriprion = "This node can be used to link one node with several nodes. <br/>" +
            "You can change which node will receive messages (using input \"Active Output\"). " +
            "The other nodes will not receive anything. <br/>" +
            "You can specify the number of outputs in the node settings.<br>" +
            "Note that the outputs numbering is from zero (\"active output\" == 0 will correspond to \"output 0\")";

        this.addInput("active output", "number");
        this.addInput("value");
        this.addOutput("output 0");

        this.settings["outputs"] = { description: "Outputs count", value: 1, type: "number" };
    }

    onInputUpdated() {
        let active = this.getInputData(0);
        let val = this.getInputData(1);

        if (active < 0 || active >= this.getOutputsCount()) {
            this.debugWarn("Defined active output does not exist");
            return;
        }

        this.setOutputData(active, val);
    }

    onSettingsChanged() {
        let outputs = this.settings["outputs"].value;

        outputs = Utils.clamp(outputs, 1, 1000);

        this.changeOutputsCount(outputs);

        //rename pins
        for (let i = 0; i < outputs; i++)
            this.outputs[i].name = "output " + i;


        //update db
        if (this.container.db)
            this.container.db.updateNode(this.id, this.container.id, {
                $set: { outputs: this.outputs }
            });
    }
}
Container.registerNodeType("connection/router-1-multiple", RouterOneToMultipleNode);




class RouterMultipleToOneNode extends Node {
    constructor() {
        super();

        this.title = "Router multiple-1";
        this.descriprion = "This node can be used to link several nodes with one node. <br/>" +
            "You can change which node will send messages (using input \"Active Input\"). " +
            "The rest nodes will be blocked. <br/>" +
            "In the settings you can specify the number of inputs.<br>" +
            "Note that the inputs numbering is from zero (\"active input\" == 0 will correspond to \"input 0\")";

        this.addInput("active input", "number");
        this.addInput("input 0");
        this.addOutput("value");

        this.settings["inputs"] = { description: "Inputs count", value: 1, type: "number" };
    }

    onInputUpdated() {
        let active = this.getInputData(0);

        if (active < 0 || active >= this.getInputsCount() - 1) {
            this.debugWarn("Defined active input does not exist");
            return;
        }

        let val = this.getInputData(active + 1);
        this.setOutputData(0, val);
    }

    onSettingsChanged() {
        let inputs = this.settings["inputs"].value;

        inputs = Utils.clamp(inputs, 1, 1000);

        this.changeInputsCount(inputs + 1);

        //rename pins
        for (let i = 1; i <= inputs; i++)
            this.inputs[i].name = "input " + (i - 1);


        //update db
        if (this.container.db)
            this.container.db.updateNode(this.id, this.container.id, {
                $set: { inputs: this.inputs }
            });
    }
}
Container.registerNodeType("connection/router-multiple-1", RouterMultipleToOneNode);





class ConnectionLocalTransmitterNode extends Node {
    constructor() {
        super();

        this.descriprion = "This node works in conjunction with Local Receiver, " +
            "and provides a connection of nodes without a graphical wires. <br/>" +
            "You can use this nodes to connect nodes that are far away " +
            "from each other (for example in different continers) and you don't " +
            "want to drag the \"wire\" so far. <br/>" +
            "Set the same channel on transmitter and receiver to link them. " +
            "You can also use this node for broadcast. <br/>" +
            "For example, if you want a lot nodes on different panels " +
            "heard the message from one node, then " +
            "use a lot of receivers configured on the same channel. <br/>" +
            "Or, if you want to one node receive messages " +
            "from many nodes in to one input, then " +
            "use many transmitters on the same channel. ";

        this.addInput();

        this.settings["channel"] = { description: "Channel", value: 1, type: "number" };
        this.settings["inputs"] = { description: "Inputs count", value: 1, type: "number" };
    }

    onAdded() {
        this.title = "Local Transmitter [" + this.settings["channel"].value + "]";
    }

    onInputUpdated() {
        for (let i in this.inputs) {
            if (this.inputs[i].updated) {
                let val = this.inputs[i].data;
                let receivers = Container.containers[0].getNodesByType("connection/local-receiver", true);

                receivers.forEach(receiver => {
                    if (receiver.settings["channel"].value == this.settings["channel"].value)
                        receiver.setOutputData(+i, val);
                });
            }
        }
    }

    onSettingsChanged() {
        let inputs = this.settings["inputs"].value;

        inputs = Utils.clamp(inputs, 1, 1000);

        this.changeInputsCount(inputs);
        // for (let i = 0; i <= inputs; i++)
        //     this.inputs[i].name = "input " + i + 1;

        this.title = "Local Transmitter [" + this.settings["channel"].value + "]";

        //update db
        if (this.container.db)
            this.container.db.updateNode(this.id, this.container.id, {
                $set: { inputs: this.inputs }
            });
    }
}
Container.registerNodeType("connection/local-transmitter", ConnectionLocalTransmitterNode);





class ConnectionLocalReceiverNode extends Node {
    constructor() {
        super();

        this.descriprion = "This node works in conjunction with Local Trasmitter, " +
            "and provides a connection of nodes without a graphical wires. <br/>" +
            "Read the description to Local Trasmitter to understand how it works.";

        this.addOutput();

        this.settings["channel"] = { description: "Channel", value: 1, type: "number" };
        this.settings["outputs"] = { description: "Outputs count", value: 1, type: "number" };
    }

    onAdded() {
        this.title = "Local Receiver [" + this.settings["channel"].value + "]";
    }

    onSettingsChanged() {
        let outputs = this.settings["outputs"].value;

        outputs = Utils.clamp(outputs, 1, 1000);

        this.changeOutputsCount(outputs);

        this.title = "Local Receiver [" + this.settings["channel"].value + "]";

        //update db
        if (this.container.db)
            this.container.db.updateNode(this.id, this.container.id, {
                $set: { outputs: this.outputs }
            });
    }
}
Container.registerNodeType("connection/local-receiver", ConnectionLocalReceiverNode);






class ConnectionRemoteTransmitterNode extends Node {
    constructor() {
        super();

        this.descriprion = "This node works in conjunction with the Remote Receiver, " +
            "and provides a remote connection of nodes. <br/>" +
            "The principle of operation of this node is the same as the Local Transmitter node, " +
            "but this node can be used to link the nodes are located on different " +
            "servers in a local network or in the Internet. <br/>" +
            "With this node you can merge several SingleHub systems into one system. <br/>" +
            "To link the transmitter and the receiver, " +
            "you need to set the channel (like on the Local Transmitter node), " +
            "address (and port) of the server and password. <br/>" +
            "The server address (and port) - exactly the same, " +
            "which it access in the browser (\"http://192.168.1.2:1312\" for example). <br/>" +
            "The passwords in the transmitter and receiver must match. <br/>" +
            "If you do not specify a password, the password will not be used.";

        this.addInput();

        this.settings["address"] = { description: "Address", value: "http://localhost:1312", type: "string" };
        this.settings["password"] = { description: "Password", value: "", type: "string" };
        this.settings["channel"] = { description: "Channel", value: 1, type: "number" };
        this.settings["inputs"] = { description: "Inputs count", value: 1, type: "number" };
    }

    onAdded() {
        this.title = "Remote Transmitter [" + this.settings["channel"].value + "]";
    }

    onInputUpdated() {
        for (let i in this.inputs) {
            if (this.inputs[i].updated) {

                let url = this.settings["address"].value + "/api/editor/c/0/n-type";

                let req = {
                    type: "connection/remote-receiver",
                    subcontainers: true,
                    password: this.settings["password"].value,
                    channel: this.settings["channel"].value,
                    output: +i,
                    value: this.inputs[i].data
                }

                request.post({ url: url, form: req }, (err, res, body) => {
                    if (err) return this.debugWarn("Cant send data. Error: " + err);
                    if (res.statusCode != 200) return this.debugWarn("Receiver drop data. Error: " + res.body);
                });
            }
        }
    }



    onSettingsChanged() {
        let inputs = this.settings["inputs"].value;

        inputs = Utils.clamp(inputs, 1, 1000);

        this.changeInputsCount(inputs);
        // for (let i = 0; i <= inputs; i++)
        //     this.inputs[i].name = "input " + i + 1;

        this.title = "Remote Transmitter [" + this.settings["channel"].value + "]";

        //update db
        if (this.container.db)
            this.container.db.updateNode(this.id, this.container.id, {
                $set: { inputs: this.inputs }
            });
    }
}
Container.registerNodeType("connection/remote-transmitter", ConnectionRemoteTransmitterNode);





class ConnectionRemoteReceiverNode extends Node {
    constructor() {
        super();

        this.descriprion = "This node works in conjunction with Remote Trasmitter, " +
            "and provides a remote connection of nodes. <br/>" +
            "Read the description to Remote Trasmitter to understand how it works.";

        this.addOutput();

        this.settings["address"] = { description: "Address", value: "http://localhost:1312", type: "string" };
        this.settings["password"] = { description: "Password", value: "", type: "string" };
        this.settings["channel"] = { description: "Channel", value: 1, type: "number" };
        this.settings["outputs"] = { description: "Outputs count", value: 1, type: "number" };
    }

    onAdded() {
        this.title = "Remote Receiver [" + this.settings["channel"].value + "]";
    }

    onEditorApiPostRequest(req, res) {
        if (req.body.channel != this.settings["channel"].value)
            return;

        if (req.body.password != this.settings["password"].value) {
            let mess = "Received wrong password: " + req.body.password;
            if (!res.headersSent)
                res.status(401).send(mess);
            return this.debugWarn(mess);
        }

        if (!this.outputs[req.body.output]) {
            let mess = "Received value, but output [" + (+req.body.output + 1) + "] not exist.";
            if (!res.headersSent)
                res.status(400).send(mess);
            return this.debugWarn(mess);
        }

        this.setOutputData(req.body.output, req.body.value);

        if (!res.headersSent)
            res.send("ok");
    }

    onSettingsChanged() {
        let outputs = this.settings["outputs"].value;

        outputs = Utils.clamp(outputs, 1, 1000);

        this.changeOutputsCount(outputs);

        this.title = "Remote Receiver [" + this.settings["channel"].value + "]";

        //update db
        if (this.container.db)
            this.container.db.updateNode(this.id, this.container.id, {
                $set: { outputs: this.outputs }
            });
    }
}
Container.registerNodeType("connection/remote-receiver", ConnectionRemoteReceiverNode);


