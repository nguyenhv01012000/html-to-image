var express = require('express');
var app = express();
var fs = require('fs');
const puppeteer = require('puppeteer');
var bodyParser = require('body-parser')
var multer = require('multer');
var forms = multer();
app.use(bodyParser.json());
app.use(forms.array()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    (async () => {
        const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const page = await browser.newPage();
        await page.goto(req.body.url)
        const a = await page.screenshot({ encoding: "base64" });

        await browser.close();
        await res.send(a);
      })()
    });

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});