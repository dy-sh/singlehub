/**
 * Created by Derwish (derwish.pro@gmail.com) on 15.09.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { UiPanel } from "./ui-panel";
import { Database } from "../../public/interfaces/database";
import { Container } from "../nodes/container";
import { Node } from "../nodes/node";
import { UiNode } from "../nodes/nodes/ui/ui-node";



export class Dashboard {
    db: Database;
    uiPanels: Array<UiPanel> = [];

    constructor(db: Database) {
        this.db = db;
        this.uiPanels = db.getUiPanels();
        Container.containers[0].dashboard = this;
        Container.containers[0].on("created", this.onNodeCreated)
        Container.containers[0].on("removed", this.onNodeRemoved)
    }

    onNodeCreated(node: Node) {
        if (!node.isDashboardNode)
            return;

    }

    onNodeRemoved(node: Node) {
        if (!node.isDashboardNode)
            return;
    }

    addUiPanel(panel: UiPanel, callback?: (err?: Error, doc?: UiPanel) => void) {
        this.uiPanels.push(panel);
        this.db.addUiPanel(panel, callback);

        // return this.db.addUiPanel(panel, (err, doc) => {
        //     if (!err)
        //         this.uiPanels.push(panel);
        //     callback(err, doc);
        // });
    };

    getUiPanels(callback?: (err?: Error, docs?: Array<UiPanel>) => void) {
        return this.uiPanels;
    };

    getUiPanel(name: string, callback?: (err?: Error, doc?: UiPanel) => void) {
        return this.uiPanels.some(p => p.name === name);
    };

    updateUiPanel(name: string, update: any, callback?: (err?: Error) => void) {
        this.db.updateUiPanel(name, update, (err) => {
            if (!err) {
                callback(err);
                return;
            }
            this.getUiPanel(name, (err, doc) => {
                if (err) {
                    callback(err);
                    return;
                }
                this.uiPanels = this.uiPanels.filter(p => p.name != name);
                this.uiPanels.push(doc);
            })
        });
    };

    removeUiPanel(name: string, callback?: (err?: Error) => void) {
        this.uiPanels = this.uiPanels.filter(p => p.name != name);
        this.db.removeUiPanel(name, callback);
    };

    dropUiPanels(callback?: (err?: Error) => void) {
        this.uiPanels = [];
        this.db.dropUiPanels(callback);
    };


}

