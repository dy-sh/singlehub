/**
 * Created by Derwish (derwish.pro@gmail.com) on 06.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../node";
import Utils from "../utils";
import { Container } from "../container";


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
        this.addInput("key");
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
            "You can specify the number of outputs in the node settings.";

        this.addInput("active output", "number");
        this.addInput("value");
        this.addOutput();

        this.settings["outputs"] = { description: "Outputs count", value: 1, type: "number" };
    }

    onInputUpdated() {
        let active = this.getInputData(0);
        let val = this.getInputData(1);

        if (active < 1 || active > this.getOutputsCount() + 1) {
            this.debugWarn("Defined active output does not exist");
            return;
        }

        this.setOutputData(active - 1, val);
    }

    onSettingsChanged() {
        let outputs = this.settings["outputs"].value;

        outputs = Utils.clamp(outputs, 1, 1000);

        this.changeOutputsCount(outputs);

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
            "In the settings you can specify the number of inputs.";

        this.addInput("active input", "number");
        this.addInput("input 1");
        this.addOutput("value");

        this.settings["inputs"] = { description: "Inputs count", value: 1, type: "number" };
    }

    onInputUpdated() {
        let active = this.getInputData(0);

        if (active < 1 || active > this.getInputsCount()) {
            this.debugWarn("Defined active input does not exist");
            return;
        }

        let val = this.getInputData(active);
        this.setOutputData(0, val);
    }

    onSettingsChanged() {
        let inputs = this.settings["inputs"].value;

        inputs = Utils.clamp(inputs, 1, 1000);

        this.changeInputsCount(inputs + 1);
        for (let i = 1; i <= inputs; i++)
            this.inputs[i].name = "input " + i;


        //update db
        if (this.container.db)
            this.container.db.updateNode(this.id, this.container.id, {
                $set: { inputs: this.inputs }
            });
    }
}
Container.registerNodeType("connection/router-multiple-1", RouterMultipleToOneNode);






class ConnectionLocalReceiverNode extends Node {
    constructor() {
        super();

        this.title = "Local Receiver";
        this.descriprion = "This node works in conjunction with Local Trasmitter, " +
            "and provides a connection of nodes without a graphical wires. <br/>" +
            "Read the description to Local Trasmitter to understand how it works.";

        this.addOutput();

        this.settings["channel"] = { description: "Channel", value: 1, type: "number" };
        this.settings["outputs"] = { description: "Outputs count", value: 1, type: "number" };
    }



    onSettingsChanged() {
        let outputs = this.settings["outputs"].value;

        outputs = Utils.clamp(outputs, 1, 1000);

        this.changeOutputsCount(outputs);

        //update db
        if (this.container.db)
            this.container.db.updateNode(this.id, this.container.id, {
                $set: { outputs: this.outputs }
            });
    }
}
Container.registerNodeType("connection/local-receiver", ConnectionLocalReceiverNode);


