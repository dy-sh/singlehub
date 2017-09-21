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
    uiPanel: string;

    constructor(titlePrefix: string, template: string, uiElementType: string) {
        super();

        this.titlePrefix = titlePrefix;
        this.template = template;
        this.uiElementType = uiElementType;

        this.isDashboardNode = true;

        this.settings["title"] = { description: "Title", type: "string", value: this.titlePrefix };
        this.settings["ui-panel"] = { description: "Ui Panel Name", type: "string" };
    }

    onCreated() {
        if (this.side == Side.server)
            this.container.dashboard.onNodeCreated(this);

        this.changeUiPanel("Container" + this.container.id);
    }

    onAdded() {


        if (this.side == Side.dashboard) {
            let templ = Handlebars.compile(this.template);
            $(templ(this))
                .hide()
                .appendTo("#uiContainer-" + this.container.id)
                .fadeIn(300);
        }

        this.changeTitle();
    }

    onSettingsChanged() {
        this.changeTitle();

        //change ui panel
        if (this.side == Side.server) {
            let panel = this.settings["ui-panel"].value;
            if (this.uiPanel != panel)
                this.changeUiPanel(panel);
        }
    }

    changeUiPanel(name: string) {
        if (this.side == Side.server)
            this.container.dashboard.onNodeChangePanel(this, this.uiPanel, name);

        this.uiPanel = name;
        this.settings["ui-panel"].value = name;
    }

    changeTitle() {
        if (this.side == Side.dashboard) {
            $('#nodeTitle-' + this.id).html(this.settings["title"].value);
        }

        let t = this.settings["title"].value;
        if (t.length > 10)
            t = t.substr(0, 10) + "...";

        if (t == this.titlePrefix || t == "")
            this.title = this.titlePrefix;
        else
            this.title = this.titlePrefix + ": " + t;

        this.size = this.computeSize();
    }

    onRemoved() {
        if (this.side == Side.dashboard) {
            $('#node-' + this.id).fadeOut(300, function () {
                $(this).remove();
            });
        }

        if (this.side == Side.server)
            this.container.dashboard.onNodeRemoved(this);
    }
}