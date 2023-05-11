var express = require('express');
var app = express();
var fs = require('fs');
const puppeteer = require('puppeteer');
var bodyParser = require('body-parser')
app.use(bodyParser.text({ type: 'text/html' }))

app.get('/', function (req, res) {
    (async () => {
        const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const page = await browser.newPage();
        await page.setContent( req.body );
        const a = await page.screenshot({ encoding: "base64" });

        await browser.close();
        await res.send(a);
      })()
    });

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});