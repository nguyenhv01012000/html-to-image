var express = require('express');
var app = express();
var fs = require('fs');
const puppeteer = require('puppeteer');
var bodyParser = require('body-parser')
app.use(bodyParser.text({ type: 'text/html' }))

app.get('/', function (req, res) {
    (async () => {
        const browser = await puppeteer.launch({headless: 'new'});
        const page = await browser.newPage();
        await page.setContent( req.body );
        await page.screenshot({path: 'example.png'});
      
        await browser.close();
        await res.send(fs.readFileSync('example.png', 'base64'))
      })()
    });

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});