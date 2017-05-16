import { IXiomiDeviceModel, XiaomiDeviceNode } from '../xiaomi-device';

export default class PowerPlug implements IXiomiDeviceModel {
    onCreate(node: XiaomiDeviceNode): void {
        console.log("created!!!");
    }
    onConnect(node: XiaomiDeviceNode): void {
    }
    onDisconnect(node: XiaomiDeviceNode): void {
    }

};