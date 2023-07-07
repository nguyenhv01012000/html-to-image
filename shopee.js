var express = require('express');
var app = express();
const puppeteer = require('puppeteer')
var bodyParser = require('body-parser');
var textract = require('textract');
const path = require("path");
const fileUpload = require("express-fileupload");
var multer = require('multer');
var forms = multer();
app.use(bodyParser.json());
app.use(forms.array());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post('/upload', fileUpload({ createParentPath: true }), async (req, res) => {
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ["--no-sandbox", "--incognito"],
      //userDataDir: '/dev/null',
      executablePath: '/usr/bin/google-chrome-stable'
    });
  } catch (e) {
    // catch errors and send error status
    console.error(e);
    res.send(`Something went wrong while running: ${e}`);
  }

  if (browser == null) {
    return;
  }

  const files = req.files
  let addProducts = [];
  let reportProducts = [];
  let cookies = [];
  let search = [];

  Object.keys(files).forEach(key => {
    textract.fromBufferWithName(files[key].name, files[key].data, async function (error, text) {
      const myArray = text.split(" ");
      let j = 0;
      for (let i = 1; i < myArray.length; i++) {
        if (myArray[i] == "San_pham_report") { j = i; break; }
        if (myArray[i] != '') cookies.push(handleCookie(myArray[i]));
      }

      for (let i = j + 1; i < myArray.length; i++) {
        if (myArray[i] == "Them_san_pham") { j = i; break; }
        if (myArray[i] != '') reportProducts.push(myArray[i])
      }

      for (let i = j + 1; i < myArray.length; i++) {
        if (myArray[i] == "Tu_khoa_tim_kiem") { j = i; break; }
        if (myArray[i] != '') addProducts.push(myArray[i])
      }

      for (let i = j + 1; i < myArray.length; i++) {
        if (myArray[i] != '') search.push(myArray[i])
      }

      try {
        for (let i in cookies) {
          await autoReport(cookies[i], search, addProducts, reportProducts, browser);
        }
      } catch (e) {
        // catch errors and send error status
        console.error(e);
      } finally {
        await browser?.close();
      }

    });
  });

  return res.json({ status: 'Thành công!', message: "" })
});

app.post('/report', async (req, res) => {
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ["--no-sandbox", "--incognito"],
      //userDataDir: '/dev/null',
      executablePath: '/usr/bin/google-chrome-stable'
    });
  } catch (e) {
    // catch errors and send error status
    console.error(e);
    res.send(`Something went wrong while running: ${e}`);
  }

  if (browser == null) {
    return;
  }

  let addProducts = [];
  let reportProducts = [];
  let cookies = [];
  let search = [];


  let myArray = req.body.cookies.split(",,,");
  for (let i = 0; i < myArray.length; i++) {
    if (myArray[i] != '') cookies.push(handleCookie(myArray[i]));
  }

  myArray = req.body.San_pham_report.split(",,,");
  for (let i = 0; i < myArray.length; i++) {
    if (myArray[i] != '') reportProducts.push(myArray[i])
  }

  myArray = req.body.Them_san_pham.split(",,,");
  for (let i = 0; i < myArray.length; i++) {
    if (myArray[i] != '') addProducts.push(myArray[i])
  }

  myArray = req.body.Tu_khoa_tim_kiem.split(",,,");
  for (let i = 0; i < myArray.length; i++) {
    if (myArray[i] != '') search.push(myArray[i])
  }

  try {
    for (let i in cookies) {
      await autoReport(cookies[i], search, addProducts, reportProducts, browser);
    }
  } catch (e) {
    // catch errors and send error status
    console.error(e);
  } finally {
    await browser?.close();
  }


  return res.json({ status: 'Thành công!', message: "" });
});

function handleCookie(cookie) {
  let fields = cookie.split("shopee.vn=");
  let result = []
  for (let i = 1; i < fields.length; i++) {
    let name = fields[i].substr(0, fields[i].search("="));
    let value = fields[i].substr(fields[i].search("=") + 1, fields[i].length);
    if (value[value.length - 1] == '.') value = value.substr(0, value.length - 2);
    else value = value.substr(0, value.length - 1);
    result.push({ 'name': name, 'value': value })
  }
  return result;
}

async function autoReport(cookies, search, addProducts, reportProducts, browser) {
  if (browser == null) {
    return;
  }
  let context = await browser.createIncognitoBrowserContext();
  let page = await context.newPage();
  await page.goto("https://shopee.vn");
  await page.setCookie(...cookies);
  await page.cookies("https://shopee.vn");

  // await page.waitForSelector('input[type="text"]')
  // await page.type('input[type="text"]', user);
  // await page.waitForSelector('input[type="password"]')
  // await page.type('input[type="password"]', password);
  // await page.click('input[type="password"]');
  // await page.keyboard.press('Enter');
  //await page.waitForNavigation();

  for (let i in search) {
    try {
      await page.waitForSelector('input[aria-controls="shopee-searchbar-listbox"]')
      await page.type('input[aria-controls="shopee-searchbar-listbox"]', search[i]);
      await page.keyboard.press('Enter');
      await page.waitForSelector('a[class="_6om6sz"]');
      await page.click('a[class="_6om6sz"]');
    } catch (e) {
      // catch errors and send error status
      console.error("invalid search:" + search[i]);
      console.error(e);
    }
  };

  for (let i in addProducts) {
    try {
      await page.goto(addProducts[i]);
      await page.waitForSelector('button[class="btn btn-tinted btn--l iFo-rx QA-ylc"]');
      await page.click('button[class="btn btn-tinted btn--l iFo-rx QA-ylc"]');
    } catch (e) {
      // catch errors and send error status
      console.error("invalid URL:" + addProducts[i]);
      console.error(e);
    }
  };

  for (let i in reportProducts) {
    try {
      await page.goto(reportProducts[i]);
      await page.waitForSelector('button[class="GyD5JO"]');
      await page.click('button[class="GyD5JO"]');
      const linkHandlers = await page.waitForXPath("//li[contains(text(), 'Hàng giả, hàng nhái')]");
      await linkHandlers.click();
      await page.type('textarea[placeholder="Mô tả tố cáo (vui lòng nhập từ 10-50 ký tự)"]', 'Hàng kém chất lượng');
      await page.waitForSelector('button[class="btn btn-solid-primary btn--s btn--inline"]')
      await page.click('button[class="btn btn-solid-primary btn--s btn--inline"]');
      await page.waitForXPath("//div[contains(text(), 'Tố cáo thành công')]");
    } catch (e) {
      // catch errors and send error status
      console.error("invalid URL:" + reportProducts[i]);
      console.error(e);
    }
  };
  await context.close();
}


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});