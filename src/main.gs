function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menus = [
    { name: 'Fetch     : ITS -> src sheet', functionName: 'mainFetch' },
    { name: 'Distribute: src sheet -> list sheets', functionName: 'mainDistribute' },
    { name: 'Report    : chart -> slack', functionName: 'mainReport' },
    { name: 'Bulk      : Fetch -> Distribute -> Report', functionName: 'mainBulk' },
  ];
  ss.addMenu('【progress-chart】', menus)
}



function mainFetch() {
  // 設定取得
  var settings = settings_load();
  LOG_LEVEL = settings['loglevel'];
  
  var startDate = settings['chart.start_date'];
  var endDate = settings['chart.end_date'];
  var itsType = settings['its.type'];
  var token = settings['its.token'];
  var owner = settings['its.owner'];
  var repository = settings['its.repository'];
  var estimatePrefix = settings['its.estimate_label_prefix'];
  var queryString = settings['its.query_string'];
  
  try {
    // chartの調整
    var chartPort = new ChartPort();
    var adjustCommand = new AdjustCommand(startDate, endDate);
    chartPort.adjust(adjustCommand);
    
    // fetch
    var fetchPort = new FetchPort(itsType, token, owner, repository, estimatePrefix);
    var fetchCommand = new FetchCommand(queryString);
    fetchPort.fetch(fetchCommand);
    
  } catch(e) { log_error(e); Browser.msgBox(e); return; }
  
  Browser.msgBox("処理が終了しました。");
}

function mainDistribute() {
  // 設定取得
  var settings = settings_load();
  LOG_LEVEL = settings['loglevel'];
  
  var startDate = settings['chart.start_date'];
  var endDate = settings['chart.end_date'];
  var ignoreCategoriesDef = settings['update.ignore_categories'];
  var excludeTitlePrefixesDef = settings['update.exclude_src_title_prefixes'];

  try {
    // chartの調整
    var chartPort = new ChartPort();
    var adjustCommand = new AdjustCommand(startDate, endDate);
    chartPort.adjust(adjustCommand);
    
    // distribute
    var distributePort = new DistributePort(ignoreCategoriesDef, excludeTitlePrefixesDef);
    var distributeCommand = new DistributeCommand(startDate, endDate);
    distributePort.distribute(distributeCommand);
  } catch(e) { log_error(e); Browser.msgBox(e); return; }

  Browser.msgBox("処理が終了しました。");
}

function mainReport() {
  // 設定取得
  var settings = settings_load();
  LOG_LEVEL = settings['loglevel'];
  
  var startDate = settings['chart.start_date'];
  var endDate = settings['chart.end_date'];

  try {
    // chartの調整
    var chartPort = new ChartPort();
    var adjustCommand = new AdjustCommand(startDate, endDate);
    chartPort.adjust(adjustCommand);
    
    // report
    report(settings);
  } catch(e) { log_error(e); Browser.msgBox(e); return; }

  Browser.msgBox("処理が終了しました。");
}



function mainBulk() {
  // 設定取得
  var settings = settings_load();
  LOG_LEVEL = settings['loglevel'];
  
  var startDate = settings['chart.start_date'];
  var endDate = settings['chart.end_date'];
  var itsType = settings['its.type'];
  var token = settings['its.token'];
  var owner = settings['its.owner'];
  var repository = settings['its.repository'];
  var estimatePrefix = settings['its.estimate_label_prefix'];
  var queryString = settings['its.query_string'];

  // chartの調整
  var chartPort = new ChartPort();
  var adjustCommand = new AdjustCommand(startDate, endDate);
  chartPort.adjust(adjustCommand);
  
  // fetch
  var fetchPort = new FetchPort(itsType, token, owner, repository, estimatePrefix);
  var fetchCommand = new FetchCommand(queryString);
  fetchPort.fetch(fetchCommand);

  // distribute
  distribute(settings);
  checkDistributeResult(settings);

  // report
  report(settings);
}
