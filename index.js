var express = require('express');
var app = express();
const puppeteer = require('puppeteer');
//const iPhone = puppeteer.devices['iPad Mini'];

// app.get('/', (req, res) => {
//   res.send("success");
// });


app.get('/', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/google-chrome-stable'
  });
  
  try {
    const page = await browser.newPage();
    //await page.emulate(iPhone);
    await page.goto(req.query.url);
    if(req.query.width != null && req.query.height != null)
      await page.setViewport({ width: parseInt(req.query.width), height: parseInt(req.query.height) });
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