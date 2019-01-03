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
  LOG_LOGLEVEL = settings['loglevel'];

  try {
    fetch(settings);
    checkFetchResult(settings);
  } catch(e) { log_error(e); Browser.msgBox(e); return; }
  
  Browser.msgBox("処理が終了しました。");
}

function mainDistribute() {
  var settings = settings_load();
  LOG_LOGLEVEL = settings['loglevel'];

  try {
    distribute(settings);
    checkDistributeResult(settings);
  } catch(e) { log_error(e); Browser.msgBox(e); return; }

  Browser.msgBox("処理が終了しました。");
}

function mainReport() {
  var settings = settings_load();
  LOG_LOGLEVEL = settings['loglevel'];

  try {
    report(settings);
  } catch(e) { log_error(e); Browser.msgBox(e); return; }

  Browser.msgBox("処理が終了しました。");
}



function mainBulk() {
  var settings = settings_load();
  LOG_LOGLEVEL = settings['loglevel'];

  fetch(settings);
  checkFetchResult(settings);

  distribute(settings);
  checkDistributeResult(settings);

  report(settings);
}
