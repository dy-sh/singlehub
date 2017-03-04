/*  MyNodes.NET 
    Copyright (C) 2016 Derwish <derwish.pro@gmail.com>
    License: http://www.gnu.org/licenses/gpl-3.0.txt  
*/



function updateLog(node) {

    var now = moment().format("DD.MM.YYYY H:mm:ss");
    $('#history-table').append("<tr><td>" + now + "</td><td>" + node.State + "</td></tr>");
}

$('#clear-button').click(function () {
    $.ajax({
        url: "/DashboardAPI/ClearLog/",
        type: "POST",
        data: { nodeId: nodeId },
        success: function (connected) {
            $('#history-table').empty();
        }
    });
});