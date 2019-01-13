/*
 * listシート
 */
var ListSheet = function(sheetname, ignoreCategories) {
  this.HEADER_ROW_COUNT = 1;

  this.sheetname = sheetname;
  this.sheet = SpreadsheetApp.getActive().getSheetByName(sheetname);
  this.values;
  this.length;
  this.ignoreCategories = ignoreCategories;

  this.refresh();
}

/*
 * キャッシュ更新
 */
ListSheet.prototype.refresh = function() {
  var values = this.sheet.getDataRange().getValues();
  this.values = values;
  this.length = values.length;
}

/*
 * シート -> Issue
 */
ListSheet.prototype.parse = function(row) {
  function dateFormat(dateString) {
    // 2018-11-29T14:04:00.602+09:00 -> 2018-11-29
    if (dateString === "") return dateString;
    return dateString.substr(0, 10);
  }

  var value = this.values[row];
//  var category = value[0];
  var id = value[1];
  var milestone = value[2];
  var title = value[3];
  var created_at = dateFormat(value[4]);
  var closed_at = dateFormat(value[5]);
  var point = value[6];
  return new Issue(id, milestone, title, created_at, closed_at, point);
}

/*
 * シートクリア
 */
ListSheet.prototype.sheetClear = function() {
  var beforeValues = this.sheet.getDataRange().getValues();
  var afterValues = [];

  for (var rowIndex = 0; rowIndex < beforeValues.length; rowIndex++) {
    var rowValue = beforeValues[rowIndex];
    // ヘッダー行は、データをコピー
    if (rowIndex < this.HEADER_ROW_COUNT) {
      afterValues.push(rowValue);
      continue;
    }

    // データ行は、空文字を設定
    var afterValue = [];
    for ( var colIndex = 0; colIndex < rowValue.length; colIndex++) {
      afterValue.push('');
    }
    afterValues.push(afterValue);
  }

  this.sheet.getDataRange().setValues(afterValues);
}

/*
 * シートの行データ
 */
ListSheet.prototype.getRow = function(row) {
  return this.values[row];
}

/*
 * getter
 */
ListSheet.prototype.getCategory = function(row) {
  return this.values[row][0];
}
ListSheet.prototype.getId = function(row) {
  return this.values[row][1];
}
ListSheet.prototype.getMilestone = function(row) {
  return this.values[row][2];
}
ListSheet.prototype.getTitle = function(row) {
  return this.values[row][3];
}
ListSheet.prototype.getCreatedAt = function(row) {
  return this.values[row][4];
}
ListSheet.prototype.getClosedAt = function(row) {
  return this.values[row][5];
}
ListSheet.prototype.getPoint = function(row) {
  return this.values[row][6];
}

/*
 * setter
 */
ListSheet.prototype.setCategory = function(row, category) {
  this.sheet.getRange(row, 1).setValue(category);
}
ListSheet.prototype.setId = function(row, id) {
  this.sheet.getRange(row, 2).setValue(id);
}
ListSheet.prototype.setMilestone = function(row, milestone) {
  this.sheet.getRange(row, 3).setValue(milestone);
}
ListSheet.prototype.setTitle = function(row, title) {
  this.sheet.getRange(row, 4).setValue(title);
}
ListSheet.prototype.setCreatedAt = function(row, created_at) {
  this.sheet.getRange(row, 5).setValue(created_at);
}
ListSheet.prototype.setClosedAt = function(row, closed_at) {
  this.sheet.getRange(row, 6).setValue(closed_at);
}
ListSheet.prototype.setPoint = function(row, point) {
  this.sheet.getRange(row, 7).setValue(point);
}


/*
 * Issue Object　-> listシート　追加
 */
ListSheet.prototype.insert = function(row, issue) {
  this.setId(row, issue.id);
  this.setCreatedAt(row, issue.created_at);
  this.update(row, issue);
}
/*
 * Issue Object　-> listシート　更新
 */
ListSheet.prototype.update = function(row, issue) {
  this.setMilestone(row, issue.milestone);
  this.setTitle(row, issue.title);
  this.setClosedAt(row, issue.closed_at);
  this.setPoint(row, issue.point);
}
/*
 * Issue Object　-> listシート　マッチするものがある場合のみ更新
 */
ListSheet.prototype.updateWhenMatches = function(issue, ignoreCategories) {
  // listシートの値から更新の除外を判定
  function isIgnoreUpdate(ignoreCategories, category) {
    if (isNull(ignoreCategories)) return false;
    if (isEmpty(category)) return false;
    
    for (var index in ignoreCategories) {
      var ignoreCategory = ignoreCategories[index];
      if (ignoreCategory == category) return true;
    }
    return false;
  }

  // 数値としてループ
  for (var index = 0; index < this.values.length; index++) {
    if (issue.id !== this.getId(index)) continue;
    if (!isIgnoreUpdate(ignoreCategories, this.getCategory(index))) this.update(index + 1, issue);
    return true;
  }
  return false;
}


/*
 * シートにIssuesを反映
 */
ListSheet.prototype.updateSheet = function(issues) {
  // シートをクリア
  this.sheetClear();

  // シートに反映
  for (var index = 0; index < issues.length; index++) {
    var row = this.HEADER_ROW_COUNT + index + 1;
    var issue = issues[index];
    this.insert(row, issue);
  }
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_ListSheet() {
  LOG_LEVEL = LOG_LEVEL_TRACE;
  var listSheet = new ListSheet('__test__');

  var ignoreCategories = [];
  ignoreCategories.push('DEF1');
  ignoreCategories.push('DEF2');
  ignoreCategories.push('DEF3');
  
  var issue = {};
  issue.id = 'NOT_EXIST'
  var isMatched = listSheet.updateWhenMatches(issue, ignoreCategories);
  log_debug('isMatched:' + isMatched);
}
