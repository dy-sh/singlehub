/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Node } from "../../node";
import { Container, Side } from "../../container";


export class UiNode extends Node {

    titlePrefix: string;
    template: string;
    uiElementType: string;


    constructor(titlePrefix: string, uiElementType: string) {
        super();

        this.titlePrefix = titlePrefix;
        this.uiElementType = uiElementType;

        this.isDashboardNode = true;

        this.settings["title"] = { description: "Title", type: "string", value: this.titlePrefix };
        this.settings["ui-panel"] = { description: "Ui Panel Name", type: "string" };
    }

    onCreated() {
        this.settings["ui-panel"].value = "Container" + this.container.id;

        if (this.side == Side.server) {
            this.container.dashboard.onNodeChangePanelOrTitle(
                this, this.settings["ui-panel"].value, this.settings["title"].value);
        }
    }

    onAdded() {
        this.changeTitle(this.settings["title"].value);
    }

    onBeforeSettingsChange(newSettings) {

        //change ui panel
        if (this.side == Side.server) {
            if (newSettings["ui-panel"].value != this.settings["ui-panel"].value
                || newSettings["title"].value != this.settings["title"].value) {
                this.container.dashboard.onNodeChangePanelOrTitle(
                    this, newSettings["ui-panel"].value, newSettings["title"].value);
            }
        }

        //change title
        this.changeTitle(newSettings['title'].value);
    }



    changeTitle(title: string) {
        let t = title;
        if (t.length > 10)
            t = t.substr(0, 10) + "...";

        if (t == this.titlePrefix || t == "")
            this.title = this.titlePrefix;
        else
            this.title = this.titlePrefix + ": " + t;

        this.size = this.computeSize();
    }

    onRemoved() {
        if (this.side == Side.server)
            this.container.dashboard.onNodeRemoved(this);
    }

    updateDahboardElementState() {
        this.container.dashboard.updateElementStateForNode(this);
    }
}