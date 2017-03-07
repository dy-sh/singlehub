/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "express"], factory);
    }
})(function (require, exports) {
    "use strict";
    const express = require("express");
    var router = express.Router();
    var gateway = require('../modules/mysensors/gateway');
    //var config = require('./../config');
    router.get('/IsConnected', function (req, res) {
        res.json(gateway.isConnected === true);
    });
    router.get('/GetAllNodes', function (req, res) {
        res.json(gateway.nodes);
    });
    module.exports = router;
});
//# sourceMappingURL=api-mysensors.js.map