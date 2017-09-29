/**
 * Created by Derwish (derwish.pro@gmail.com) on 15.09.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Database } from "../../public/interfaces/database";
import { Container } from "../nodes/container";
import { Node } from "../nodes/node";
import { UiNode } from "../nodes/nodes/ui/ui-node";
import { DashboardServerSocket } from "../../modules/server/dashboard-server-socket";


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
    containerId: number;
    nodeId: number;
    value?: any;
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
            this.updateElementsStates();
        })
    }

    onNodeCreated(node: UiNode) {
        if (!node.isDashboardNode)
            return;
    }

    onNodeRemoved(node: UiNode) {
        if (!node.isDashboardNode)
            return;

        this.removeElemetForNode(node);
        this.removeEmptyPanels();
        this.socket.io.emit("getUiPanel", this.getUiPanel(node.uiPanel));
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
        this.socket.io.emit("getUiPanel", this.getUiPanel(newName))
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
        var oldPanel = this.getUiPanel(node.uiPanel);
        if (oldPanel) {
            //remove old element
            for (var s = 0; s < oldPanel.subPanels.length; s++) {
                var subPanel = oldPanel.subPanels[s];
                for (var e = 0; e < subPanel.uiElements.length; e++) {
                    var element = subPanel.uiElements[e];
                    if (element.containerId == node.container.id && element.nodeId == node.id) {
                        subPanel.uiElements.splice(e, 1);

                        if (this.db)
                            this.db.updateUiPanel(oldPanel.name, { $set: { subPanels: oldPanel.subPanels } })
                        // return;
                    }
                }
            }
        }
    }

    updateElementsStates() {
        this.uiPanels.forEach(p => {
            p.subPanels.forEach(s => {
                s.uiElements.forEach(e => {
                    let container = Container.containers[e.containerId];
                    if (container) {
                        let node = container._nodes[e.nodeId];
                        if (node) {
                            e.value = node.properties['value'];
                        }
                        else console.log("Can't update dashboard element state. Node [ " + e.containerId + "/" + e.nodeId + "] is not found");
                    }
                    else console.log("Can't update dashboard element state. Node container [" + e.containerId + "] is not found");
                    e.value
                })
            })
        });
    }

    updateElementStateForNode(node: UiNode) {
        let element = this.getUiElementForNode(node);
        if (element)
            element.value = node.properties['value'];
        else console.log("Can't update dashboard element state. Element for node " + node.getReadableId() + " is not found");
    }

    getUiElementForNode(node: UiNode): UiElement {
        var panel = this.getUiPanel(node.uiPanel);
        if (!panel)
            return;

        for (var s = 0; s < panel.subPanels.length; s++) {
            var subPanel = panel.subPanels[s];
            for (var e = 0; e < subPanel.uiElements.length; e++) {
                var element = subPanel.uiElements[e];
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

