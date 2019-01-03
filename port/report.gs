function report(settings) {
  function getChartImage(sheetName, index) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    var charts = sheet.getCharts();

    var chartImage = charts[index].getBlob().getAs('image/png').setName("chart.png");
    return chartImage
  }
  
  function getStateMessage(timestamp) {
    var calcValues = new CalcValues();
    var message = '';
    message += '■' + timestamp　+ ' 時点' + '\n';
    message += '  - ' + 
      calcValues.todayCount() + ' / ' + calcValues.dayCount() + ' 日目' + 
      ': 残り ' + calcValues.remainDayRatio() + '\n';
    message += '  - ' + 
      calcValues.todaysCumulativeActual() + ' / ' + calcValues.totalEstimate() + ' ポイント完了' +
      ': 残り ' + calcValues.todaysActualRemainRatio() + '\n';
    return message;
  }


  log_info("report start");
  
  // 設定読み込み
  var chartStartDate = settings['chart.start_date'];
  var chartEndDate = settings['chart.end_date'];
  var botToken = settings['slack.bot_token'];
  
  // calcシートの調整
  new CalcValues().adjustRow(chartStartDate, chartEndDate);

  var adapter = new SlackAdapter(botToken);

  var channel = settings['slack.channel'];
  var chartSheetName = 'chart';
  var burndownChartIndex = 0;
  var burnupChartIndex = 1;

  var title;
  var image;
  var timestamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');

  title = 'Burndown Chart @' + timestamp;
  image = getChartImage(chartSheetName, burndownChartIndex);
  adapter.postImage(channel, title, image, getStateMessage(timestamp));

  title = 'Burnup Chart @' + timestamp;
  image = getChartImage(chartSheetName, burnupChartIndex);
  adapter.postImage(channel, title, image);

  log_info("report end");
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_report() {
  LOG_LOGLEVEL = LOG_LOGLEVEL_DEBUG;

  var settings = settings_load();
  report(settings);
}
