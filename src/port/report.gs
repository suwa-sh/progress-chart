function report(settings) {
  function getChartImage(sheetName, index) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    var charts = sheet.getCharts();

    var chartImage = charts[index].getBlob().getAs('image/png').setName("chart.png");
    return chartImage
  }
  
  function getStateMessage(timestamp, itsLink) {
    var calcValues = new CalcValues();
    var message = '';
    message += '■' + timestamp　+ ' 時点' + '\n';
    message += '・期日　　：残り ' + calcValues.remainDayRatio()          + ' - ' + calcValues.todayCount() + ' / ' + calcValues.dayCount()                  + ' 日目' + '\n';
    message += '・ポイント：残り ' + calcValues.todaysActualRemainRatio() + ' - ' + calcValues.todaysCumulativeActual() + ' / ' + calcValues.totalEstimate() + ' 完了' + '\n';
    message += 'based on ' + itsLink + '\n';
    message += 'reported by ' + SpreadsheetApp.getActive().getUrl() + '\n';
    return message;
  }


  log_info("report start");
  
  // 設定読み込み
  var chartStartDate = settings['chart.start_date'];
  var chartEndDate = settings['chart.end_date'];
  var botToken = settings['slack.bot_token'];
  var itsLink = settings['slack.its_link'];
  
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
  var message = getStateMessage(timestamp, itsLink)
  adapter.postImage(channel, title, image, message);

  title = 'Burnup Chart @' + timestamp;
  image = getChartImage(chartSheetName, burnupChartIndex);
  adapter.postImage(channel, title, image);

  log_info("report end");
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_report() {
  LOG_LEVEL = LOG_LEVEL_DEBUG;

  var settings = settings_load();
  report(settings);
}
