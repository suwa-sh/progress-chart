function settings_load(sheetName) {
  function addCredentials(settingsMap) {
// TODO メニューバー.ファイル > プロジェクトのプロパティ で設定した値が参照できないので deprecated のUserProperties を利用している。
//    var userProperties = PropertiesService.getUserProperties();
    settingsMap['its.token'] = UserProperties.getProperty('progress-chart__its.token');
    settingsMap['slack.bot_token'] = UserProperties.getProperty('progress-chart__slack.bot_token');
    
    return settingsMap;
  }
  
  var settingsSheetName = sheetName;
  if (settingsSheetName == null || settingsSheetName === '') settingsSheetName = 'settings';
  
  var settingsMap = _parseCache(settingsSheetName);
  return addCredentials(settingsMap);
}


/*
 * キー、バリューだけを定義したシートの内容を、オブジェクトに変換します。
 *
 * @param sheetName シート名
 * @return キャッシュオブジェクト
 */
function _parseCache(sheetName) {
  var cache = {};
  var data = SpreadsheetApp.getActive().getSheetByName(sheetName).getDataRange().getValues();
  for (var curRow in data) {
    cache[data[curRow][0]] = data[curRow][1];
  }
  return cache;
}
