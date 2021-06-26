import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core'
import * as Highcharts from 'highcharts';
import more from 'highcharts/highcharts-more';
import IndicatorsCore from 'highcharts/indicators/indicators';
import HC_stock from 'highcharts/modules/stock';
import vbp from 'highcharts/indicators/volume-by-price';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { tick } from '@angular/core/testing';
// import { BootstrapAlertService, BootstrapAlert } from 'ngx-bootstrap-alert';


more(Highcharts);
HC_stock(Highcharts);
IndicatorsCore(Highcharts);
vbp(Highcharts);


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  // Highcharts: typeof Highcharts = Highcharts;
  // chartOptions = null;
  ohlc1 = [];
  isChart1Present = false;
  isHighcharts1 = typeof Highcharts === 'object';
  Highcharts1: typeof Highcharts = Highcharts;
  chartOptions1 = null;

  ohlc2 = [];
  isChart2Present = false;
  isHighcharts2 = typeof Highcharts === 'object';
  Highcharts2: typeof Highcharts = Highcharts;
  chartOptions2 = null;

  isLoaded = false;
  news = []
  companyDetails: any;
  companyFullDetails: any;
  tickSym = "";
  starred = false;
  change: any = 0;
  changePercent: any = 0;
  last: any = 0;
  prevClose: any = 0;
  tstamp1 = null;
  tstamp2 = null;
  marketOpen = false;
  midPrice = null;
  askPrice = null;
  askSize = null;
  bidPrice = null;
  bidSize = null;
  addedToWatchlist = false;
  removedFromWatchlist = false;
  quantity = 0;
  alertText = "";
  alert = false;
  selectedNews = 0;
  intradayChartData = [];
  historicalChartData =[];
  currentHour = 0;
  currentMinute = 0;
  currentTime = null;
  currentPSTDate = null;
  currentDate = null;
  volume = [];
  tickerExists = true;
  printDatehour = null;
