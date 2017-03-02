/**
 * Created by Derwish (derwish.pro@gmail.com) on 24.02.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

var MAIN_PANEL_ID = "Main";

var elementsFadeTime = 300;



var labelTemplate = Handlebars.compile($('#labelTemplate').html());
var progressTemplate = Handlebars.compile($('#progressTemplate').html());
var buttonTemplate = Handlebars.compile($('#buttonTemplate').html());
var toggleButtonTemplate = Handlebars.compile($('#toggleButtonTemplate').html());
var switchTemplate = Handlebars.compile($('#switchTemplate').html());
var stateTemplate = Handlebars.compile($('#stateTemplate').html());
var textBoxTemplate = Handlebars.compile($('#textBoxTemplate').html());
var chartTemplate = Handlebars.compile($('#chartTemplate').html());














function createProgress(node) {
    $(progressTemplate(node)).hide().appendTo("#uiContainer-" + node.PanelId).fadeIn(elementsFadeTime);
}









function updateProgress(node) {
    //if (uidata.value == null)
    //    uidata.value = 0;

    if (data.value > 100)
        data.value = 100;

    if (data.value < 0)
        data.value = 0;

    $('#progressName-' + this.id).html(node.Settings["Name"].Value);
    $('#progressBar-' + this.id).progress({
        percent: data.value,
        showActivity: false
    });
}








}

