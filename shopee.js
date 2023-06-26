var express = require('express');
var app = express();
const puppeteer = require('puppeteer')
var bodyParser = require('body-parser');
var textract = require('textract');
const path = require("path");
const fileUpload = require("express-fileupload");

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
  let products = [];
  let users = [];
  let passwords = [];

  Object.keys(files).forEach(key => {
    textract.fromBufferWithName(files[key].name, files[key].data, async function (error, text) {
      const myArray = text.split(" ");
      let j = 0;
      for (let i = 2; i < myArray.length; i = i + 2) {
        if (myArray[i] == "Link_product") { j = i; break; }
        if (myArray[i] != '') users.push(myArray[i]);
        if (myArray[i + 1] != '') passwords.push(myArray[i + 1]);
      }
      for (let i = j + 1; i < myArray.length; i++) {
        if (myArray[i] != '') products.push(myArray[i])
      }

      try {
        for (let i in users) {
          await autoReport(users[i], passwords[i], products, browser);
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

async function autoReport(user, password, products, browser) {
  if (browser == null) {
    return;
  }
  let context = await browser.createIncognitoBrowserContext();
  let page = await context.newPage();

  await page.goto("https://shopee.vn/buyer/login");
  await page.keyboard.press('Enter')
  await page.waitForSelector('input[type="text"]')
  await page.type('input[type="text"]', user);
  await page.waitForSelector('input[type="password"]')
  await page.type('input[type="password"]', password);
  await page.click('input[type="password"]');
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
  for (let i in products) {
    try {
      await page.goto(products[i]);
      await page.waitForSelector('button[class="GyD5JO"]');
      await page.click('button[class="GyD5JO"]');
      const linkHandlers = await page.waitForXPath("//li[contains(text(), 'Hàng giả, hàng nhái')]");
      await linkHandlers.click();
      await page.type('textarea[placeholder="Mô tả tố cáo (vui lòng nhập từ 10-50 ký tự)"]', 'Hàng kém chất lượng');
      await page.waitForSelector('button[class="btn btn-solid-primary btn--s btn--inline"]')
      await page.click('button[class="btn btn-solid-primary btn--s btn--inline"]');
      await page.waitForXPath("//div[contains(text(), 'Tố cáo thành công')]");
      await page.screenshot({
        path: 'page.jpg'
      });
    } catch (e) {
      // catch errors and send error status
      console.error("invalid URL:" + products[i]);
      console.error(e);
    }
  };
  await context.close();
}


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});