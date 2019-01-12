/*
 * listシート
 */
var ListValues = function(sheetname, ignoreCategories) {
  this.HEADER_ROW_COUNT = 1;

  this.sheetname = sheetname;
  this.sheet = SpreadsheetApp.getActive().getSheetByName(sheetname);
  this.values;
  this.length;
  this.ignoreCategories;
  this.refresh(ignoreCategories);
}

/*
 * キャッシュ更新
 */
ListValues.prototype.refresh = function(ignoreCategories) {
  // キャッシュを更新
  var values = this.sheet.getDataRange().getValues();
  this.values = values;
  this.length = values.length;
  if (ignoreCategories != null) this.ignoreCategories = ignoreCategories.replace(' ', '').split(',');
}

/*
 * シート -> Issue
 */
ListValues.prototype.parse = function(row) {
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
ListValues.prototype.sheetClear = function() {
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
ListValues.prototype.getRow = function(row) {
  return this.values[row];
}

/*
 * getter
 */
ListValues.prototype.getCategory = function(row) {
  return this.values[row][0];
}
ListValues.prototype.getId = function(row) {
  return this.values[row][1];
}
ListValues.prototype.getMilestone = function(row) {
  return this.values[row][2];
}
ListValues.prototype.getTitle = function(row) {
  return this.values[row][3];
}
ListValues.prototype.getCreatedAt = function(row) {
  return this.values[row][4];
}
ListValues.prototype.getClosedAt = function(row) {
  return this.values[row][5];
}
ListValues.prototype.getPoint = function(row) {
  return this.values[row][6];
}

/*
 * setter
 */
ListValues.prototype.setCategory = function(row, category) {
  this.sheet.getRange(row, 1).setValue(category);
}
ListValues.prototype.setId = function(row, id) {
  this.sheet.getRange(row, 2).setValue(id);
}
ListValues.prototype.setMilestone = function(row, milestone) {
  this.sheet.getRange(row, 3).setValue(milestone);
}
ListValues.prototype.setTitle = function(row, title) {
  this.sheet.getRange(row, 4).setValue(title);
}
ListValues.prototype.setCreatedAt = function(row, created_at) {
  this.sheet.getRange(row, 5).setValue(created_at);
}
ListValues.prototype.setClosedAt = function(row, closed_at) {
  this.sheet.getRange(row, 6).setValue(closed_at);
}
ListValues.prototype.setPoint = function(row, point) {
  this.sheet.getRange(row, 7).setValue(point);
}


/*
 * Issue Object　-> listシート　追加
 */
ListValues.prototype.insert = function(row, issue) {
  this.setId(row, issue.id);
  this.setCreatedAt(row, issue.created_at);
  this.update(row, issue);
}
/*
 * Issue Object　-> listシート　更新
 */
ListValues.prototype.update = function(row, issue) {
  this.setMilestone(row, issue.milestone);
  this.setTitle(row, issue.title);
  this.setClosedAt(row, issue.closed_at);
  this.setPoint(row, issue.point);
}
/*
 * Issue Object　-> listシート　マッチするものがある場合のみ更新
 */
ListValues.prototype.updateWhenMatches = function(issue) {
  // 数値としてループ
  for (var index = 0; index < this.values.length; index++) {
    if (issue.id !== this.getId(index)) continue;
    if (!this.isIgnoreUpdate(index)) this.update(index + 1, issue);
    return true;
  }
  return false;
}
// listシートの値から更新の除外を判定
ListValues.prototype.isIgnoreUpdate = function(index) {
  // category
  var category = this.getCategory(index);
  if (category === "") return false;
  for (var ignoreIndex in this.ignoreCategories) {
    var ignoreValue = this.ignoreCategories[ignoreIndex];
    if (ignoreValue == category) return true;
  }
  return false;
}


/*
 * シートにIssuesを反映
 */
ListValues.prototype.updateSheet = function(issues) {
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
function test_ListValues() {
  var listValues = new ListValues('__test__');

  listValues = new ListValues('__test__', '__IGNORE__');
  
  var settings = settings_load();
  var ignoreCategories = settings['update.ignore_categories'];
  listValues = new ListValues('__test__', ignoreCategories);
}
