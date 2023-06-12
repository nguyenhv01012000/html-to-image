var express = require('express');
var app = express();
const puppeteer = require('puppeteer');
var bodyParser = require('body-parser')
var multer = require('multer');
//const iPhone = puppeteer.devices['iPad Mini'];
var forms = multer();
app.use(bodyParser.json());
app.use(forms.array());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/test', (req, res) => {
  res.send("success");
});


app.get('/convert', async (req, res) => {
  if (req.query.url == null) {
    res.send("url is null");
    return;
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ["--no-sandbox", "--incognito"],
    //userDataDir: '/dev/null',
    executablePath: '/usr/bin/google-chrome-stable'
  });

  if(browser == null) {
    res.send("Browser can't create");
    return;
  }

  try {
    const page = await browser.newPage();
    //await page.emulate(iPhone);
    await page.goto(decodeURI(req.query.url), { waitUntil: 'domcontentloaded'});
    if (req.query.width != null && req.query.height != null)
      await page.setViewport({ width: parseInt(req.query.width), height: parseInt(req.query.height), isMobile:true });

    if(page == null){
      (await browser).close()
      res.send("No space left on device");
    }
    else{
    let screenshot = await page.screenshot({encoding: "base64", fullPage: true});
      (await browser).close()
    res.send(screenshot);
    }
  } catch (e) {
    // catch errors and send error status
    console.error(e);
    (await browser).close();
    res.send(`Something went wrong while running: ${e}`);
  } finally {
    await browser?.close();
  }
});


app.post('/convert', async (req, res) => {

  if (req.body.url == null)  {
    res.send("url is null");
    return;
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ["--no-sandbox", "--incognito"],
    //userDataDir: '/dev/null',
    executablePath: '/usr/bin/google-chrome-stable'
  });

  if(browser == null) {
    res.send("No space left on device");
    return;
  }

  try {
    const page = await browser.newPage();
    await page.goto(decodeURI(req.body.url), { waitUntil: 'domcontentloaded'});
    if (req.body.width != null && req.body.height != null)
      await page.setViewport({ width: parseInt(req.body.width), height: parseInt(req.body.height), isMobile:true });

    if(page == null){
      (await browser).close()
      res.send("No space left on device");
    }
    else{
    let screenshot = await page.screenshot({encoding: "base64", fullPage: true});
      (await browser).close()
    res.send(screenshot);
    }
  } catch (e) {
    // catch errors and send error status
    console.error(e);
    (await browser).close()
    res.send(`Something went wrong while running: ${e}`);
  } finally {
    await browser?.close();
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});