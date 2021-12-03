const puppeteer = require('puppeteer');
const express = require('express')
const fs = require('fs');
const path = require('path')
const cors = require('cors')
//const sqlite3 = require('sqlite3').verbose();
const _ = require('lodash');
const { argv } = require('process');



const app = express()


app.use(cors())

app.use(express.urlencoded({ extended: true }));





app.set('view engine', 'ejs');

app.use(express.static('./public_new/'))

app.use(express.static('./PDFObject/'))

app.get('/', function (req, res) {
    res.render('index', {
        Src: fs.readdirSync('./pdf')[argv[2]]
    });
});


app.get('/pdf/', function (req, res) {
    res.sendFile(path.join(__dirname, 'pdf', fs.readdirSync('\pdf')[fs.readdirSync('\pdf').indexOf(req.query.name)]));
});





async function translator() {

    const browser = await puppeteer.launch({ headless: false });

    /***************************************************************************************/
    const page_google = await browser.newPage();

    await page_google.setRequestInterception(true);
    page_google.on('request', (req) => {
        if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
            req.abort();
        }
        else {
            req.continue();
        }
    });

    await page_google.goto('https://translate.google.com/?hl=en&tab=rT1&sl=en&tl=fa&op=translate'/* , { waitUntil: 'load', timeout: 0 } */);

    await page_google.waitForSelector('body');



    /***************************************************************************************/
    const page_tarjome = await browser.newPage();

    await page_tarjome.setRequestInterception(true);
    page_tarjome.on('request', (req) => {
        if (/* req.resourceType() == 'stylesheet' || */ req.resourceType() == 'font' || req.resourceType() == 'image') {
            req.abort();
        }
        else {
            req.continue();
        }
    });


    await page_tarjome.goto('https://targoman.ir/'/* , { waitUntil: 'load', timeout: 0 } */);

    await page_tarjome.waitForSelector('body');



    console.log("ready to use");

    app.post('/translate/google', function (req, res) {

        const date = new Date;

        console.log("Minutes:Seconds ", date.getMinutes(), ':', date.getSeconds(), "submited.", '\r\n*-------------------------------------*');

        (async () => {

            let arr = (req.body.data).split(/\r?\n|\r/)

            let temp = "";

            arr.forEach(element => {
                temp += element + " ";
            });

            arr = temp.split(/\.|\. /);

            temp = "";

            arr.forEach((element, index) => {
                index != arr.length - 1 ? temp += element + ".\n" : arr[index] = null;
            });

            await page_google.waitForSelector('.er8xn');

            await page_google.keyboard.type(temp);


            // // نشد
            // await page.evaluate((val) => {
            //     document.querySelector('.er8xn').innerHTML = val
            // }, temp);


            // روش قدیمی 
            /* // await page_google.waitForSelector('span[jsname="W297wb"]');

            // let newUrls = await page_google.evaluate(() => {
            //     let results = "";
            //     let items = document.querySelectorAll('span[jsname="W297wb"]');
            //     items.forEach((item) => {
            //         results += item.innerHTML + " ";
            //     });
            //     return results;
            // }); */


            await page_google.waitForSelector('div[jsname="coXp1b"]');
            // await page_google.waitForSelector('div[jsname="gLFymd"]');
            // await page_google.waitForTimeout(5000)

            let str_temp = '';
            let teranslated = await page_google.evaluate(() => {
                // let en = document.querySelectorAll('div[jsname="gLFymd"]');
                let fa = document.querySelectorAll('div[jsname="coXp1b"]');
                let arr_temp = [];
                for (let index = 0; index < fa.length; index++) {
                    arr_temp[index] = fa[index].innerText;
                }
                return arr_temp;
            });

            for (let index = 0; index < arr.length; index++) {
                arr[index] != null || undefined ?
                    str_temp +=
                    arr[index] + '\n' +
                    Number(index + 1) + "-" + teranslated[index * 2] + '\n' +
                    Number(index + 1) + "-" + teranslated[index * 2 + 1] + '\n' : null;
            }

            res.send(str_temp);

            await page_google.waitForSelector('button[jsname="X5DuWc"]');

            await page_google.click('button[jsname="X5DuWc"]');

        })();

    });

    app.post('/translate/tarjome', function (req, res) {

        const date = new Date;

        console.log("Minutes:Seconds ", date.getMinutes(), ':', date.getSeconds(), "submited.", '\r\n*-------------------------------------*');

        (async () => {



            let arr = (req.body.data).split(/\r?\n|\r/)

            let temp = "";

            arr.forEach(element => {
                temp += element + " ";
            });

            arr = temp.split(". ");

            temp = "";

            arr.forEach((element, index) => {
                index != arr.length - 1 ? temp += Number(index + 1) + '-' + element + ".\n" : temp += "";
            });

            await page_tarjome.click('.src .content');

            await page_tarjome.keyboard.type(temp);

            await page_tarjome.waitForSelector('.tgt .content > span');
            let newUrls = await page_tarjome.evaluate(() => {
                let results = "";
                let items = document.querySelector('.tgt .content');
                results = items.innerText;
                // results
                // items.forEach((item) => {
                //     results += item.innerHTML + " ";
                // });
                return results;
            });


            res.send(newUrls);

            await page_tarjome.click('.src .controls');




        })();


    });

    //     // await page.waitForNavigation({
    //     //     waitUntil: "load"
    //     // });

    //     // await upload()

    //     // // دکمه ی اپلود
    //     // await page.click(".ld4Jde .VfPpkd-LgbsSe")

    //     // const teranslatedPage = await page.evaluateHandle(() =>
    //     //     document.querySelector('pre').innerHTML
    //     // );

    // await browser.close();


}

translator();


app.listen(3000, function () {
    console.log("server is runing on http://localhost:3000");
});







































