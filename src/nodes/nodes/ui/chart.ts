/**
 * Created by Derwish (derwish.pro@gmail.com) on 03.03.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../../node";
import Utils from "../../utils";
import { Side, Container } from "../../container";
import { UiNode } from "./ui-node";

declare let vis;
declare let moment;
declare let DataSet;





export class UiChartNode extends UiNode {

    dataset;

    constructor() {
        super("Chart", "UiChartNode");

        this.UPDATE_INPUTS_INTERVAL = 100;

        this.descriprion = "";
        this.properties['log'] = [];
        this.settings['maxRecords'] = { description: "Max Records", value: 100, type: "number" };
        this.settings['saveToDb'] = { description: "Save data to DB", value: false, type: "boolean" };
        this.settings['style'] = { description: "Style", value: "bars", type: "string" };
        this.settings['autoscroll'] = { description: "Auto scroll", value: "continuous", type: "string" };

        this.addInput("input");
    }


    onInputUpdated() {
        let val = this.getInputData(0);

        // this.sendIOValuesToEditor();
        // this.isRecentlyActive = true;

        //add to log
        let records = this.properties['log'];
        let record = { x: Date.now(), y: val };
        records.push(record);

        let max = this.settings['maxRecords'].value;
        records.splice(0, records.length - max);

        //send to dashboard
        this.sendMessageToDashboardSide({ record: record });

        //update in db
        if (this.container.db && this.settings['saveToDb'].value) {
            this.container.db.updateNode(this.id, this.container.id,
                { $push: { "properties.log": { $each: [record], $slice: -max } } });
        }
    };



    onGetMessageToServerSide(data) {
        if (data == "clear") {
            this.isRecentlyActive = true;
            this.properties['log'] = [];
            this.sendMessageToDashboardSide({ log: [] });

            //update in db
            if (this.container.db && this.settings['saveToDb'].value) {
                this.container.db.updateNode(this.id, this.container.id,
                    { $unset: { "properties.log": true } });
            }
        }

        if (data.style) {
            this.settings['style'].value = data.style;
            this.sendMessageToDashboardSide({ style: data.style });
        }

        if (data == "getLog") {
            this.sendMessageToDashboardSide({
                log: this.properties['log'],
                maxRecords: this.settings['maxRecords'].value
            });
        }
    };





    // createChart() {
    //     let that = this;


    //     $('#chart-clear-' + this.id).click(function () {
    //         that.sendMessageToServerSide({ clear: true });
    //     });

    //     $('#chart-now-' + this.id).click(function () {
    //         that.showNow();
    //     });

    //     $('#chart-all-' + this.id).click(function () {
    //         that.showAll();
    //     });

    //     $('#chart-style-' + this.id).click(function () {
    //         that.changeStyle();
    //         that.sendMessageToServerSide({ style: that.settings['style'].value });
    //     });


    //     this.body = document.getElementById('chart-body-' + this.id);


    //     this.options = {
    //         height: this.CHART_HEIGHT,
    //         style: 'bar',
    //         drawPoints: false,
    //         barChart: { width: 50, align: 'right', sideBySide: false }
    //     };

    //     this.dataset = new vis.DataSet();
    //     this.graph2d = new (<any>vis).Graph2d(this.body, this.dataset, this.options);

    //     this.updateChartStyle();

    //     this.showNow();

    //     if (this.properties['log'].length > 0) {
    //         this.addChartData(this.properties['log']);
    //     }

    //     this.renderStep();

    // }


    // addChartData(data) {
    //     this.dataset.add(data);

    //     let max = this.settings['maxRecords'].value;
    //     let unwanted = this.dataset.length - max;
    //     if (unwanted > 0) {
    //         let items = this.dataset.get();
    //         for (let i = 0; i < unwanted; i++) {
    //             this.dataset.remove(items[i]);
    //         }
    //     }
    // }


    // renderStep() {
    //     // move the window (you can think of different strategies).
    //     let now = vis.moment();
    //     let range = this.graph2d.getWindow();
    //     let interval = range.end - range.start;
    //     let that = this;
    //     switch (this.settings['autoscroll'].value) {
    //         case 'continuous':
    //             // continuously move the window
    //             this.graph2d.setWindow(now - interval, now, { animation: false });
    //             requestAnimationFrame(that.renderStep.bind(that));
    //             break;

    //         case 'discrete':
    //             this.graph2d.setWindow(now - interval, now, { animation: false });
    //             setTimeout(that.renderStep.bind(that), 1000);
    //             break;

    //         case 'none': // 'static'
    //             // move the window 90% to the left when now is larger than the end of the window
    //             // if (now > range.end) {
    //             //     this.graph2d.setWindow(now - 0.1 * interval, now + 0.9 * interval);
    //             // }
    //             setTimeout(that.renderStep.bind(that), 1000);
    //             break;
    //     }
    // }


    // updateChartStyle() {
    //     switch (this.settings['style'].value) {
    //         case 'bars':
    //             this.options = {
    //                 height: this.CHART_HEIGHT,
    //                 style: 'bar',
    //                 drawPoints: false,
    //                 barChart: { width: 50, align: 'right', sideBySide: false }
    //             };
    //             break;
    //         case 'splines':
    //             this.options = {
    //                 height: this.CHART_HEIGHT,
    //                 style: 'line',
    //                 drawPoints: { style: 'circle', size: 6 },
    //                 shaded: { enabled: false },
    //                 interpolation: { enabled: true }
    //             };
    //             break;
    //         case 'shadedsplines':
    //             this.options = {
    //                 style: 'line',
    //                 height: this.CHART_HEIGHT,
    //                 drawPoints: { style: 'circle', size: 6 },
    //                 shaded: { enabled: true, orientation: 'bottom' },
    //                 interpolation: { enabled: true }
    //             };
    //             break;
    //         case 'lines':
    //             this.options = {
    //                 height: this.CHART_HEIGHT,
    //                 style: 'line',
    //                 drawPoints: { style: 'square', size: 6 },
    //                 shaded: { enabled: false },
    //                 interpolation: { enabled: false }
    //             };
    //             break;
    //         case 'shadedlines':
    //             this.options = {
    //                 height: this.CHART_HEIGHT,
    //                 style: 'line',
    //                 drawPoints: { style: 'square', size: 6 },
    //                 shaded: { enabled: true, orientation: 'bottom' },
    //                 interpolation: { enabled: false }
    //             };
    //             break;
    //         case 'dots':
    //             this.options = {
    //                 height: this.CHART_HEIGHT,
    //                 style: 'points',
    //                 drawPoints: { style: 'circle', size: 10 }
    //             };
    //             break;
    //         default:
    //             break;
    //     }


    //     //setOptions cause a bug when switching to dots!!!
    //     this.graph2d.setOptions(this.options);
    //     //thats why we need redraw:
    //     //redrawChart(options);


    // }

    // redrawChart(options, ) {
    //     let window = this.graph2d.getWindow();
    //     options.start = window.start;
    //     options.end = window.end;
    //     this.graph2d.destroy();
    //     this.graph2d = new (<any>vis).Graph2d(this.body, this.dataset, options);
    // }


    // zoomTimer: any;

    // showNow() {
    //     let that = this;
    //     clearTimeout(this.zoomTimer);
    //     this.settings['autoscroll'].value = "none";
    //     let window = {
    //         start: vis.moment().add(-30, 'seconds'),
    //         end: vis.moment()
    //     };
    //     this.graph2d.setWindow(window);
    //     //timer needed for prevent zoomin freeze bug
    //     this.zoomTimer = setTimeout(function (parameters) {
    //         that.settings['autoscroll'].value = "continuous";
    //     }, 1000);

    // }

    // showAll() {
    //     clearTimeout(this.zoomTimer);
    //     this.settings['autoscroll'].value = "none";
    //     //   graph2d.fit();

    //     let start, end;

    //     if (this.dataset.length == 0) {
    //         start = vis.moment().add(-1, 'seconds');
    //         end = vis.moment().add(60, 'seconds');
    //     } else {
    //         let min = this.dataset.min('x');
    //         let max = this.dataset.max('x');
    //         start = vis.moment(min.x).add(-1, 'seconds');
    //         end = vis.moment(max.x).add(60, 'seconds');
    //     }

    //     let window = {
    //         start: start,
    //         end: end
    //     };
    //     this.graph2d.setWindow(window);
    // }


    // changeStyle() {
    //     let val;
    //     switch (this.settings['style'].value) {
    //         case 'bars':
    //             val = 'splines';
    //             break;
    //         case 'splines':
    //             val = 'shadedsplines';
    //             break;
    //         case 'shadedsplines':
    //             val = 'lines';
    //             break;
    //         case 'lines':
    //             val = 'shadedlines';
    //             break;
    //         case 'shadedlines':
    //             val = 'dots';
    //             break;
    //         case 'dots':
    //             val = 'bars';
    //             break;
    //         default:
    //             break;
    //     }

    //     this.settings['style'].value = val;

    //     this.updateChartStyle();

    //     this.sendMessageToServerSide({ style: val });
    // }

    // onDashboardGetRequest(req, res) {
    //     //render log page
    //     if (req.params[0] == "/log") {
    //         res.render('dashboard/nodes/chart/log', {
    //             node: this,
    //             records: this.properties['log'],
    //             max_records: this.settings['maxRecords'].value
    //         });
    //     }

    //     //render chart page
    //     res.render('dashboard/nodes/chart/index', {
    //         node: this,
    //         range_start: req.query.start || Date.now() - 30000,
    //         range_end: req.query.end || Date.now(),
    //         autoscroll: req.query.autoscroll || this.settings['autoscroll'].value,
    //         style: req.query.style || this.settings['style'].value,
    //         max_records: this.settings['maxRecords'].value
    //     });
    // }

    // onEditorApiGetRequest(req, res) {
    //     //ajax get log
    //     if (req.params[0] == "/log") {
    //         res.json(this.properties['log']);
    //     }
    // }

    // onEditorApiPostRequest(req, res) {
    //     //ajax get log
    //     if (req.params[0] == "/style") {
    //         this.settings['style'].value = req.body.style;
    //         this.sendMessageToDashboardSide({ style: req.body.style });
    //         res.json("ok");
    //     }
    //     if (req.params[0] == "/clear") {
    //         this.isRecentlyActive = true;
    //         this.properties['log'] = [];
    //         this.sendMessageToDashboardSide({ clear: true });
    //         res.json("ok");
    //     }
    // }
}

Container.registerNodeType("ui/chart", UiChartNode);

