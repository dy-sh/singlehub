/**
 * Created by Derwish (derwish.pro@gmail.com) on 03.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import {Node} from "../../node";
import Utils from "../../utils";
import {Side, Container} from "../../container";
import {UiNode} from "./ui-node";
// import * as moment from 'moment'
// import {DataSet} from "vis";
declare let vis;
declare let moment;
declare let DataSet;


let template =
    '<div class="ui attached clearing segment" id="node-{{id}}">\
        <div class="ui mini right floated basic buttons">\
            <button type="button" class="ui button" id="chart-clear-{{id}}">Clr</button>\
            <button type="button" class="ui button" id="chart-style-{{id}}">Style</button>\
            <button type="button" class="ui button" id="chart-all-{{id}}">All</button>\
            <button type="button" class="ui button" id="chart-now-{{id}}">Now</button>\
            <a href="/Dashboard/Chart/{{id}}" class="ui button" id="chart-open-{{id}}">Open</a>\
        </div>\
        <span id="nodeTitle-{{id}}"></span>\
        <br />\
        <br />\
        <div id="chart-panel-{{id}}-">\
            <div id="chart-body-{{id}}"></div>\
        </div>\
    </div>';


export class UiChartNode extends UiNode {
    //server side
    UPDATE_INTERVAL: number;
    lastData: any;
    dataUpdated = false;

    //client side
    CHART_HEIGHT = "190px";
    body: HTMLElement;
    dataset;
    graph2d;
    options;


    constructor() {
        super("Chart", template);

        this.UPDATE_INTERVAL = 300;

        this.descriprion = "";
        this.properties['log'] = [];
        this.settings['maxRecords'] = {description: "Max Records", type: "number", value: 10};
        this.settings['style'] = {description: "Style", type: "string", value: "bars"};
        this.settings['autoScroll'] = {description: "Auto scroll", type: "string", value: "continuous"};

        this.addInput("input");
    }


    onAdded() {
        super.onAdded();

        if (this.side == Side.dashboard) {
            this.createChart();

        }

        if (this.side == Side.server)
            this.startSending();
    }

    startSending() {
        let that = this;
        setInterval(function () {
            if (that.dataUpdated) {
                that.dataUpdated = false;
                that.sendMessageToEditorSide({value: that.lastData});
            }
        }, this.UPDATE_INTERVAL);
    }

    onInputUpdated() {
        //store for sending later
        let val = this.getInputData(0);
        this.lastData = val;
        this.dataUpdated = true;
        this.isRecentlyActive = true;

        //add to log
        let records = this.properties['log'];
        let record = {date: Date.now(), value: val};
        records.push(record);

        let max = this.settings['maxRecords'].value;
        let unwanted = records.length - max;
        records.splice(0, unwanted);
    };


    onGetMessageToServerSide(data) {
        if (data.clear) {
            this.isRecentlyActive = true;
            this.properties['log'] = [];
            this.sendMessageToDashboardSide({clear: true});
        }

        if (data.style) {
            this.settings['style'].value = data.style;
            this.sendMessageToServerSide({style: data.style});
        }
    };


    onGetMessageToDashboardSide(data) {
        if (data.clear)
            this.dataset.clear();

        if (data.record)
            this.addChartData(data.record);

        if (data.style) {
            this.settings['style'].value = data.style;
            this.updateChartType();
        }
    };


    createChart() {
        let that = this;

        // if (this.properties['log'].length > 0) {
        //     let log = $('#log-' + this.id);
        //     for (let record of  this.properties['log']) {
        //         //add data
        //     }
        // }

        $('#chart-clear-' + this.id).click(function () {
            that.sendMessageToServerSide('clear');
        });

        $('#chart-now-' + this.id).click(function () {
            that.showNow();
        });

        $('#chart-all-' + this.id).click(function () {
            that.showAll();
        });

        $('#chart-style-' + this.id).click(function () {
            that.changeStyle();
        });


        this.body = document.getElementById('chart-body-' + this.id);


        this.options = {
            height: this.CHART_HEIGHT,
            style: 'bar',
            drawPoints: false,
            barChart: {width: 50, align: 'right', sideBySide: false}
        };

        this.dataset = new vis.DataSet();
        this.graph2d = new (<any>vis).Graph2d(this.body, this.dataset, this.options);

        this.updateChartType();


        //Loading data frow server
        this.showNow();
        // $.ajax({
        //     url: "/DashboardAPI/GetValue/",
        //     data: {'nodeId': this.id, 'name': "chartData"},
        //     dataType: "json",
        //     success: function (chartData) {
        //         // dataset.clear();
        //         if (chartData != null) {
        //             this.addChartData(chartData);
        //
        //             let options = {
        //                 start: moment().add(-30, 'seconds'),
        //                 end: moment()
        //             };
        //
        //             this.graph2d.setOptions(options);
        //         } else {
        //             this.showNow();
        //         }
        //     }
        // });
    }

    lastChartData = {};


    addChartData(chartData) {
        let max = this.settings['maxRecords'].value;
        this.dataset.add(chartData);
        if (chartData.length != undefined)
            this.lastChartData = chartData[chartData.length - 1].x;
        else
            this.lastChartData = chartData.x;


        //let options = {
        //    dataAxis: {
        //        left: {
        //            range: {
        //                min: Number(dataset.min('y').y),
        //                max: Number(dataset.max('y').y)
        //            }
        //        }
        //    }
        //};
        //graph2d.setOptions(options);

        //graph2d.linegraph.options.dataAxis.left.range.min = dataset.min('y').y;
        //graph2d.linegraph.options.dataAxis.left.range.max = dataset.max('y').y;

        let unwanted = this.dataset.length - max;
        if (unwanted > 0) {
            let items = this.dataset.get();
            for (let i = 0; i < unwanted; i++) {
                this.dataset.remove(items[i]);
            }
        }
    }


    renderStep() {
        let now: any = moment();

        let range = this.graph2d.getWindow();
        let interval = range.end - range.start;
        switch (this.settings['autoScroll'].value) {
            case 'continuous':
                this.graph2d.setWindow(now - interval, now, {animation: false});
                break;
            case 'none':
                break;
            default: // 'static'
                // move the window 90% to the left when now is larger than the end of the window
                if (now > range.end) {
                    this.graph2d.setWindow(now - 0.1 * interval, now + 0.9 * interval);
                }
                break;
        }

        requestAnimationFrame(this.renderStep);
    }


    updateChartType() {
        switch (this.settings['style'].value) {
            case 'bars':
                this.options = {
                    height: this.CHART_HEIGHT,
                    style: 'bar',
                    drawPoints: false,
                    barChart: {width: 50, align: 'right', sideBySide: false}
                };
                break;
            case 'splines':
                this.options = {
                    height: this.CHART_HEIGHT,
                    style: 'line',
                    drawPoints: {style: 'circle', size: 6},
                    shaded: {enabled: false},
                    interpolation: {enabled: true}
                };
                break;
            case 'shadedsplines':
                this.options = {
                    style: 'line',
                    height: this.CHART_HEIGHT,
                    drawPoints: {style: 'circle', size: 6},
                    shaded: {enabled: true, orientation: 'bottom'},
                    interpolation: {enabled: true}
                };
                break;
            case 'lines':
                this.options = {
                    height: this.CHART_HEIGHT,
                    style: 'line',
                    drawPoints: {style: 'square', size: 6},
                    shaded: {enabled: false},
                    interpolation: {enabled: false}
                };
                break;
            case 'shadedlines':
                this.options = {
                    height: this.CHART_HEIGHT,
                    style: 'line',
                    drawPoints: {style: 'square', size: 6},
                    shaded: {enabled: true, orientation: 'bottom'},
                    interpolation: {enabled: false}
                };
                break;
            case 'dots':
                this.options = {
                    height: this.CHART_HEIGHT,
                    style: 'points',
                    drawPoints: {style: 'circle', size: 10}
                };
                break;
            default:
                break;
        }


        //setOptions cause a bug when switching to dots!!!
        this.graph2d.setOptions(this.options);
        //thats why we need redraw:
        //redrawChart(options);


    }

    redrawChart(options,) {
        let window = this.graph2d.getWindow();
        options.start = window.start;
        options.end = window.end;
        this.graph2d.destroy();
        this.graph2d = new (<any>vis).Graph2d(this.body, this.dataset, options);
    }


    zoomTimer: any;

    showNow() {

        clearTimeout(this.zoomTimer);
        this.settings['autoScroll'].value = "none";
        let window = {
            start: moment().add(-30, 'seconds'),
            end: moment()
        };
        this.graph2d.setWindow(window);
        //timer needed for prevent zoomin freeze bug
        this.zoomTimer = setTimeout(function (parameters) {
            this.autoScroll = "continuous";
        }, 1000);

    }

    showAll() {
        clearTimeout(this.zoomTimer);
        this.settings['autoScroll'].value = "none";
        //   graph2d.fit();

        let start, end;

        if (this.dataset.length == 0) {
            start = moment().add(-1, 'seconds');
            end = moment().add(60, 'seconds');
        } else {
            let min = this.dataset.min('x');
            let max = this.dataset.max('x');
            start = moment(min.x).add(-1, 'seconds');
            end = moment(max.x).add(60, 'seconds');
        }

        let window = {
            start: start,
            end: end
        };
        this.graph2d.setWindow(window);
    }


    changeStyle() {
        let val;
        switch (this.settings['style'].value) {
            case 'bars':
                val = 'splines';
                break;
            case 'splines':
                val = 'shadedsplines';
                break;
            case 'shadedsplines':
                val = 'lines';
                break;
            case 'lines':
                val = 'shadedlines';
                break;
            case 'shadedlines':
                val = 'dots';
                break;
            case 'dots':
                val = 'bars';
                break;
            default:
                break;
        }

        this.settings['style'].value = val;

        this.updateChartType();

        this.sendMessageToServerSide({style: val});
    }
}

Container.registerNodeType("ui/chart", UiChartNode);

