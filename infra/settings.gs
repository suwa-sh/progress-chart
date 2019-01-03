function settings_load() {
  return _parseCache('settings');
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
