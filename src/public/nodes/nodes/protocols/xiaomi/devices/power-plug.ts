import { IXiomiDeviceModel, XiaomiDeviceNode } from '../xiaomi-device';

export default class PowerPlug implements IXiomiDeviceModel {
    onCreate(node: XiaomiDeviceNode): void {
        node.addInput("power", "boolean");
        node.addOutput("power", "boolean");
    }

    onInputUpdated(node: XiaomiDeviceNode): void {
        if (node.device && node.inputs[1].updated) {
            node.device.setPower(node.inputs[1].data == true); //convert type to bool, prevent null
        }
    }
};