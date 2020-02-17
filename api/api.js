var express = require('express');
const dayjs = require('dayjs');
var path = require('path');
var bodyParser = require('body-parser');
const http = require('http');
let fs = require('fs');
var app = express();

/**
 * returns the orders that have the corresponding type
 */
app.use('/orders/:type', (req, res) => {
    if (typeof (req.query.page) == "undefined") {
        page = -1
    } else {
        page = req.query.page;
    }
    if ((req.baseUrl).toLocaleLowerCase() == '/orders/sell') {
        importOrderBook('SELL', page).then((data) => {
            res.send(data);
        })
    } else if ((req.baseUrl).toLocaleLowerCase() == '/orders/buy') {
        importOrderBook('BUY', page).then((data) => {
            res.send(data);
        })
    } else {
        importOrderBook('ALL', page).then((data) => {
            res.send(data);
        })
    }
})

app.get('/pricing', (req, res) => {
  const { dateStart, dateEnd, basePrice, name } = req.query;

  if(!dateStart || !dateEnd || !basePrice || !name) {
    return res.status(400).send({ error: 'Missing or invalid query parameters' });
  } else if (dayjs(dateEnd).diff(dateStart, 'day') <= 0) {
    return res.status(400).send({ error: 'DateStart should be < to DateEnd' });
  }
  return res.status(200).send({ data: generatePricingTimeserie(dateStart, dateEnd, basePrice, name) })
});

app.use('/', (req, res) => {
    res.send("API WORKS")
});

const port = process.env.PORT || '3001';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => console.log(`API running on localhost:${port}`));

/**
 *
 * @param {*type of value that we want to have it takes 3 values => BUY, SELL or ALL} type
 * @param {*The page number that the client want} page
 */
var importOrderBook = (type, page) => {
    return new Promise(function (resolve, reject) {
        fs.readFile('../large-dataset.json', (err, data) => {
            if (err) throw err;
            orderBookRawData = JSON.parse(data);
            orderBookRawData = orderBookRawData.orders;
            if (type == "BUY") {
                orderBookRawData = orderBookRawData.filter(value => value.type == 'BUY');
            } else if (type == "SELL") {
                orderBookRawData = orderBookRawData.filter(value => value.type == 'SELL');
            }
            orderBookRawData = orderBookRawData.sort((value1, value2) => {
                tmp1 = new Date(value1.datetime);
                tmp2 = new Date(value2.datetime)
                if (tmp1 > tmp2) {
                    return 1;
                } else {
                    return -1
                }
            })

            numberPages = Math.ceil(orderBookRawData.length / 10);
            var orderBookResultData={}
            orderBookResultData['totalPages'] =numberPages;
            orderBookResultData['orders'] = [];
            if (page >= numberPages) {
                resolve({ Error: 'Number of pages Exceeded' })
            } else {
                var i = page == -1 ? 0 : page * 10;
                var max = page == -1 ? orderBookRawData.length : page * 10 + 10
                for (i; i < max; i++) {
                    if (orderBookRawData.length <= i) {
                        break;
                    } else {
                        orderBookResultData['orders'].push(orderBookRawData[i]);
                    }
                }
                resolve(orderBookResultData);
            }
        });
    });
}

const generatePricingTimeserie = (dateStart, dateEnd, baseValue, name) => {
  const numberOfDays = dayjs(dateEnd).diff(dateStart, 'day');
  const timeserie = [];
  const volatility = .02;
  let basePrice = +baseValue;

  for(let i = 0; i < numberOfDays; i++) {
    const rng = Math.random() - .5;
    const changePercent = 2 * volatility * rng;
    const changeAmount = basePrice * changePercent;
    const estimatedPricing = basePrice + changeAmount;
    basePrice = estimatedPricing;

    timeserie.push({
      date: dayjs(dateStart).add(i, 'day').format('YYYY-MM-DD'),
      estimatedPricing,
      maxPricing: estimatedPricing + (estimatedPricing * .3),
      name,
    })
  }

  return timeserie;
};