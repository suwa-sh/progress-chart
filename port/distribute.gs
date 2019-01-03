/* 
 * srcシート -> 各リストシート への振り分け
 */
function distribute(settings) {
  function isBeforeTargetStart(dateString) {
    if (dateString === "") return false;
    if (compareDate(chartStartDate, dateString) > 0) return true;
    return false;
  }
  function isAfterTargetEnd(dateString) {
    if (dateString === "") return false;
    if (compareDate(dateString, chartEndDate) > 0) return true;
    return false;
  }
  function compareDate(dateString1, dateString2) {
    // string -> date にして比較
    var date1 = new Date(dateString1);
    var date2 = new Date(dateString2);
  
    if (date1 < date2) return -1;
    if (date1 > date2) return 1;
    return 0;
  }
  
  /*
   * srcの値からexcludeシートへの追加を判定
   */
  function isInsertExcludeSheet(issue) {
    // title prefix
    if (issue.title === "") return false;
  
    for (var index in _excludeSrcTitlePrefixes){
      var excludePrefix = _excludeSrcTitlePrefixes[index];
      if (forwardMatch(issue.title, excludePrefix)) return true;
    }
    return false;
  }
  function forwardMatch(string, keyword) {
    return string.substr(0, keyword.length) == keyword;
  }


  log_info("distribute start");

  // 設定読み込み
  var chartStartDate = settings['chart.start_date'];
  var chartEndDate = settings['chart.end_date'];
  var ignoreCategories = settings['update.ignore_categories'];
  var _excludeSrcTitlePrefixes = settings['update.exclude_src_title_prefixes'].replace(' ', '').split(',');
  
  // calcシートの調整
  new CalcValues().adjustRow(chartStartDate, chartEndDate);

  // シートのデータをキャッシュ
  var srcListValues = new ListValues('[list] src', ignoreCategories);
  var backlogListValues = new ListValues('[list] backlog', ignoreCategories);
  var iceboxListValues = new ListValues('[list] icebox', ignoreCategories);
  var excludeListValues = new ListValues('[list] excludes', ignoreCategories);

  // カウント
  var excludeCount = 0
  var inputCount = 0

  for (var index = 0; index < srcListValues.length; index++) {
    
    // ヘッダー行をスキップ
    if (index < srcListValues.HEADER_ROW_COUNT) continue;

    var srcIssue = srcListValues.parse(index);

    // 対象期間から外れるものをスキップ
    if (isBeforeTargetStart(srcIssue.closed_at)) { log_debug("-- SKIP   beforeStart id:" + srcIssue.id); continue; }
    if (isAfterTargetEnd(srcIssue.created_at))   { log_debug("-- SKIP   afterEnd    id:" + srcIssue.id); continue; }

    // 更新
    if (backlogListValues.updateWhenMatches(srcIssue)) { log_debug("-- UPDATE backlog id:" + srcIssue.id); continue; }
    if (iceboxListValues.updateWhenMatches(srcIssue))  { log_debug("-- UPDATE icebox  id:" + srcIssue.id); continue; }
    if (excludeListValues.updateWhenMatches(srcIssue)) { log_debug("-- UPDATE exclude id:" + srcIssue.id); continue; }

    // 無視リストに追加
    if (isInsertExcludeSheet(srcIssue)) {
      excludeCount++;
      excludeListValues.insert(excludeListValues.length + excludeCount, srcIssue);
      log_debug("-- INSERT exclude id:" + srcIssue.id);
      continue;
    }

    // 入力リストに追加
    inputCount++;
    backlogListValues.insert(backlogListValues.length + inputCount, srcIssue);
    log_debug("-- INSERT backlog id:" + srcIssue.id);
  }
  log_info("distribute end");
}

/*
 * 結果チェック
 */
function checkDistributeResult(settings) {
  // backlogシートのチェック
  var backlogListValues = new ListValues('[list] backlog');
  for (var index = 0; index < backlogListValues.length; index++) {
    if (backlogListValues.getPoint(index) !== "") { continue; }
    var row = index + 1;
    throw new Error(backlogListValues.sheetname + " シート " + row + "行目 のissueに ポイント が設定されていません。 確認してください。");
  }
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_distribute() {
  LOG_LOGLEVEL = LOG_LOGLEVEL_DEBUG;

  var settings = settings_load();
  distribute(settings);
}
