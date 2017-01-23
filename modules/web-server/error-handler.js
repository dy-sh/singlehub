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
        res.redirect('/NodeEditor/');
        //res.render('index', { title: 'Express' });
    });
    app.use((err, request, response, next) => {
        response.status(err.status || 500);
        response.json({
            error: "Server error"
        });
    });
    module.exports = router;
});
//# sourceMappingURL=error-handler.js.map