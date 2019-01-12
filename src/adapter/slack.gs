var SlackAdapter = function(botToken) {
  notEmpty('SlackAdapter.botToken', botToken);
  
  this.botToken = botToken;
}


/*
 * Slack bot apiを利用してメッセージを投稿します。
 *
 * @param channel チャンネル
 * @param message メッセージ
 */
SlackAdapter.prototype.postMessage = function(channel, message){
  var url = 'https://slack.com/api/chat.postMessage';

  const payload = {
    "token" : this.botToken,
    "channel" : channel,
    "text" : message
  };
  const params = {
    "method" : "post",
    'contentType': 'application/x-www-form-urlencoded',
    "payload" : payload
  };

  var response = UrlFetchApp.fetch(url, params);
  // TODO response check
  log_trace(JSON.stringify(response));
}


/*
 * Slack bot apiを利用して画像をアップロードします。
 *
 * @param channel チャンネル
 * @param title イメージタイトル
 * @param image イメージ
 * @param message メッセージ
 */
SlackAdapter.prototype.postImage = function(channel, title, image, message) {
  var url = 'https://slack.com/api/files.upload';
  
  var payload = {
    'token': this.botToken,
    'channels': channel,
    'initial_comment': message,
    'filename': title,
    'file': image
  };
  
  var params = {
    'method': 'post',
    'payload': payload
  };
  
  var response = UrlFetchApp.fetch(url, params);
  // TODO response check
  log_trace(JSON.stringify(response));
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_SlackAdapter() {
  LOG_LOGLEVEL = LOG_LOGLEVEL_TRACE;

  var settings = settings_load();
  var botToken = settings['slack.bot_token'];
  var adapter = new SlackAdapter(botToken);

  var channel = '#random';
  var message;
  message = 'test slack_postMessage \npattern: english'
  adapter.postMessage(channel, message);

  message = 'test slack_postMessage \npattern: 日本語'
  adapter.postMessage(channel, message);
  

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('__test_slack_postImage__');
  var title = 'test slack_postImage \npattern: chart'
  var charts = sheet.getCharts();
  var chartImage = charts[0].getBlob().getAs('image/png').setName("chart.png");
  adapter.postImage(channel, title, chartImage);

  message = 'test slack_postImage \npattern: chart + メッセージ'
  adapter.postImage(channel, title, chartImage, message);
}
