function report(settings) {
  function getChartImage(sheetName, index) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    var charts = sheet.getCharts();

    var chartImage = charts[index].getBlob().getAs('image/png').setName("chart.png");
    return chartImage
  }
  
  function getStateMessage(timestamp, itsLink) {
    var calcSheet = new CalcSheet()
    var message = '';
    message += '■' + timestamp　+ ' 時点' + '\n';
    message += '・期日　　：残り '  + calcSheet.remainDayRatio()          + ' - ' + calcSheet.todayCount() + ' / ' + calcSheet.dayCount()                  + ' 日目' + '\n';
    message += '・ポイント：残り ' + calcSheet.todaysActualRemainRatio() + ' - ' + calcSheet.todaysCumulativeActual() + ' / ' + calcSheet.totalEstimate() + ' 完了' + '\n';
    message += 'based on ' + itsLink + '\n';
    message += 'reported by ' + SpreadsheetApp.getActive().getUrl() + '\n';
    return message;
  }


  log_info("report start");
  
  // 設定読み込み
  var botToken = settings['slack.bot_token'];
  var itsLink = settings['slack.its_link'];

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
