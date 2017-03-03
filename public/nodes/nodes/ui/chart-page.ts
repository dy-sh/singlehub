/**
 * Created by Derwish (derwish.pro@gmail.com) on 03.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

declare let container_id: number;
declare let node_id: number;
declare let range_start: any;
declare let range_end: any;
declare let autoscroll: string;
declare let style: string;
declare let max_records: number;
declare let vis;
declare let moment;
declare let DataSet;



// --------------------- socket --------------


let socket = io('/dashboard');
let reconnecting = false;

socket.on('connect', function () {
    //jijoin to room
    socket.emit('room', container_id);

    if (reconnecting) {
        noty({text: 'Connection is restored.', type: 'alert'});
        this.reconnecting = false;
    }
});

socket.on('disconnect', function () {
    noty({text: 'Connection is lost!', type: 'error'});
    reconnecting = true;
});

socket.on('node-message-to-dashboard-side', function (n) {
    if (n.cid != container_id || n.id != node_id)
        return;

    addChartData(n.value.value);
});

socket.on('node-settings', function (n) {
    if (n.cid != container_id || n.id != node_id)
        return;

    if (n.settings['maxRecords'])
        max_records = n.settings['maxRecords'].value;
});


//------------------- chart --------------


let groups = new vis.DataSet();
groups.add({id: 0});
let DELAY = 1000; // delay in ms to add new data points
// create a graph2d with an (currently empty) dataset
let chart_body = document.getElementById('visualization');
let dataset = new vis.DataSet();


let options: any = {
    start: range_start,
    end: range_end
};


let graph2d = new vis.Graph2d(chart_body, dataset, groups, options);



function renderStep() {
    let now = vis.moment();
    let range = graph2d.getWindow();
    let interval = range.end - range.start;

    switch (autoscroll) {
        case 'continuous':
            graph2d.setWindow(now - interval, now, {animation: false});
            requestAnimationFrame(renderStep);
            break;
        case 'discrete':
            graph2d.setWindow(now - interval, now, {animation: false});
            setTimeout(renderStep, DELAY);
            break;
        case 'none':
            setTimeout(renderStep, DELAY);
            break;
        default: // 'static'
            // move the window 90% to the left when now is larger than the end of the window
            if (now > range.end) {
                graph2d.setWindow(now - 0.1 * interval, now + 0.9 * interval);
            }
            setTimeout(renderStep, DELAY);
            break;
    }
}


renderStep();

$(document).ready(function () {


    //Get chart data from server
    $.ajax({
        url: "/api/editor/c/" + container_id + "/n/" + node_id + "/log",
        type: "GET",
        success: function (data) {
            $('#infoPanel').hide();
            $('#chartPanel').fadeIn(300);

            if (data) {
                dataset.add(data);
                //force redraw
                graph2d.setOptions(options);
            }
            else
                showAll();

            (<any>$("#chartstyle")).dropdown('set selected', style);
            (<any>$("#autoscroll")).dropdown('set selected', autoscroll);
        },
        error: function () {
            $('#infoPanel').html("<p class='text-danger'>Failed to get data from server!</p>");
        }
    });

    updateChartStyle();
});


function addChartData(data) {
    dataset.add(data);

    let unwanted = dataset.length - max_records;
    if (unwanted > 0) {
        let items = dataset.get();
        for (let i = 0; i < unwanted; i++) {
            dataset.remove(items[i]);
        }
    }
}


function updateChartStyle() {
    switch (style) {
        case 'bars':
            options = {
                height: '370px',
                style: 'bar',
                drawPoints: false,
                barChart: {width: 50, align: 'right', sideBySide: false}
            };
            break;
        case 'splines':
            options = {
                height: '370px',
                style: 'line',
                drawPoints: {style: 'circle', size: 6},
                shaded: {enabled: false},
                interpolation: {enabled: true}
            };
            break;
        case 'shadedsplines':
            options = {
                style: 'line',
                height: '370px',
                drawPoints: {style: 'circle', size: 6},
                shaded: {enabled: true, orientation: 'bottom'},
                interpolation: {enabled: true}
            };
            break;
        case 'lines':
            options = {
                height: '370px',
                style: 'line',
                drawPoints: {style: 'square', size: 6},
                shaded: {enabled: false},
                interpolation: {enabled: false}
            };
            break;
        case 'shadedlines':
            options = {
                height: '370px',
                style: 'line',
                drawPoints: {style: 'square', size: 6},
                shaded: {enabled: true, orientation: 'bottom'},
                interpolation: {enabled: false}
            };
            break;
        case 'dots':
            options = {
                height: '370px',
                style: 'points',
                drawPoints: {style: 'circle', size: 10}
            };
            break;
        default:
            break;
    }


    //setOptions cause a bug when switching to dots!!!
    graph2d.setOptions(options);
    //thats why we need redraw:
    //redrawChart(options);


}

function redrawChart(options) {
    let window = graph2d.getWindow();
    options.start = window.start;
    options.end = window.end;
    graph2d.destroy();
    graph2d = new vis.Graph2d(chart_body, dataset, groups, options);
}


// -------------- zoom --------------------


let zoomTimer;
function showNow() {

    clearTimeout(zoomTimer);
    (<any>$("#autoscroll")).dropdown('set selected', "none");
    let window = {
        start: vis.moment().add(-30, 'seconds'),
        end: vis.moment()
    };
    graph2d.setWindow(window);
    //timer needed for prevent zoomin freeze bug
    zoomTimer = setTimeout(function (parameters) {
        (<any>$("#autoscroll")).dropdown('set selected', "continuous");
    }, 1000);
}


function showAll() {
    clearTimeout(zoomTimer);
    (<any>$("#autoscroll")).dropdown('set selected', "none");
    //graph2d.fit();


    let start, end;

    if (dataset.length == 0) {
        start = vis.moment().add(-1, 'seconds');
        end = vis.moment().add(60, 'seconds');
    } else {
        let min = dataset.min('x');
        let max = dataset.max('x');
        start = vis.moment(min.x).add(-1, 'seconds');
        end = vis.moment(max.x).add(60 * 2, 'seconds');
    }

    let window = {
        start: start,
        end: end
    };
    graph2d.setWindow(window);
}


// -------------- ui controls events --------------------


$('#chartstyle').change(function () {
    style = this.value;
    updateChartStyle();

    $.ajax({
        url: "/api/editor/c/" + container_id + "/n/" + node_id + "/style",
        type: "POST",
        data: {style: style}
    });
});


$('#clear-button').click(function () {
    $.ajax({
        url: "/api/editor/c/" + container_id + "/n/" + node_id + "/clear",
        type: "POST",
        success: function () {
            dataset.clear();
        }
    });
});


$('#share-button').click(function () {
    let url = $(location).attr('host') + $(location).attr('pathname');
    let start = graph2d.getWindow().start;
    let end = graph2d.getWindow().end;
    url += "?autoscroll=" + (<any>$("#autoscroll")).val();
    url += "&style=" + (<any>$("#chartstyle")).val();
    url += "&start=" + start.getTime();
    url += "&end=" + end.getTime();
    (<any>$('#shareModal')).modal('setting', 'transition', 'vertical flip').modal('show');
    $('#url').val(url);
});


$('#autoscroll').change(function () {
    autoscroll = this.value;
});

$('#show-all-button').click(function () {
    showAll();
});

$('#show-now-button').click(function () {
    showNow();
});