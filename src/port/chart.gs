var ChartPort = function() {
  this.calcSheet = new CalcSheet();
}

var AdjustCommand = function(startDate, endDate) {
  notEmpty('AdjustCommand.startDate', startDate);
  notEmpty('AdjustCommand.endDate', endDate);
  
  this.startDate = startDate;
  this.endDate = endDate;
}

ChartPort.prototype.adjust = function(command) {
  log_info("ChartPort#adjust start");
  notNull('command', command);

  // calcシートの調整
  this.calcSheet.adjustRow(command.startDate, command.endDate);

  log_info("ChartPort#adjust end");
}