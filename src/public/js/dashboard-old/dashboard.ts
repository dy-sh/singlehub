/**
 * Created by Derwish (derwish.pro@gmail.com) on 24.02.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

var MAIN_PANEL_ID = "Main";

var elementsFadeTime = 300;

var panelTemplate = Handlebars.compile($('#panelTemplate').html());



function checkPanelForRemove(panelId) {
    var panelBody = $('#uiContainer-' + panelId);
    if (panelBody.children().length == 0)
        removePanel(panelId);
}


function createPanel(node) {
    $('#empty-message').hide();

    //create new
    $(panelTemplate(node)).hide().appendTo("#panelsContainer").fadeIn(elementsFadeTime);

    $('#panelTitle-' + node.PanelId).html(node.PanelName);
}

function removePanel(panelId) {
    $('#panel-' + panelId).fadeOut(elementsFadeTime, function () {
        $(this).remove();
    });
}

function updatePanel(node) {
    var settings = JSON.parse(node.properties["Settings"]);
    $('#panelTitle-' + node.id).html(settings.Name.Value);
}


function sortPanel(panelId) {

    var elements = $('#uiContainer-' + panelId).children();
    var count = 0;

    // sort based on timestamp attribute
    (<any>elements).sort(function (a, b) {

        // convert to integers from strings
        a = parseInt($(a).attr("panelIndex"), 10);
        b = parseInt($(b).attr("panelIndex"), 10);
        count += 2;
        // compare
        if (a > b) {
            return 1;
        } else if (a < b) {
            return -1;
        } else {
            return 0;
        }
    });

    var panel = document.getElementById('uiContainer-' + panelId);
    for (let i = 0; i < elements.length; ++i) {
        panel.appendChild(elements[i]);
    }
};