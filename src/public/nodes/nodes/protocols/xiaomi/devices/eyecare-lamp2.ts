import { IXiomiDeviceModel, XiaomiDeviceNode } from '../xiaomi-device';
import { Side } from "../../../../container";

export default class EyecareLamp2 implements IXiomiDeviceModel {
    onCreate(node: XiaomiDeviceNode): void {
        node.addInput("power", "boolean");
        node.addOutput("power", "boolean");
    }

    onInputUpdated(node: XiaomiDeviceNode): void {
        //send power state to device
        if (node.device && node.inputs[1].updated) {
            node.device.setPower(node.inputs[1].data == true); //convert type to bool, prevent null
        }
    }

    onConnected(node: XiaomiDeviceNode) {
        if (node.side == Side.server) {
            node.device.on('propertyChanged', e => {
                //update output
                if (e.property == "power")
                    node.setOutputData(1, e.value);
            });

            node.setOutputData(1, node.device._properties.power);
        }
    }

    onDisconnected(node: XiaomiDeviceNode) {
        if (node.side == Side.server) {
            node.setOutputData(1, null);
        }
    }
};