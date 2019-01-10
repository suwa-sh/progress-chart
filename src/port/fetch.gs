var ITS_TYPE_MANUAL = 'Manual';
var ITS_TYPE_GITHUB = 'GitHub';
var ITS_TYPE_GITLAB = 'GitLab';
var ITS_TYPE_PIVOTALTRACKER = 'PivotalTracker';
var ITS_TYPE_ASANA = 'Asana';


function fetch(settings) {
  log_info("fetch start");
  
  // 設定読み込み
  var itsType = settings['its.type'];
  var chartStartDate = settings['chart.start_date'];
  var chartEndDate = settings['chart.end_date'];
  
  // calcシートの調整
  new CalcValues().adjustRow(chartStartDate, chartEndDate);
  

  if (itsType === ITS_TYPE_MANUAL) { log_info("fetch skip"); return; }
  if (itsType === ITS_TYPE_GITHUB) { _fetch_GitHub(settings); log_info("fetch end"); return; }
  if (itsType === ITS_TYPE_ASANA)  { _fetch_Asana(settings);  log_info("fetch end"); return; }
/* TODO 未実装
  if (itsType === 'GitLab')         { _fetch_GitLab(settings);         log_info("fetch end"); return; }
  if (itsType === 'PivotalTracker') { _fetch_PivotalTracker(settings); log_info("fetch end"); return; }
*/
  throw new Error('itsType:' + itsType + ' には対応していません。');
}

/*
 * 結果チェック
 */
function checkFetchResult(settings) {
  // 設定読み込み
  var itsType = settings['its.type'];
  if (itsType === ITS_TYPE_MANUAL) return;

  // TODO この時点で確認できることはある？
}


function _fetch_GitHub(settings) {
  log_debug('_fetch_GitHub start');
  // 設定読み込み
  var token = settings['its.token'];
  var owner = settings['its.owner'];
  var repository = settings['its.repository'];
  var estimateLabelPrefix = settings['its.estimate_label_prefix'];
  var queryString = settings['its.query_string'];

  // issues取得
  var adapter = new GitHubAdapter(token, owner, repository, estimateLabelPrefix);
  var issues = adapter.find(queryString);

  // シートをクリア
  var srcListValues = new ListValues('[list] src');
  srcListValues.sheetClear();

  // シートに反映
  for (var index = 0; index < issues.length; index++) {
    var row = srcListValues.HEADER_ROW_COUNT + index + 1;
    var issue = issues[index];
    srcListValues.insert(row, issue);
  }

  log_debug('_fetch_GitHub end');
}


function _fetch_Asana(settings) {
  function updateRow(adapter, issue, srcListValues, row) {
    issue.milestone = adapter.getMilestone(issue.id);
    srcListValues.insert(row, issue);
    return issue.title;
  }

  log_debug('_fetch_Asana start');
  // 設定読み込み
  var token = settings['its.token'];
  var owner = settings['its.owner'];
  var repository = settings['its.repository'];
  var estimateLabelPrefix = settings['its.estimate_label_prefix'];
  var queryString = settings['its.query_string'];

  // issues取得
  var adapter = new AsanaAdapter(token, owner, repository, estimateLabelPrefix);
  var issues = adapter.find(queryString);

  // シートをクリア
  var srcListValues = new ListValues('[list] src');
  srcListValues.sheetClear();

  // シートに反映
  for (var index = 0; index < issues.length; index++) {
    var row = srcListValues.HEADER_ROW_COUNT + index + 1;
    var issue = issues[index];
    // TODO 非同期で実行したい。。。
//    var callback = function(issueTitle) { log_debug('title: ' + issueTitle + ' is updated') };
    updateRow(adapter, issue, srcListValues, row);
  }

  log_debug('_fetch_Asana end');
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_fetch() {
  LOG_LOGLEVEL = LOG_LOGLEVEL_DEBUG;

  var settings = settings_load();
  fetch(settings);
}