/**
 * Created by Derwish (derwish.pro@gmail.com) on 12.03.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { IXiomiDeviceModel, XiaomiDeviceNode } from '../xiaomi-device';
import { Side } from "../../../../container";

export default class PowerPlug implements IXiomiDeviceModel {
    onCreate(node: XiaomiDeviceNode): void {
        node.addInput("power", "boolean");
        node.addOutput("power", "boolean");
    }

    onInputUpdated(node: XiaomiDeviceNode): void {
        //send power state to device
        if (node.device && node.inputs[1].updated) {
            node.device.setPower(0, node.inputs[1].data == true); //convert type to bool, prevent null
        }
    }

    onConnected(node: XiaomiDeviceNode) {
        if (node.side == Side.server) {
            node.device.on('propertyChanged', e => {

                //update output
                if (e.property == "powerChannel0")
                    node.setOutputData(1, e.value);
            });

            node.setOutputData(1, node.device.power("0"));
        }
    }

    onDisconnected(node: XiaomiDeviceNode) {
        if (node.side == Side.server) {
            node.setOutputData(1, null);
        }
    }
};