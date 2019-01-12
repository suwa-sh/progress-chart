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
    var chartPort = new ChartPort();
    var adjustCommand = new AdjustCommand(startDate, endDate);
    chartPort.adjust(adjustCommand);
    
    var fetchPort = new FetchPort(itsType, token, owner, repository, estimatePrefix);
    var fetchCommand = new FetchCommand(queryString);
    fetchPort.fetch(fetchCommand);
    
  } catch(e) { log_error(e); Browser.msgBox(e); return; }
  
  Browser.msgBox("処理が終了しました。");
}

function mainDistribute() {
  var settings = settings_load();
  LOG_LEVEL = settings['loglevel'];

  try {
    distribute(settings);
    checkDistributeResult(settings);
  } catch(e) { log_error(e); Browser.msgBox(e); return; }

  Browser.msgBox("処理が終了しました。");
}

function mainReport() {
  var settings = settings_load();
  LOG_LEVEL = settings['loglevel'];

  try {
    report(settings);
  } catch(e) { log_error(e); Browser.msgBox(e); return; }

  Browser.msgBox("処理が終了しました。");
}



function mainBulk() {
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

  var chartPort = new ChartPort();
  var adjustCommand = new AdjustCommand(startDate, endDate);
  chartPort.adjust(adjustCommand);
  
  var fetchPort = new FetchPort(itsType, token, owner, repository, estimatePrefix);
  var fetchCommand = new FetchCommand(queryString);
  fetchPort.fetch(fetchCommand);

  distribute(settings);
  checkDistributeResult(settings);

  report(settings);
}
