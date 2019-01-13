var FetchPort = function(itsType, token, owner, repository, estimatePrefix) {
  this.ITSTYPE_MANUAL = 'Manual';
  this.ITSTYPE_GITHUB = 'GitHub';
  this.ITSTYPE_ASANA = 'Asana';
  this.ITSTYPE_GITLAB = 'GitLab';
  this.ITSTYPE_PIVOTALTRACKER = 'PivotalTracker';

  notEmpty('FetchPort.itsType', itsType);
  notEmpty('FetchPort.token', token);
  notEmpty('FetchPort.owner', owner);
  notEmpty('FetchPort.repository', repository);
  notEmpty('FetchPort.estimatePrefix', estimatePrefix);

  this.itsType = itsType;
  this.token = token;
  this.owner = owner;
  this.repository = repository;
  this.estimatePrefix = estimatePrefix;
  
  this.adapter;
  switch(itsType) {
    case this.ITSTYPE_MANUAL:
    // TODO 未実装
    case this.ITSTYPE_GITLAB:
    case this.ITSTYPE_PIVOTALTRACKER:
      break;
    case this.ITSTYPE_GITHUB:
      this.adapter = new GitHubAdapter(this.token, this.owner, this.repository, this.estimatePrefix);
      break;
    case this.ITSTYPE_ASANA:
      this.adapter = new AsanaAdapter(this.token, this.owner, this.repository, this.estimatePrefix);
      break;
    default:
      throw new Error('FetchPort.itsType ' + itsType + ' には対応していません。');
  }
  
  this.sheet = new ListSheet('[list] src');
}


var FetchCommand = function(queryString) {
  // queryString 未設定の場合、全件検索
  
  this.queryString = queryString;
}


FetchPort.prototype.fetch = function(command) {
  log_info("FetchPort#fetch start");
  notNull('command', command);
  
  var issues = this._delegateFetch(command);
  if (issues != null) this.sheet.updateSheet(issues);

  log_info("FetchPort#fetch end");
}


FetchPort.prototype._delegateFetch = function(command) {
  if (command.itsType === this.ITSTYPE_MANUAL) return null;

  var issues = this.adapter.find(command.queryString);
  
  if (command.itsType === this.ITSTYPE_ASANA) {
    // milestoneの取得
    for (var index = 0; index < issues.length; index++) {
      // TODO 非同期で実行したい
      issue.milestone = adapter.getSection(issues[index].id);
    }
  }

  return issues;
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_FetchPort_GitHub() {
  log_debug('GitHub');
  LOG_LEVEL = LOG_LEVEL_DEBUG;
  
  var port = new FetchPort('GitHub', UserProperties.getProperty('GitHubToken'), 'suwa-sh', 'progress-chart', '+');
  var command;
  var outputSheet = SpreadsheetApp.getActive().getSheetByName('[list] src');
  var values;
  
  log_debug('-- queryStringなし');
  command = new FetchCommand('');
  port.fetch(command);
  
  values = outputSheet.getDataRange().getValues();
  log_debug('---- rows:' + values.length);
  log_debug('---- values:' + JSON.stringify(values));


  log_debug('-- queryStringあり');
  command = new FetchCommand('state=all&sort=created&direction=asc&since=9999-01-01T00:00:00Z');
  port.fetch(command);
  
  values = outputSheet.getDataRange().getValues();
  log_debug('---- rows:' + values.length);
  log_debug('---- values:' + JSON.stringify(values));
}


function test_FetchPort_Asana() {
  log_debug('Asana');
  LOG_LEVEL = LOG_LEVEL_DEBUG;
  
  var port = new FetchPort('Asana', UserProperties.getProperty('AsanaToken'), 'sample', 'Backlog', '+');
  var command;
  var outputSheet = SpreadsheetApp.getActive().getSheetByName('[list] src');
  var values;
  
  log_debug('-- queryStringなし');
  command = new FetchCommand('');
  port.fetch(command);
  
  values = outputSheet.getDataRange().getValues();
  log_debug('---- rows:' + values.length);
  log_debug('---- values:' + JSON.stringify(values));


  log_debug('-- queryStringあり');
  command = new FetchCommand('modified_since=9999-01-01T00:00:00Z');
  port.fetch(command);
  
  values = outputSheet.getDataRange().getValues();
  log_debug('---- rows:' + values.length);
  log_debug('---- values:' + JSON.stringify(values));
}