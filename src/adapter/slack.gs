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
  log_trace('SlackAdapter.postMessage start');
  
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

  log_trace("request url:" + url); 
  UrlFetchApp.fetch(url, params);
  log_trace('SlackAdapter.postMessage end');
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
  log_trace('SlackAdapter.postImage start');
  
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
  
  log_trace("request url:" + url); 
  UrlFetchApp.fetch(url, params);
  log_trace('SlackAdapter.postImage end');
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_SlackAdapter() {
  LOG_LEVEL = LOG_LEVEL_TRACE;

  var botToken = UserProperties.getProperty('SlackBotToken_Private');

  try {
    new SlackAdapter();
    throw new Error('fail');
  } catch(e) { log_debug('error message:' + e); }
  
  var adapter = new SlackAdapter(botToken);

  var channel = '#random';
  adapter.postMessage(channel, 'test slack_postMessage \npattern: english');
  adapter.postMessage(channel, 'test slack_postMessage \npattern: 日本語');
  

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('__test_slack_postImage__');
  var title = 'test slack_postImage \npattern: chart'
  var charts = sheet.getCharts();
  var chartImage = charts[0].getBlob().getAs('image/png').setName("chart.png");
  adapter.postImage(channel, title, chartImage);
  adapter.postImage(channel, title, chartImage, 'test slack_postImage \npattern: chart + メッセージ');
}
