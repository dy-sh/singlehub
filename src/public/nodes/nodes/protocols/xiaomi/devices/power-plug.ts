import { IXiomiDeviceModel, XiaomiDeviceNode } from '../xiaomi-device';

export default class PowerPlug implements IXiomiDeviceModel {
    onCreate(node: XiaomiDeviceNode): void {
        console.log("created!!!");
    }
    onConnected(node: XiaomiDeviceNode): void {
    }
    onDisconnected(node: XiaomiDeviceNode): void {
    }

};