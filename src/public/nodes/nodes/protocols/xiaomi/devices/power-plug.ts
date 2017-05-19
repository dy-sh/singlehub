import { IXiomiDeviceModel, XiaomiDeviceNode } from '../xiaomi-device';

export default class PowerPlug implements IXiomiDeviceModel {
    onCreate(node: XiaomiDeviceNode): void {
        node.addInput("power", "boolean");
        node.addOutput("power", "boolean");

        //update db
        if (node.container.db)
            node.container.db.updateNode(node.id, node.container.id, {
                $set: { inputs: node.inputs, outputs: node.outputs }
            });
    }

    onInputUpdated(node: XiaomiDeviceNode): void {
        //send power state to device
        if (node.device && node.inputs[1].updated) {
            node.device.setPower(0, node.inputs[1].data == true); //convert type to bool, prevent null
        }
    }

    onConnected(node: XiaomiDeviceNode) {
        node.device.on('propertyChanged', e => {

            //update output
            if (e.property == "powerChannel0")
                node.setOutputData(1, e.value);
        });
    }
};