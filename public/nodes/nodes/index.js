/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./main", "./debug", "./math", "./ui/label", "./ui/toggle", "./ui/state", "./ui/button", "./ui/switch", "./ui/slider", "./ui/rgb-sliders", "./ui/rgbw-sliders", "./ui/text-box", "./ui/progress", "./ui/log", "./ui/audio", "./ui/voice-chrome", "./ui/voice-yandex", "./ui/chart"], factory);
    }
})(function (require, exports) {
    "use strict";
    /**
     * Add all new nodes classes here!!!
     */
    require("./main");
    require("./debug");
    require("./math");
    require("./ui/label");
    require("./ui/toggle");
    require("./ui/state");
    require("./ui/button");
    require("./ui/switch");
    require("./ui/slider");
    require("./ui/rgb-sliders");
    require("./ui/rgbw-sliders");
    require("./ui/text-box");
    require("./ui/progress");
    require("./ui/log");
    require("./ui/audio");
    require("./ui/voice-chrome");
    require("./ui/voice-yandex");
    require("./ui/chart");
});
//# sourceMappingURL=index.js.map