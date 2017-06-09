import { IXiomiDeviceModel, XiaomiDeviceNode } from '../xiaomi-device';
import { Side } from "../../../../container";

export default class EyecareLamp2 implements IXiomiDeviceModel {
    onCreate(node: XiaomiDeviceNode): void {
        node.addInput("power", "boolean");
        node.addOutput("power", "boolean");
        node.addInput("bright", "number");
        node.addOutput("bright", "number");
    }

    onInputUpdated(node: XiaomiDeviceNode): void {
        //send power state to device
        if (node.device && node.inputs[1].updated) {
            node.device.setPower(node.inputs[1].data == true); //convert type to bool, prevent null
        }

        //send bright to device
        if (node.device && node.inputs[2].updated) {
            var val = node.inputs[2].data;
            if (val != null) {
                if (val < 1) val = 1;
                if (val > 100) val = 100;
                node.device.setBrightness(val);
            }
        }
    }

    onConnected(node: XiaomiDeviceNode) {
        if (node.side == Side.server) {
            node.device.on('propertyChanged', e => {
                //update output
                if (e.property == "power")
                    node.setOutputData(1, e.value);
            });

            node.device.on('propertyChanged', e => {
                //update output
                if (e.property == "brightness")
                    node.setOutputData(2, e.value);
            });

            node.setOutputData(1, node.device.property('power'));
            node.setOutputData(2, node.device.property('brightness'));
        }
    }

    onDisconnected(node: XiaomiDeviceNode) {
        if (node.side == Side.server) {
            node.setOutputData(1, null);
        }
    }
};