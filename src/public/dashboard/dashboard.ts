/**
 * Created by Derwish (derwish.pro@gmail.com) on 15.09.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Database } from "../../public/interfaces/database";
import { Container } from "../nodes/container";
import { Node } from "../nodes/node";
import { UiNode } from "../nodes/nodes/ui/ui-node";


export interface UiPanel {
    name: string;
    title: string;
    // order: number;
    subpanels: Array<UiSubpanel>;
}

export interface UiSubpanel {
    title: string;
    uiElements: Array<UiElement>;
}

export interface UiElement {
    title: string;
    type: string;

    //link to node
    containerId: Number;
    nodeId: Number;
}



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

    onNodeChangePanel(node: UiNode, oldName: string, newName: string) {
        console.log("onNodeChangePanel", oldName, newName)
        var oldPanel = this.getUiPanel(oldName);
        if (oldPanel) {
            //remove old element

        }

        //add new element
        var newPanel = this.getUiPanel(newName)
            || this.addUiPanel(newName);

        var uiElemet: UiElement = {
            title: node.title,
            type: node.uiElementType,
            containerId: node.container.id,
            nodeId: node.id
        }

        newPanel.subpanels[0].uiElements.push(uiElemet);
        this.db.updateUiPanel(newPanel.name, { subpanels: newPanel.subpanels })
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



    addUiPanel(name: string, callback?: (err?: Error, doc?: UiPanel) => void): UiPanel {
        var subpanel: UiSubpanel = {
            title: "",
            uiElements: []
        }

        var panel: UiPanel = {
            name: name,
            title: name,
            subpanels: [subpanel]
        };

        this.uiPanels.push(panel);
        this.db.addUiPanel(panel, callback);

        return panel;

        // return this.db.addUiPanel(panel, (err, doc) => {
        //     if (!err)
        //         this.uiPanels.push(panel);
        //     callback(err, doc);
        // });
    };


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

