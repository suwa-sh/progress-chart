var DistributePort = function(ignoreCategoriesDef, excludeTitlePrefixesDef) {
  this.ignoreCategories;
  this.excludeTitlePrefixes;
  
  if (! isNull(ignoreCategoriesDef)) { this.ignoreCategories = ignoreCategoriesDef.replace(/ /g, '').split(','); }
  if (! isNull(excludeTitlePrefixesDef)) { this.excludeTitlePrefixes = excludeTitlePrefixesDef.replace(/ /g, '').split(','); }

  this.srcSheet     = new ListSheet('[list] src');
  this.backlogSheet = new ListSheet('[list] backlog');
  this.iceboxSheet  = new ListSheet('[list] icebox');
  this.excludeSheet = new ListSheet('[list] excludes');
}


var DistributeCommand = function(startDate, endDate) {
  notEmpty('DistributeCommand.startDate', startDate);
  notEmpty('DistributeCommand.endDate', endDate);
  
  this.startDate = startDate;
  this.endDate = endDate;
}


/* 
 * srcシート -> 各リストシート への振り分け
 */
DistributePort.prototype.distribute = function(command) {
  log_info("DistributePort#distribute start");
  notNull('command', command);

  // カウント
  var excludeCount = 0
  var inputCount = 0

  for (var index = 0; index < this.srcSheet.length; index++) {
    
    // ヘッダー行をスキップ
    if (index < this.srcSheet.HEADER_ROW_COUNT) continue;

    var srcIssue = this.srcSheet.parse(index);

    // 対象期間から外れるものをスキップ
    if (isBeforeDate(command.startDate, srcIssue.closed_at)) { log_debug("-- SKIP   beforeStart id:" + srcIssue.id); continue; }
    if (isAfterDate(command.endDate, srcIssue.created_at))   { log_debug("-- SKIP   afterEnd    id:" + srcIssue.id); continue; }

    // 更新
    if (this.backlogSheet.updateWhenMatches(srcIssue, this.ignoreCategories)) { log_debug("-- UPDATE backlog id:" + srcIssue.id); continue; }
    if (this.iceboxSheet.updateWhenMatches(srcIssue, this.ignoreCategories))  { log_debug("-- UPDATE icebox  id:" + srcIssue.id); continue; }
    if (this.excludeSheet.updateWhenMatches(srcIssue, this.ignoreCategories)) { log_debug("-- UPDATE exclude id:" + srcIssue.id); continue; }

    // 無視リストに追加
    if (this._isInsertExcludeSheet(srcIssue)) {
      excludeCount++;
      this.excludeSheet.insert(this.excludeSheet.length + excludeCount, srcIssue);
      log_debug("-- INSERT exclude id:" + srcIssue.id);
      continue;
    }

    // 入力リストに追加
    inputCount++;
    this.backlogSheet.insert(this.backlogSheet.length + inputCount, srcIssue);
    log_debug("-- INSERT backlog id:" + srcIssue.id);
  }
  
  this._checkResult();
  log_info("DistributePort#distribute end");
}


// srcの値からexcludeシートへの追加を判定
DistributePort.prototype._isInsertExcludeSheet = function(issue) {
  if (isEmpty(this.excludeTitlePrefixes)) return false;
  if (isEmpty(issue.title)) return false;
  
  for (var index = 0; index < this.excludeTitlePrefixes.length; index++){
    var excludePrefix = this.excludeTitlePrefixes[index];
    if (forwardMatch(issue.title, excludePrefix)) return true;
  }
  return false;
}


// 結果チェック
DistributePort.prototype._checkResult = function() {
  // backlogシート
  this.backlogSheet.refresh();
  for (var index = 0; index < this.backlogSheet.length; index++) {
    if (this.backlogSheet.getPoint(index) !== "") { continue; }
    var row = index + 1;
    throw new Error(this.backlogSheet.sheetname + " シート " + row + "行目に ポイント が設定されていません。 確認してください。");
  }
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_distribute() {
  LOG_LEVEL = LOG_LEVEL_DEBUG;

  var port = new DistributePort();
  log_debug('port:' + JSON.stringify(port));
  
  port = new DistributePort('', '');
  log_debug('port:' + JSON.stringify(port));
  
  port = new DistributePort('CAT_DEF1', 'TITLE_DEF1');
  log_debug('port:' + JSON.stringify(port));
  
  port = new DistributePort('CAT_DEF1, CAT_DEF3, CAT_DEF3', 'TITLE_DEF1, TITLE_DEF3, TITLE_DEF3');
  log_debug('port:' + JSON.stringify(port));
  
  
  try {
    new DistributeCommand();
  } catch (e) { log_debug('error message:' + e); }
  
  try {
    new DistributeCommand('string', '');
  } catch (e) { log_debug('error message:' + e); }
  
  var command = new DistributeCommand('9999-01-01', '9999-12-31');
  port.distribute(command);

  var command = new DistributeCommand('1000-01-01', '1000-12-31');
  port.distribute(command);
}
