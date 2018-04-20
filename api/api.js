var express = require('express');
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
