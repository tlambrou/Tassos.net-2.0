
//**** DEPENDENCIES ****//
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const publicRoot = path.join(__dirname, 'public');

//**** MIDDLEWARE ****//
app.use(function(req, res, next) {
  const acceptsWebp = /\bimage\/webp\b/.test(req.get('accept') || '');
  const requestedExtension = path.extname(req.path).toLowerCase();

  if (!acceptsWebp || !['.jpg', '.jpeg', '.png'].includes(requestedExtension)) {
    next();
    return;
  }

  const requestedPath = path.normalize(req.path).replace(/^(\.\.[/\\])+/, '');
  const webpPath = path.join(
    publicRoot,
    requestedPath.replace(/^[/\\]/, '').replace(/\.(jpe?g|png)$/i, '.webp')
  );

  if (!webpPath.startsWith(publicRoot) || !fs.existsSync(webpPath)) {
    next();
    return;
  }

  res.vary('Accept');
  res.type('image/webp');
  res.sendFile(webpPath);
});

app.use(express.static(publicRoot))

var PORT = process.env.PORT || 3000;

const server = require.main === module
  ? app.listen(PORT, function(req, res) {
      console.log("Tassos.net App listening on port " + PORT + "...");
    })
  : app;

module.exports = { app, server };