printDateminute =  null;
printDatesec=null;
newPublishedDate = null;
currentSecond = 0;
  // noTicker = false;

  @ViewChild('closebutton') closebutton;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.tickSym = this.route.snapshot.paramMap.get('ticker');
    this.getNews();
    this.printDetails()
    var _this = this;
    setInterval(function () {
      //console.log("called")
      _this.printDetails()
    }, 15000); //15000

    let watchlist = JSON.parse(localStorage.getItem('watchlist'));
    if (watchlist != null) {
      let list = watchlist.map(a => a.ticker);
      if (list.includes(this.tickSym)) this.starred = true;
    }
    this.historicalChartDataTab();
  }

  getNews() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    this.http.get("/news?ticker=" + this.tickSym, {
      headers: headers,
    }).subscribe((data: any) => {
      this.news = data.news.articles
      // console.log("happy"+this.news[0]['publishedAt']+typeof(this.news))
      for(var i=0;i<this.news.length;i++)
      {
        var d = new Date(this.news[i].publishedAt)
        var z = d.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles'})
        this.news[i].publishedAt = z
        // console.log(d+this.news[i].publishedAt)

      }
      // console.log(this.news)
    });
  }

  convertToLATime(dailyChartDate) {
    var new_date = new Date(dailyChartDate)
    var year = new_date.getUTCFullYear();
    var month = new_date.getUTCMonth();
    var day = new_date.getUTCDate();
    var hour = new_date.getUTCHours() - 8; // Hours // - 7 for Los Angeles Time -1 because of daylight savings
    var minute = new_date.getUTCMinutes();
    var sec = new_date.getUTCSeconds();

    var LATimeInUTC = Date.UTC(year, month, day, hour, minute, sec);
    return LATimeInUTC;
  }

  convertToUTCTime(histDate)
  {
    var new_date = new Date(histDate)
    var year = new_date.getUTCFullYear();
    var month = new_date.getUTCMonth();
    var day = new_date.getUTCDate();
    var hour = new_date.getUTCHours(); // Hours // - 7 for Los Angeles Time -1 because of daylight savings
    var minute = new_date.getUTCMinutes();
    var sec = new_date.getUTCSeconds();

    var TimeInUTC = Date.UTC(year, month, day, hour, minute, sec);
    return TimeInUTC;
  }

  printDetails() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    this.http.get("/details?ticker=" + this.tickSym, {
      headers: headers,
    }).subscribe((autoData: any) => {
      //console.log("Got data from detail route!");
      this.isLoaded = true;
      //console.log(autoData);

      this.companyDetails = autoData.solutions.companyDetails
      this.companyFullDetails = autoData.solutions.companyFullDetails[0];
      // console.log("Count:" + this.companyFullDetails.length)
      if(!("companyDetails" in autoData.solutions))
      {
        this.tickerExists = true;
      }
      else{
        this.tickerExists = false;
      }
      // console.log(typeof (this.companyFullDetails.last));
      this.last = Number(this.companyFullDetails.last);
      this.prevClose = Number(this.companyFullDetails.prevClose);
      this.change = this.last - this.prevClose;
      this.changePercent = (this.change * 100) / this.prevClose;
      this.tstamp1 = this.companyFullDetails.timestamp.split('T');
      // console.log(this.tstamp1);
      // console.log(this.tstamp1[0]); //2020-11-03
      this.tstamp2 = this.tstamp1[1].substr(0, 8)

      //console.log("Hello: "+this.tstamp2); //12:30:23
      // this.tstamp2 = "15:59:59"
      this.currentTime = this.tstamp2.split(":")
      this.currentHour = Number(this.currentTime[0]) - 8;
      // this.currentMinute = Number(this.currentTime[1]);
      // this.currentSecond = Number(this.currentTime[2]);
      // console.log(this.currentHour + typeof (this.currentHour));
      // console.log(this.currentMinute + typeof (this.currentMinute));
      if (this.companyFullDetails.mid != null) {
        this.midPrice = this.companyFullDetails.mid;
      }
      else {
        this.midPrice = '-'
      }
      if (this.companyFullDetails.askPrice != null) {
        this.askPrice = this.companyFullDetails.askPrice;
      }
      else {
        this.askPrice = '-'
      }
      if (this.companyFullDetails.askSize != null) {
        this.askSize = this.companyFullDetails.askSize;
      }
      else {
        this.askSize = '-'
      }
      if (this.companyFullDetails.bidPrice != null) {
        this.bidPrice = this.companyFullDetails.bidPrice;
      }
      else {
        this.bidPrice = '-'
      }
      if (this.companyFullDetails.bidSize != null) {
        this.bidSize = this.companyFullDetails.bidSize;
      }
      else {
        this.bidSize = '-'
      }
      var today = new Date().toLocaleString("en-US", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", hour12: false, minute: '2-digit', second: '2-digit', timeZone: "America/Los_Angeles" });
      //console.log(today);
      //console.log(this.companyFullDetails.timestamp)
      var dateTime = today.split(', ')
      var todayDate = dateTime[0].split('/')
      var todayTime = dateTime[1].split(':')

      var y = Number(todayDate[2])
      var m = Number(todayDate[0])
      var d = Number(todayDate[1])
      var h = Number(todayTime[0])
      var mins = Number(todayTime[1])
      var sec = Number(todayTime[2].substr(0,2))
      //console.log(y,m,d,h,mins,sec)
      var UTCdate = Date.UTC(y,m-1,d,h,mins,sec)

      var timestampTime = this.convertToLATime(this.companyFullDetails.timestamp)

      var diff = UTCdate - timestampTime
      //console.log("Timestamp ms: " + timestampTime)
      //console.log("UTC time ms: " + UTCdate)
      //console.log("Difference:" + diff)

      if(diff <=60000)

      {
        this.marketOpen = true;
      }
      else{
        this.marketOpen = false;
      }
      this.intradayChartSummaryTab()

    });
  }

  buy(quantity) {
    console.log("clicked")
    let myData;
    if (localStorage.getItem('portfolio')) {
      //console.log(localStorage.getItem('portfolio'))
      myData = JSON.parse(localStorage.getItem('portfolio'));
    }
    if (myData == null) {
      myData = [{
        ticker: this.tickSym,
        name: this.companyDetails.name,
        quantity: quantity,
        totalCost: this.companyFullDetails.last * quantity,
        averageCost: this.companyFullDetails.last * quantity
      }]
    } else {
      let found = false;
      for (let data in myData) {
        if (myData[data].ticker == this.tickSym) {
          found = true;
          //console.log("11111")
          //console.log(myData[data])
          myData[data].quantity += quantity;
          myData[data].averageCost = (this.companyFullDetails.last * quantity + myData[data].totalCost) / (quantity + myData[data].quantity);
          myData[data].totalCost = this.companyFullDetails.last * quantity + myData[data].totalCost
          //console.log("22222")
          //console.log(myData[data])
        }
      }
      if (!found) {
        let order = {
          ticker: this.tickSym,
          quantity: quantity,
          name: this.companyDetails.name,
          totalCost: this.companyFullDetails.last * quantity,
          averageCost: this.companyFullDetails.last * quantity
        }
        myData.push(order);
      }
    }
    //console.log(myData)
    localStorage.setItem('portfolio', JSON.stringify(myData));
    this.closebutton.nativeElement.click();
    this.alertText = this.tickSym + " bought succesfully"
    
    this.alert = true;
    var _this = this;
    setTimeout(function () {
      _this.alert = false
    }, 5000);

  }

  star() {
    let watchlist = JSON.parse(localStorage.getItem('watchlist'));
    let obj = { ticker: this.tickSym, name: this.companyDetails.name };
    if (this.starred) {
      //This is when the item is already starred. 
      let watchListL = [];
      for (let a of watchlist) {
        if (a.ticker != obj.ticker) {
          watchListL.push(a)
        }
      }
      watchlist = watchListL;
      this.starred = false
    } else {
      if (watchlist) {
        watchlist.push(obj)
      } else {
        watchlist = [obj]
      }
      this.starred = true
    }
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    if (this.starred == true) {
      this.addedToWatchlist = true;
      this.removedFromWatchlist = false;
   
      setTimeout(function () {
        $('#shouldClose').remove();
      }, 5000);
    }
    else {
      this.removedFromWatchlist = true;
      this.addedToWatchlist = false;
      setTimeout(function () {
        $('#thisShouldClose').remove();
      }, 5000);
    }


  }

  intradayChartSummaryTab() {
    //console.log(this.tstamp1[0]);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    this.http.get("/details/intradayChartData?ticker=" + this.tickSym + "&date=" + this.tstamp1[0], {
      headers: headers,
    }).subscribe((autoData: any) => {
      this.intradayChartData = autoData.intradayChartData;
      //console.log(this.intradayChartData);
      //console.log(this.intradayChartData.length);

      this.ohlc1 = []
      for (var x = 0; x < this.intradayChartData.length; x++) {
        //console.log("Try 1");
        var currDate = this.intradayChartData[x]['date'];

        var new_currDate = new Date(currDate).toLocaleString("en-US", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", hour12: false, minute: '2-digit', second: '2-digit', timeZone: "America/Los_Angeles" });
        var e = this.convertToLATime(currDate);
        //var utcValue = Date.parse(currDate)/1000;
        this.ohlc1.push([e, this.intradayChartData[x]['close']]);
        //console.log(Date.parse(new_currDate) / 1000 + " " + currDate + " " + new_currDate + " " + this.intradayChartData[x]['close'])
        //console.log("length" + this.ohlc1.length);

      }
      var chartColor = "Black";
      if(this.change>0)
      {
        chartColor = "Green";
      }
      else if(this.change<0)
      {
        chartColor = "Red";
      }
      this.isChart1Present = true;
      this.chartOptions1 = {
        title: {
          text: this.tickSym
        },
        colors: [chartColor],
        // tooltip: {
        //   enabled: 'true',
        //   headerFormat: '',
        //   positioner: function (labelWidth, labelHeight, point) {
        //     var tooltipX = point.plotX - labelWidth;
        //     var tooltipY = point.plotY + labelHeight;
        //     return {
        //       x: tooltipX,
        //       y: tooltipY
        //     };
        //   }
        // },
        yAxis: [{
          lineWidth: 0,
          height: '100%',
          width: '100%',
          opposite: true,
          label:{
            align: 'right'
          },
          title: {
            text: ''
          },
        }],
        xAxis: [{
          type: "datetime",
          tickInterval: 3600 * 1000,
          // crosshair: {
          //   label: {
          //     enabled: true,
          //     backgroundColor: '#f8f8f8',
          //     borderColor: 'Black',
          //     borderWidth: 1,
          //     format: '{value:%A, %b %d, %H:%M}',
          //     style: {
          //       color: 'Black'
          //     }
          //   }
          // },
        }],
        navigator: {
          enabled: true
        },
        scrollbar: {
          enabled: true,
      },
        rangeSelector: {
          buttons: [],
          selected: 4,
          inputEnabled: false,
          labelStyle: { display: 'none' }
        },
        time:
        {
          setUTC: true,
        },
        series: [
          {
            marker: {
              enabled: false
            },

            name: this.tickSym,
            type: 'line',
            data: this.ohlc1, //ohlc
            gapSize: 4,
            showInNavigator: true,
            tooltip: {
              valueDecimals: 2
            },

            fillColor: {
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
              },
              stops: [
                [0, chartColor],
                [1, chartColor]
              ]
            },
            threshold: null
          }]
      };
    });
    //     let dt = new Date();

    // let kolkata = dt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    // let la = dt.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    this.currentPSTDate = new Date().toLocaleString("en-CA", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", hour12: false, minute: '2-digit', second: '2-digit', timeZone: "America/Los_Angeles" });
    this.currentDate = this.currentPSTDate.split(', ');
    var curr = this.currentDate[1].split(":")
    this.printDatehour = curr[0];
    this.printDateminute = curr[1];
    this.printDatesec = curr[2]; 
    var hr = Number(curr[0])
    //console.log("24");
    if(hr==24)
    {
      this.printDatehour = '00'
      //console.log(this.currentDate[1][0] + this.currentDate[1][1]+"12341234")
    }
  }

  historicalChartDataTab()
  {
    //console.log("historical Data");
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    this.http.get("/details/historicalChart?ticker=" + this.tickSym,{
      headers: headers,
    }).subscribe((autoData: any) => {
      this.historicalChartData = autoData.historicalChartData;
      //console.log(this.historicalChartData[0]['date'])
      this.ohlc2 = [];
      this.volume = [];
      for ( var x = 0; x < this.historicalChartData.length; x++) {
        var historicalDate = this.historicalChartData[x]['date'];
        var updatedDate = this.convertToUTCTime(historicalDate);
        this.ohlc2.push([updatedDate,this.historicalChartData[x]['open'],this.historicalChartData[x]['high'],this.historicalChartData[x]['low'],this.historicalChartData[x]['close']]);
        this.volume.push([updatedDate,this.historicalChartData[x]['volume']]);
        //console.log(this.ohlc2);
        //console.log(this.volume[x]);
      }
      // var groupingUnits = [
      //   [
      //     'week', // unit name
      //     [1] // allowed multiples
      //   ],
      //   [
      //     'month',
      //     [1, 2, 3, 4, 6]
      //   ]
      // ]
      this.isChart2Present = true;
      this.chartOptions2 = {
        rangeSelector: {
          selected: 2
        },
    
        title: {
          text: this.tickSym + ' Historical'
        },
    
        subtitle: {
          text: 'With SMA and Volume by Price technical indicators'
        },
    
        yAxis: [{
          startOnTick: false,
          endOnTick: false,
          labels: {
            align: 'right',
            x: -3
          },
          title: {
            text: 'OHLC'
          },
          height: '60%',
          lineWidth: 2,
          resize: {
            enabled: true
          }
        }, {
          labels: {
            align: 'right',
            x: -3
          },
          title: {
            text: 'Volume'
          },
          top: '65%',
          height: '35%',
          offset: 0,
          lineWidth: 2
        }],
    
        tooltip: {
          split: true
        },
    
        // plotOptions: {
        //   series: {
        //     dataGrouping: {
        //       units: groupingUnits
        //     }
        //   }
        // },
    
        series: [{
          type: 'candlestick',
          name: this.tickSym,
          id: 'aapl',
          zIndex: 2,
          data: this.ohlc2
        }, {
          type: 'column',
          name: 'Volume',
          id: 'volume',
          data: this.volume,
          yAxis: 1
        }, {
          type: 'vbp',
          linkedTo: 'aapl',
          params: {
            volumeSeriesID: 'volume'
          },
          dataLabels: {
            enabled: false
          },
          zoneLines: {
            enabled: false
          }
        }, {
          type: 'sma',
          linkedTo: 'aapl',
          zIndex: 1,
          marker: {
            enabled: false
          }
        }]
      };
    });
  }

}