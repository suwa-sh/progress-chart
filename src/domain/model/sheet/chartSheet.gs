/*
 * chartシート
 */
var ChartSheet = function() {
  this.sheetname = 'chart';
  this.sheet = SpreadsheetApp.getActive().getSheetByName(this.sheetname);
  
  this.CHARTINDEX_BURNDOWN = 0;
  this.CHARTINDEX_BURNUP = 1;
}

ChartSheet.prototype._getChartImage = function(index) {
  var charts = this.sheet.getCharts();
  var chartImage = charts[index].getBlob().getAs('image/png').setName("chart.png");
  return chartImage
}

ChartSheet.prototype.getBurnDownImage = function() {
  return this._getChartImage(this.CHARTINDEX_BURNDOWN);
}

ChartSheet.prototype.getBurnUpImage = function() {
  return this._getChartImage(this.CHARTINDEX_BURNUP);
}
