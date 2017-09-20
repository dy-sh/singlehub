/**
 * Created by Derwish (derwish.pro@gmail.com) on 15.09.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { UiPanel } from "./ui-panel";
import { Database } from "../../public/interfaces/database";
import { Container } from "../nodes/container";
import { Node } from "../nodes/node";
import { UiNode } from "../nodes/nodes/ui/ui-node";
import { UiElement } from "./ui-element";



export class Dashboard {
    db: Database;
    uiPanels: Array<UiPanel> = [];

    constructor(db: Database) {
        this.db = db;
        this.uiPanels = db.getUiPanels();
    }

    onNodeCreated(node: UiNode) {
        if (!node.isDashboardNode)
            return;
    }

    onNodeRemoved(node: UiNode) {
        if (!node.isDashboardNode)
            return;
    }

    onNodeChangePanel(oldName: string, newName: string) {
        console.log("onNodeChangePanel", oldName, newName)
        var oldPanel = this.getUiPanel(oldName);
        if (oldPanel) {

        }
    }


    getUiElementForNode(node: UiNode): UiElement {
        var panel = this.getUiPanel(node.uiPanel);
        if (panel)
            return;

        for (var s = 0; s < panel.subpanels.length; s++) {
            var subpanel = panel.subpanels[s];
            for (var e = 0; e < subpanel.uiElements.length; e++) {
                var element = subpanel.uiElements[e];
                if (element.containerId == node.container.id
                    && element.nodeId == node.id)
                    return element;
            }
        }
    };

    getUiPanelForNode(node: UiNode): UiPanel {
        return this.uiPanels.find(p => p.name === node.uiPanel);
    };


    getUiPanel(name: string): UiPanel {
        return this.uiPanels.find(p => p.name === name);
    };

    // getUiPanels(): Array<UiPanel> {
    //     return this.uiPanels;
    // };



    // addUiPanel(panel: UiPanel, callback?: (err?: Error, doc?: UiPanel) => void) {
    //     this.uiPanels.push(panel);
    //     this.db.addUiPanel(panel, callback);

    //     // return this.db.addUiPanel(panel, (err, doc) => {
    //     //     if (!err)
    //     //         this.uiPanels.push(panel);
    //     //     callback(err, doc);
    //     // });
    // };


    // updateUiPanel(name: string, update: any, callback?: (err?: Error) => void) {
    //     this.db.updateUiPanel(name, update, (err) => {
    //         if (!err) {
    //             callback(err);
    //             return;
    //         }
    //         this.db.getUiPanel(name, (err, doc) => {
    //             if (err) {
    //                 callback(err);
    //                 return;
    //             }
    //             this.uiPanels = this.uiPanels.filter(p => p.name != name);
    //             this.uiPanels.push(doc);
    //         })
    //     });
    // };

    // removeUiPanel(name: string, callback?: (err?: Error) => void) {
    //     this.uiPanels = this.uiPanels.filter(p => p.name != name);
    //     this.db.removeUiPanel(name, callback);
    // };

    // dropUiPanels(callback?: (err?: Error) => void) {
    //     this.uiPanels = [];
    //     this.db.dropUiPanels(callback);
    // };


}

