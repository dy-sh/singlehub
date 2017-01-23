import * as express from 'express';
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('/NodeEditor/');
    //res.render('index', { title: 'Express' });
});

app.use((err: Error & { status: number }, request: express.Request, response: express.Response, next: express.NextFunction): void => {

    response.status(err.status || 500);
    response.json({
        error: "Server error"
    })
});

module.exports = router;
