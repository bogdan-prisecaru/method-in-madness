const webpack = require('webpack');
const webpackConfig = require('../tools/webpack.config.js');
const http = require('http');
const express = require('express');
const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');

/**
 * Mock
 */
const ChordMock = require('./mock/chord.js');

const app = express();
const compiler = webpack(webpackConfig());

app.use(devMiddleware(compiler));
app.use(hotMiddleware(compiler));
app.use(express.static('dist'));

const server = app.listen(3000, () => console.log(`*** Express Server : Listening on port 3000 ***`));

// const io = require('socket.io').listen(server);
//
// io.on('connection', (client) => {
//   client.on('connect', function() {
//     // socket.emit('chord', new ChordMock(10, 100).nodes);
//     console.log('connected!');
//
//     client.on('/test', function(data) {
//       console.log('d', data);
//     });
//   });
// });

// // const server = new http.Server(app);
// const io = require('socket.io').listen(app.listen(3000));
//
// io.on('connection', (socket) => {
//
//   socket.on('/api', function() {
//     console.log('@@ lol');;
//   });
//
// });
//
// // app.listen(3000, () => console.log(`*** Express Server : Listening on port 3000 ***`));
