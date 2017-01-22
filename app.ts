/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
import * as express from 'express';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

var app = express();



let config = require('./config');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

if (config.webServer.debug) {
	app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', require('./routes/firstrun'));
app.use('/', require('./routes/index'));
app.use('/Dashboard', require('./routes/dashboard'));
app.use('/NodeEditor', require('./routes/node-editor'));
app.use('/NodeEditorAPI', require('./routes/node-editor-api'));
app.use('/MySensors', require('./routes/mysensors'));
app.use('/MySensorsAPI', require('./routes/mysensors-api'));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
	let err = new Error('Not Found');
	(<any>err).status = 404;
	next(err);
});

// error handlers

// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
// 	app.use(function (err, req, res, next) {
// 		res.status(err.status || 500);
// 		res.render('error', {
// 			message: err.message,
// 			error: err
// 		});
// 	});
// }
//
// // production error handler
// // no stacktraces leaked to user
// app.use(function (err, req, res, next) {
// 	res.status(err.status || 500);
// 	res.render('error', {
// 		message: err.message,
// 		error: {}
// 	});
// });


module.exports = app;
