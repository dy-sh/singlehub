/**
 * Created by Derwish (derwish.pro@gmail.com) on 24.02.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


function updateVoiceGoogle(node) {
    $('#voiceName-' + node.Id).html(node.Settings["Name"].Value);

    if (node.Value == null || node.Value == "")
        return;

    var msg = new SpeechSynthesisUtterance(node.Value);
    window.speechSynthesis.speak(msg);
}

