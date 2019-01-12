function settings_load(sheetName) {
  function parseCache(sheetName) {
    const DEFINED_AT_SHEET = 'Sheet';
    const DEFINED_AT_USER_PROPS = 'UserProperties';
    const DEFINED_AT_SCRIPT_PROPS = 'ScriptProperties';
    
    var cache = {};
    var rows = SpreadsheetApp.getActive().getSheetByName(sheetName).getDataRange().getValues();
    for (var curRowIdx =0; curRowIdx < rows.length; curRowIdx++) {
      log_trace('-- rowIdx:' + curRowIdx);
      // ヘッダー行をスキップ
      if (curRowIdx <= 0) continue;
      
      var key = rows[curRowIdx][0];
      var defined_at = rows[curRowIdx][1];
      var value = rows[curRowIdx][2];
  
      // 定義ソースが未定義の場合スキップ
      if (defined_at === '') continue;
      
      log_trace('---- key:' + key + ', defined_at:' + defined_at + ', value:' + value);
      if (defined_at === DEFINED_AT_SHEET)        { cache[key] = value; continue; }
      if (defined_at === DEFINED_AT_USER_PROPS)   { cache[key] = UserProperties.getProperty(value); continue; }
      if (defined_at === DEFINED_AT_SCRIPT_PROPS) { cache[key] = ScriptProperties.getProperty(value); continue; }
      
      throw new Error('Unknown setting defined source: ' + defined_at)
    }
    return cache;
  }


  var settingsSheetName = sheetName;
  if (settingsSheetName == null || settingsSheetName === '') settingsSheetName = 'settings';
  
  return parseCache(settingsSheetName);
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_settings() {
  LOG_LEVEL = LOG_LEVEL_TRACE;

  var settings = settings_load();
  log_trace('default    settings: ' + JSON.stringify(settings));
  
  settings = settings_load('settings - Sample GitHub');
  log_trace('sheet_name settings: ' + JSON.stringify(settings));
}
