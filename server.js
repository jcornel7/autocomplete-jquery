var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.sendFile('./public/index.html', {root: __dirname });
});

app.use(express.static('public'));

app.listen(3000);

console.log("Server listening on port 3000");
