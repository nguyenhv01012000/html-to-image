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

app.get('/', async (req, res) => {
    try {    
      const browser = await puppeteer.launch({headless: 'new'});
      const page = await browser.newPage();
      await page.goto(req.body.url)
      let screenshot = await page.screenshot({ encoding: "base64" });

      await browser.close();
      res.send(screenshot)
    } catch(e) {
        // catch errors and send error status
        console.log(e);
        res.sendStatus(500);
    } 
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});