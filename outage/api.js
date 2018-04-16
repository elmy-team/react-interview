var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const http = require('http');
let fs = require('fs');
var app = express();


/**
 * returns the orders that have a type set to SELL to the client
 */
app.use('/orders/sell', (req, res) => {
    if (typeof (req.query.page) == "undefined") {
        console.log(req.query.page)
        page = 0
    } else {
        page = req.query.page;

    }
    importOutage('SELL', page).then((data) => {

        res.send(data);
    })

});

/**
 * returns the orders that have a type set to Buy to the client
 */
app.use('/orders/buy', (req, res) => {
    if (typeof (req.query.page) == "undefined") {
        console.log(req.query.page)
        page = 0
    } else {
        page = req.query.page;

    }
    importOutage('BUY', page).then((data) => {
        res.send(data);
    })
});

/**
 * return all the data, regardless of the type to the client
 */
app.use('/orders/all', (req, res) => {
    if (typeof (req.query.page) == "undefined") {
        console.log(req.query.page)
        page = 0
    } else {
        page = req.query.page;

    }
    importOutage('ALL', page).then((data) => {

        res.send(data);
    })
});

app.use('/', (req, res) => {
    importOutage().then((outageData) => {
        res.send(outageData);
    })
});



app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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
var importOutage = (type, page) => {
    return new Promise(function (resolve, reject) {
        fs.readFile('../large-dataset.json', (err, data) => {
            if (err) throw err;
            outageRawData = JSON.parse(data);
            outageRawData = outageRawData.orders;
            if (type == "BUY") {
                outageRawData = outageRawData.filter(value => value.type == 'BUY');
            } else if (type == "SELL") {
                outageRawData = outageRawData.filter(value => value.type == 'SELL');
            }
            outageRawData = outageRawData.sort((value1, value2) => {
                tmp1 = new Date(value1.datetime);
                tmp2 = new Date(value2.datetime)
                if (tmp1 > tmp2) {
                    return 1;
                } else {
                    return -1
                }
            })
            numberPages = outageRawData.length / 10;
            //console.log(numberPages)
            //console.log(Math.ceil(numberPages))

            numberPages = Math.ceil(outageRawData.length / 10);
            var outageResultData = [];
            if (page >= numberPages) {
                resolve({ Error: 'Number of pages Exceeded' })
            } else {

                var i = page * 10;
                var max = page * 10 + 10
                for (i; i < max; i++) {
                    // console.log(i)
                    if (outageRawData.length <= i) {
                        break;
                    } else {
                        //console.log(outageRawData[i])
                        outageResultData.push(outageRawData[i]);
                    }
                }
                resolve(outageResultData);
            }
        });
    });
}
