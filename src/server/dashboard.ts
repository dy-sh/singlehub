/**
 * Created by Derwish (derwish.pro@gmail.com) on 15.09.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Database } from "../database/database";
import { Container } from "../nodes/container";
import { Node } from "../nodes/node";
import { UiNode } from "../nodes/nodes/ui/ui-node";
import { DashboardServerSocket } from "./dashboard-server-socket";


export interface UiPanel {
    name: string;
    title: string;
    icon: string;
    // order: number;
    subPanels: Array<UiSubpanel>;
}

export interface UiSubpanel {
    title: string;
    uiElements: Array<UiElement>;
}

export interface UiElement {
    title: string;
    type: string;

    //link to node
    cid: number;
    id: number;
    // state?: any;
}





export class Dashboard {
    db: Database;
    uiPanels: Array<UiPanel>;
    socket: DashboardServerSocket;

    constructor(socket: DashboardServerSocket) {
        this.socket = socket;
        this.uiPanels = [];
    }

    loadFromDatabase(db: Database) {
        this.db = db;
        db.getUiPanels((err, docs) => {
            if (err) return console.log(err);

            this.uiPanels = docs || [];
        })
    }

    // onNodeCreated(node: UiNode) {
    //     if (!node.isDashboardNode)
    //         return;
    // }

    onNodeRemoved(node: UiNode) {
        if (!node.isDashboardNode)
            return;

        this.removeElemetForNode(node);
        this.removeEmptyPanels();
        this.socket.io.emit("getUiPanel", this.getUiPanel(node.settings["ui-panel"].value));
    }



    onNodeChangePanelOrTitle(node: UiNode, newPanelName: string, newTitle: string) {
        this.removeElemetForNode(node);

        //add new element
        var uiElemet: UiElement = {
            title: newTitle,
            type: node.uiElementType,
            cid: node.container.id,
            id: node.id,
            // state: node.properties['state']
        }

        var newPanel = this.getUiPanel(newPanelName);
        if (!newPanel) {
            //add to new panel
            newPanel = this.addUiPanel(newPanelName);
            newPanel.subPanels[0].uiElements.push(uiElemet);

            if (this.db)
                this.db.addUiPanel(newPanel);
        } else {
            //update existing panel
            newPanel.subPanels[0].uiElements.push(uiElemet);

            if (this.db)
                this.db.updateUiPanel(newPanel.name, { $set: { subPanels: newPanel.subPanels } })
        }

        this.removeEmptyPanels();
        this.socket.io.emit("getUiPanelsList", this.getUiPanelsList())
        this.socket.io.emit("getUiPanel", this.getUiPanel(newPanelName))
    }


    removeEmptyPanels() {
        let changed = false;
        for (var p = 0; p < this.uiPanels.length; p++) {
            let panel = this.uiPanels[p];
            if (panel.subPanels.every(s => s.uiElements.length == 0)) {
                //reove panel
                changed = true;
                this.uiPanels = this.uiPanels.filter(pan => pan.name != panel.name);

                if (this.db)
                    this.db.removeUiPanel(panel.name);
            }
        }

        if (changed)
            this.socket.io.emit("getUiPanelsList", this.getUiPanelsList());
    }


    removeElemetForNode(node: UiNode) {
        var oldPanel = this.getUiPanel(node.settings["ui-panel"].value);
        if (oldPanel) {
            //remove old element
            for (var s = 0; s < oldPanel.subPanels.length; s++) {
                var subPanel = oldPanel.subPanels[s];
                for (var e = 0; e < subPanel.uiElements.length; e++) {
                    var element = subPanel.uiElements[e];
                    if (element.cid == node.container.id && element.id == node.id) {
                        subPanel.uiElements.splice(e, 1);

                        if (this.db)
                            this.db.updateUiPanel(oldPanel.name, { $set: { subPanels: oldPanel.subPanels } })
                        // return;
                    }
                }
            }
        }
    }

    // updateElementsStates() {
    //     this.uiPanels.forEach(p => {
    //         p.subPanels.forEach(s => {
    //             s.uiElements.forEach(e => {
    //                 let container = Container.containers[e.cid];
    //                 if (container) {
    //                     let node = container._nodes[e.id];
    //                     if (node) {
    //                         e.state = node.properties['state'];
    //                     }
    //                     else console.log("Can't update dashboard element state. Node [ " + e.cid + "/" + e.id + "] is not found");
    //                 }
    //                 else console.log("Can't update dashboard element state. Node container [" + e.cid + "] is not found");
    //             })
    //         })
    //     });
    // }

    // updateElementStateForNode(node: UiNode) {
    //     let element = this.getUiElementForNode(node);
    //     if (element)
    //         element.state = node.properties['state'];
    //     else console.log("Can't update dashboard element state. Element for node " + node.getReadableId() + " is not found");
    // }


    getUiElementForNode(node: UiNode): UiElement {
        var panel = this.getUiPanel(node.settings["ui-panel"].value);
        if (!panel)
            return;

        for (var s = 0; s < panel.subPanels.length; s++) {
            var subPanel = panel.subPanels[s];
            for (var e = 0; e < subPanel.uiElements.length; e++) {
                var element = subPanel.uiElements[e];
                if (element.cid == node.container.id
                    && element.id == node.id)
                    return element;
            }
        }
    };

    getUiPanelForNode(node: UiNode): UiPanel {
        return this.uiPanels.find(p => p.name === node.settings["ui-panel"].value);
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
        var subPanel: UiSubpanel = {
            title: "",
            uiElements: []
        }

        var panel: UiPanel = {
            name: name,
            title: name,
            icon: "label_outline",
            subPanels: [subPanel]
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

