
//**** DEPENDENCIES ****//
const express = require('express');
const app = express();

//**** MIDDLEWARE ****//
app.use(express.static('public'))

var PORT = process.env.PORT || 3000;

app.listen(PORT, function(req, res) {
  console.log("Tassos.net App listening on port " + PORT + "...");
});
