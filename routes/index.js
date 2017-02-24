/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'express'], factory);
    }
})(function (require, exports) {
    "use strict";
    const express = require('express');
    var router = express.Router();
    /* GET home page. */
    router.get('/', function (req, res, next) {
        res.redirect('/editor/');
        //res.render('index', { title: 'Express' });
    });
    module.exports = router;
});
//# sourceMappingURL=index.js.map