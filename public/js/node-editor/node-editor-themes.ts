/**
 * Created by derwish on 22.01.17.
 */

import {NodesOptions} from "../../nodes/nodes";

export let themes:Array<NodesOptions>=[];

let theme0= new NodesOptions();

theme0.NODE_TITLE_HEIGHT = 16;
theme0.NODE_SLOT_HEIGHT = 15;
theme0.NODE_WIDTH = 150;
theme0.NODE_MIN_WIDTH = 50;
theme0.NODE_COLLAPSED_RADIUS = 10;
theme0.NODE_COLLAPSED_WIDTH = 150;
theme0.CANVAS_GRID_SIZE = 10;

theme0.NODE_TITLE_COLOR = "#C9CAC4";
theme0.NODE_DEFAULT_COLOR = "#262B2F";
theme0.NODE_DEFAULT_BGCOLOR = "#464B4F";

theme0.PANEL_NODE_COLOR = "#464B4F";
theme0.PANEL_NODE_BGCOLOR = "#666B6F";

theme0.IO_NODE_COLOR = "#262B2F";
theme0.IO_NODE_BGCOLOR = "#868B8F";

//theme0.LiteGraph.NODE_DEFAULT_BOXCOLOR = "#262B2F";
theme0.NODE_ACTIVE_BOXCOLOR = "#C9CAC4";
theme0.NODE_DEFAULT_IO_COLOR = "#C9CAC4";
theme0.NODE_OPTIONAL_IO_COLOR = "#999A94";
theme0.NODE_DEFAULT_SHAPE = "round";
theme0.SHADOWS_WIDTH = 1;
theme0.MENU_TEXT_COLOR = "#CCC";
theme0.MENU_BG_COLOR = "#262B2F";
theme0.BG_IMAGE = "/images/litegraph/gridA1.png";
theme0.TITLE_TEXT_FONT = "normal 13px Arial";
theme0.INNER_TEXT_FONT = "normal 12px Arial";

theme0.SELECTION_COLOR = "#FFF";
theme0.SELECTION_WIDTH = 2;

theme0.RENDER_CONNECTION_ARROWS = false;
theme0.CONNECTIONS_WIDTH = 3;
theme0.CONNECTIONS_SHADOW = 1;
theme0.DATATYPE_COLOR =
    {
        0: "#EEE",//AAA
        1: "#9AE",//5AD
        2: "#EB8"//DA5
    };
theme0.LINK_TYPE_COLORS = {0: "#EEE", 1: "#9AE", 2: "#EB8"};

themes.push(theme0);