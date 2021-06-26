const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const { SSL_OP_CRYPTOPRO_TLSEXT_BUG } = require('constants');


const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
//app.use(cors());
const corsOptions = {
    "origin": "*"
}
app.use(cors(corsOptions));


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
});

app.get('/autoComplete', async(req, res) => {
    var currentTicker = req.query.term;
    console.log("***************************************** autoComplete *****************************************");
    console.log(currentTicker);
    var autoRes = null;
    const currentQueryAutoComplete = {
        'url': 'https://api.tiingo.com/tiingo/utilities/search?query=' + currentTicker + '&token=3d6578d469953fd83f5bafde58fb894914be98e8',
        'headers': {
            'Content-Type': 'application/json'
        }
    }; //0d4d0b16d5d78a6e4e7a93f93aa219b215827d30 73645ccad48e1f73a1702ab7f8c322b980aabb8a 3d6578d469953fd83f5bafde58fb894914be98e8
    request(currentQueryAutoComplete, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log("Before Json Parse: " + body);
            autoRes = JSON.parse(body);
            var count = Object.keys(autoRes).length;
            console.log("Count: " + count);
            res.json(autoRes);
        } else {
            console.log("Error: " + error + "Status code" + response.statusCode);
        }
    });

});

app.get('/details', async function(req, res) {
    console.log(req.query.ticker)
    var currentTicker = req.query.ticker
    var solutions = {}

    await axios.get('https://api.tiingo.com/tiingo/daily/' + currentTicker + '?token=3d6578d469953fd83f5bafde58fb894914be98e8')
        .then(function(response) {
            // handle success
            solutions['companyDetails'] = response.data;
        })
        .catch(function(error) {
            // handle error
            console.log(error);
        })
        .then(function() {
            // always executed
        });

    await axios.get('https://api.tiingo.com/iex/?tickers=' + currentTicker + '&token=3d6578d469953fd83f5bafde58fb894914be98e8')
        .then(function(response) {
            // handle success
            solutions['companyFullDetails'] = response.data;
        })
        .catch(function(error) {
            // handle error
            console.log(error);
        })
        .then(function() {
            // always executed
        });

    res.json({ solutions });

});

app.get('/details/intradayChartData', async function(req, res) {
    console.log("XYZ")
    var startDate = req.query.date;
    var currentTicker = req.query.ticker
    var intradayChartData = {}
    await axios.get('https://api.tiingo.com/iex/' + currentTicker + '/prices?startDate=' + startDate + '&resampleFreq=4min&columns=open,high,low,close,volume&token=3d6578d469953fd83f5bafde58fb894914be98e8')
        .then(function(response) {
            // handle success
            intradayChartData['intradayChartData'] = response.data;
        })
        .catch(function(error) {
            // handle error
            console.log(error);
        })
        .then(function() {
            // always executed
        });
    res.send(intradayChartData);

})

app.get('/details/historicalChart', async function(req, res) {
    console.log("XYZ")
    var d = new Date();
    var pastYear = d.getFullYear() - 2;
    d.setFullYear(pastYear);
    console.log(d);
    var st = d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate()
        //var xxx = d.toString();
    console.log(st)
        //var startDate = d.split('T')
        //console.log(startDate[0] + startDate[1]);
        //var startDate = req.query.date;
    var currentTicker = req.query.ticker
    var historicalChartData = {}
    await axios.get('https://api.tiingo.com/tiingo/daily/' + currentTicker + '/prices?startDate=' + st + '&token=3d6578d469953fd83f5bafde58fb894914be98e8')
        .then(function(response) {
            // handle success
            historicalChartData['historicalChartData'] = response.data;
        })
        .catch(function(error) {
            // handle error
            // console.log(error);
        })
        .then(function() {
            // always executed
        });
    res.send(historicalChartData);

})

app.get('/news', function(req, res) {
        var currentTicker = req.query.ticker
        axios.get('https://newsapi.org/v2/everything?q=' + currentTicker + '&apiKey=be1ee6aa98db4ba4b247203afee80c8b')
            .then(function(response) {
                // handle success
                res.send({ news: response.data })
            })
            .catch(function(error) {
                // handle error
                console.log(error);
            })
            .then(function() {
                // always executed
            });
    }) //be1ee6aa98db4ba4b247203afee80c8b 5563cb8a86b64754b8a0c8339c66aee1 c6d1127b09d14ffb897bf3e0210c9fec


app.use(express.static('public'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(process.cwd() + "/public/Stock-Search/"));
app.get('*', (req, res) => {
    res.sendFile(process.cwd() + "/public/Stock-Search/")
});

app.listen(PORT, function() {
    console.log("Server: " + PORT)
});