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
    icon: string;
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
    uiPanels: Array<UiPanel>;

    constructor(db: Database) {
        this.db = db;
        this.uiPanels = db.getUiPanels() || [];
    }

    onNodeCreated(node: UiNode) {
        if (!node.isDashboardNode)
            return;
    }

    onNodeRemoved(node: UiNode) {
        if (!node.isDashboardNode)
            return;

        this.removeElemetForNode(node);
    }

    onNodeChangePanel(node: UiNode, newName: string) {
        this.removeElemetForNode(node);

        //add new element
        var uiElemet: UiElement = {
            title: node.title,
            type: node.uiElementType,
            containerId: node.container.id,
            nodeId: node.id
        }

        var newPanel = this.getUiPanel(newName);
        if (!newPanel) {
            //add to new panel
            newPanel = this.addUiPanel(newName);
            newPanel.subpanels[0].uiElements.push(uiElemet);
            this.db.addUiPanel(newPanel);
        } else {
            //update existing panel
            newPanel.subpanels[0].uiElements.push(uiElemet);
            this.db.updateUiPanel(newPanel.name, { $set: { subpanels: newPanel.subpanels } })
        }

    }

    removeElemetForNode(node: UiNode) {
        var oldPanel = this.getUiPanel(node.uiPanel);
        if (oldPanel) {
            //remove old element
            for (var s = 0; s < oldPanel.subpanels.length; s++) {
                var subpanel = oldPanel.subpanels[s];
                for (var e = 0; e < subpanel.uiElements.length; e++) {
                    var element = subpanel.uiElements[e];
                    if (element.containerId == node.container.id && element.nodeId == node.id) {
                        subpanel.uiElements.splice(e, 1);
                        this.db.updateUiPanel(oldPanel.name, { $set: { subpanels: oldPanel.subpanels } })
                        // return;
                    }
                }
            }
        }
    }

    // getUiElementForNode(node: UiNode): UiElement {
    //     var panel = this.getUiPanel(node.uiPanel);
    //     if (panel)
    //         return;

    //     for (var s = 0; s < panel.subpanels.length; s++) {
    //         var subpanel = panel.subpanels[s];
    //         for (var e = 0; e < subpanel.uiElements.length; e++) {
    //             var element = subpanel.uiElements[e];
    //             if (element.containerId == node.container.id
    //                 && element.nodeId == node.id)
    //                 return element;
    //         }
    //     }
    // };

    getUiPanelForNode(node: UiNode): UiPanel {
        return this.uiPanels.find(p => p.name === node.uiPanel);
    };


    getUiPanel(name: string): UiPanel {
        return this.uiPanels.find(p => p.name === name);
    };

    getUiPanels(): Array<UiPanel> {
        return this.uiPanels;
    };

    getUiPanelsList(): Array<string> {
        let arr = [];
        this.uiPanels.forEach(p => {
            arr.push({ name: p.name, title: p.title, icon: p.icon })
        });
        return arr;
    };

    addUiPanel(name: string, callback?: (err?: Error, doc?: UiPanel) => void): UiPanel {
        var subpanel: UiSubpanel = {
            title: "",
            uiElements: []
        }

        var panel: UiPanel = {
            name: name,
            title: name,
            icon: "label_outline",
            subpanels: [subpanel]
        };

        this.uiPanels.push(panel);

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

