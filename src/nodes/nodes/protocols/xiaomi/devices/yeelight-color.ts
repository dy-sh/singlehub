import { IXiomiDeviceModel, XiaomiDeviceNode } from '../xiaomi-device';
import { Side } from "../../../../container";

export default class YeelightColor implements IXiomiDeviceModel {
    onCreate(node: XiaomiDeviceNode): void {
        node.addInput("power", "boolean");
        node.addOutput("power", "boolean");
        node.addInput("bright", "number");
        node.addOutput("bright", "number");
        node.addInput("color temp", "number");
        node.addOutput("color temp", "number");
        node.addInput("rgb", "string");
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

        //send color temperature
        if (node.device && node.inputs[3].updated) {
            var val = node.inputs[3].data;
            if (val != null) {
                if (val < 1700) val = 1700;
                if (val > 6500) val = 6500;
                node.device.setColorTemperature(val);
            }
        }

        //send rgb
        if (node.device && node.inputs[4].updated) {
            var val = node.inputs[4].data;
            if (val != null) {

                const parsed = /#?(([0-9a-f]{6})|([0-9a-f]{3}))/i.exec(val);
                if (!parsed) {
                    return node.debugWarn("Incorrect RGB-color format");
                }

                node.device.setRGB(val);
            }
        }
    }

    onConnected(node: XiaomiDeviceNode) {
        if (node.side == Side.server) {
            node.device.on('propertyChanged', e => {

                console.log(e);

                if (e.property == "power")
                    node.setOutputData(1, e.value);

                if (e.property == "brightness")
                    node.setOutputData(2, e.value);

                if (e.property == "colorTemperature")
                    node.setOutputData(3, e.value);
            });

            node.setOutputData(1, node.device.property('power'));
            node.setOutputData(2, node.device.property('brightness'));
        }
    }

    onDisconnected(node: XiaomiDeviceNode) {
        if (node.side == Side.server) {
            node.setOutputData(1, null);
            node.setOutputData(2, null);
        }
    }
};