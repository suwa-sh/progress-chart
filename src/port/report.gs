var ReportPort = function(botToken) {
  notEmpty('ReportPort.botToken', botToken);
  
  this.adapter = new SlackAdapter(botToken);
  
  this.chartSheet = new ChartSheet();
}


var ReportCommand = function(channel, itsLink) {
  notEmpty('ReportCommand.channel', channel);
  notEmpty('ReportCommand.itsLink', itsLink);

  this.channel = channel;
  this.itsLink = itsLink;
  this.timestamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
}

ReportPort.prototype.report = function(command) {
  log_info("ReportPort#report start");
  notNull('command', command);
  
  var message = this._getStateMessage(command.timestamp, command.itsLink)

  var title = 'Burndown Chart @' + command.timestamp;
  var image = this.chartSheet.getBurnDownImage();
  this.adapter.postImage(command.channel, title, image, message);

  title = 'Burnup Chart @' + command.timestamp;
  image = this.chartSheet.getBurnUpImage();
  this.adapter.postImage(command.channel, title, image);
  
  log_info("ReportPort#report start");
}

ReportPort.prototype._getStateMessage = function(timestamp, itsLink) {
  var calcSheet = new CalcSheet()
  var message = '';
  message += '■' + timestamp　+ ' 時点' + '\n';
  message += '・期日　　：残り '  + calcSheet.remainDayRatio()          + ' - ' + calcSheet.todayCount() + ' / ' + calcSheet.dayCount()                  + ' 日目' + '\n';
  message += '・ポイント：残り ' + calcSheet.todaysActualRemainRatio() + ' - ' + calcSheet.todaysCumulativeActual() + ' / ' + calcSheet.totalEstimate() + ' 完了' + '\n';
  message += this._getLinkMessage(itsLink);
  return message;
}

ReportPort.prototype._getLinkMessage = function(itsLink) {
  var message = '';
  message += 'based on ' + itsLink + '\n';
  message += 'reported by ' + SpreadsheetApp.getActive().getUrl() + '\n';
  return message;
}


var ErrorReportCommand = function(channel, itsLink, error) {
  notEmpty('ErrorReportCommand.channel', channel);
  notEmpty('ErrorReportCommand.itsLink', itsLink);
  notNull('ErrorReportCommand.itsLink', error);

  this.channel = channel;
  this.itsLink = itsLink;
  this.error = error;
  this.timestamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
}

ReportPort.prototype.errorReport = function(command) {
  log_info("ReportPort#errorReport start");
  notNull('command', command);

  var message = this._getErrorMessage(command.timestamp, command.error, command.itsLink);
  
  this.adapter.postMessage(command.channel, message);
  log_info("ReportPort#errorReport end");
}

ReportPort.prototype._getErrorMessage = function(timestamp, error, itsLink) {
  var message = timestamp + ' ERROR ' + error.message + '\n';
  if (! isNull(error.stack)) { message += error.stack + '\n'; }
  message += this._getLinkMessage(itsLink);
  return message;
}


//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_report() {
  LOG_LEVEL = LOG_LEVEL_DEBUG;

  try {
    new ReportPort();
  } catch (e) { log_debug('error message:' + e); }

  try {
    new ReportCommand();
  } catch (e) { log_debug('error message:' + e); }
  try {
    new ReportCommand('string');
  } catch (e) { log_debug('error message:' + e); }
  
  var port = new ReportPort(UserProperties.getProperty('SlackBotToken_Private'));
  var command = new ReportCommand('#random', 'https://google.co.jp');
  port.report(command);
  
  var errCommand = new ErrorReportCommand('#random', 'https://google.co.jp', new Error('エラーメッセージ'));
  port.errorReport(errCommand);
}
