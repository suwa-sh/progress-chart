/*
 * calcシート
 */
var CalcSheet = function() {
  this.HEADER_ROW_COUNT = 2;

  this.sheetname = 'calc'
  this.sheet = SpreadsheetApp.getActive().getSheetByName(this.sheetname);
  this.values;
  this.length;
  this.refresh();
}

/*
 * キャッシュ更新
 */
CalcSheet.prototype.refresh = function() {
  // キャッシュを更新
  var values = this.sheet.getDataRange().getValues();
  this.values = values;
  this.length = values.length;
}


CalcSheet.prototype._dateFormat = function(dateString) {
  return Utilities.formatDate(new Date(dateString), 'Asia/Tokyo', 'yyyy-MM-dd');
}
CalcSheet.prototype.getDate = function(row) {
  var dateString = this.values[row][0];
  return this._dateFormat(dateString);
}
CalcSheet.prototype.getScheduledRemain = function(row) {
  return this.values[row][4];
}
CalcSheet.prototype.getActualRemain = function(row) {
  return this.values[row][6];
}
CalcSheet.prototype.getCumulativeActual = function(row) {
  return this.values[row][9];
}



CalcSheet.prototype.getTodayRow = function() {
  var today = this.today();
  var row = 0;
  for (var index = 0; index < this.length; index++) {
    if (log_isTraceEnabled()) log_trace('-- index:' + index + ', date:' + this.getDate(index) + ', today:' + today);
    if (this.getDate(index) === today) {
      row = index;
      break;
    }
  }
  return row;
}

CalcSheet.prototype.today = function() {
  return Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
}

CalcSheet.prototype.dayCount = function() {
  return this.values.length - this.HEADER_ROW_COUNT;
}

CalcSheet.prototype.elapsedDayCount = function() {
  // 当日の行番号 - ヘッダー行数 -> 経過日数
  //   01/01 〜 01/31 の 01/03 -> 2日経過
  return this.getTodayRow() - this.HEADER_ROW_COUNT;
}

CalcSheet.prototype.todayCount = function() {
  // 経過日数 + 1 -> 当日の日数
  //   01/01 〜 01/31 の 01/03 -> 3日目
  return this.elapsedDayCount() + 1;
}

CalcSheet.prototype.remainDayCount = function() {
  // 期間日数 - 経過日数 -> 残日数
  //   01/01 〜 01/31 の 01/03 -> 残り29日
  return this.dayCount() - this.elapsedDayCount();
}

CalcSheet.prototype.totalEstimate = function() {
  // 1日目の残り = 予定のポイント合計
  //   行番号でアクセスするので、ヘッダー行数 = 1日目のデータ行番号
  return this.getScheduledRemain(this.HEADER_ROW_COUNT);
}

CalcSheet.prototype.todaysCumulativeActual = function() {
  // 当日の実績累計
  return this.getCumulativeActual(this.getTodayRow());
}

CalcSheet.prototype.todaysActualRemain = function() {
  // 当日の残り
  return this.getActualRemain(this.getTodayRow());
}


CalcSheet.prototype._ratio = function(target, total) {
  return Math.round(target / total * 100) + '%';
}
CalcSheet.prototype.elapsedDayRatio = function() {
  // 経過日数 %
  return this._ratio(this.elapsedDayCount(), this.dayCount());
}
CalcSheet.prototype.remainDayRatio = function() {
  // 残日数 %
  return this._ratio(this.remainDayCount(), this.dayCount());
}
CalcSheet.prototype.todaysCumulativeActualRatio = function() {
  // 当日の実績累計 %
  return this._ratio(this.todaysCumulativeActual(), this.totalEstimate());
}
CalcSheet.prototype.todaysActualRemainRatio = function() {
  // 当日の残り %
  return this._ratio(this.todaysActualRemain(), this.totalEstimate());
}


CalcSheet.prototype.adjustRow = function(startDateString, endDateString) {
  var startDate = new Date(startDateString);
  var endDate = new Date(endDateString);
  var diffMSec = endDate - startDate;
  // 01/31 - 01/30 -> 30days
  var dateDiff = Math.ceil(diffMSec / 24 / 60 / 60 / 1000);
  
  var asisDateDiff = this.dayCount() - 1;
  log_trace('dateDiff:' + dateDiff + ', asisDateDiff:' + asisDateDiff);
  if (asisDateDiff == dateDiff) { return; }
  if (asisDateDiff < dateDiff)  { this._addRow(dateDiff - asisDateDiff); return; }
  this._deleteRow(asisDateDiff - dateDiff);
}
CalcSheet.prototype._addRow = function(numRows) {
  log_debug('_addRow numRows:' + numRows);
  // 最終行からcount分、行追加
  var lastRow = this.sheet.getLastRow();
  this.sheet.insertRowsAfter(lastRow, numRows);

  // dataRangeの最終行を、最終行までコピー
  var beforeSheet = SpreadsheetApp.getActiveSheet();
  var lastRowRange = this.sheet.getRange(lastRow + ':' + lastRow)
  lastRowRange.activate();
  var currentCell = this.sheet.getCurrentCell();
  this.sheet.getSelection().getNextDataRange(SpreadsheetApp.Direction.DOWN).activate();
  currentCell.activateAsCurrentCell();
  lastRowRange.copyTo(this.sheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  beforeSheet.activate();
}
CalcSheet.prototype._deleteRow = function(numRows) {
  log_debug('_deleteRow numRows:' + numRows);
  // 最終行からcount分、行削除
  var deleteStartRow = this.sheet.getLastRow() - numRows + 1;
  this.sheet.deleteRows(deleteStartRow, numRows);
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_CalcSheet() {
  LOG_LEVEL = LOG_LEVEL_TRACE;

  var calcSheet = new CalcSheet();
  log_debug('シートのデータ長は？: ' + calcSheet.length);
  log_debug('期間(日数): ' + calcSheet.dayCount());
  log_debug('今日は何日？: ' + calcSheet.today());
  log_debug('今日は何日目？: ' + calcSheet.todayCount());
  log_debug('経過日数: ' + calcSheet.elapsedDayCount());
  log_debug('経過日数 ratio: ' + calcSheet.elapsedDayRatio());
  log_debug('残り日数: ' + calcSheet.remainDayCount());
  log_debug('残り日数 ratio: ' + calcSheet.remainDayRatio());
  log_debug('予定ポイント合計: ' + calcSheet.totalEstimate());
  log_debug('実績ポイント累計: ' + calcSheet.todaysCumulativeActual());
  log_debug('実績ポイント累計 ratio: ' + calcSheet.todaysCumulativeActualRatio());
  log_debug('残りポイント: ' + calcSheet.todaysActualRemain());
  log_debug('残りポイント ratio: ' + calcSheet.todaysActualRemainRatio());
  
  var settings = settings_load();
  var startDateString = settings['chart.start_date'];
  var endDateString = settings['chart.end_date'];
  calcSheet.adjustRow(startDateString, endDateString);
}