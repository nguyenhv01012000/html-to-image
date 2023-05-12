var express = require('express');
var app = express();
const puppeteer = require('puppeteer');
var bodyParser = require('body-parser')
var multer = require('multer');
var forms = multer();
app.use(bodyParser.json());
app.use(forms.array());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/usr/bin/google-chrome-stable'
  });
  try {
    const page = await browser.newPage();
    await page.goto(req.body.url);
    // await page.setViewport({ width: parseInt(req.body.width), height: parseInt(req.body.height) });
    let screenshot = await page.screenshot({ encoding: "base64", fullPage: true });

    res.send(screenshot);
  } catch (e) {
    // catch errors and send error status
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});