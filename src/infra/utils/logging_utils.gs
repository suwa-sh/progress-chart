var LOG_LEVEL_TRACE = 'trace';
var LOG_LEVEL_DEBUG = 'debug';
var LOG_LEVEL_INFO = 'info';
var LOG_LEVEL_WARN = 'warn';
var LOG_LEVEL_ERROR = 'error';

var LOG_LEVEL = LOG_LEVEL_DEBUG;


function log_trace(message) {
  _log(LOG_LEVEL_TRACE, message);
}
function log_debug(message) {
  _log(LOG_LEVEL_DEBUG, message);
}
function log_info(message) {
  _log(LOG_LEVEL_INFO, message);
}
function log_warn(message) {
  _log(LOG_LEVEL_WARN, message);
}
function log_error(message) {
  _log(LOG_LEVEL_ERROR, message);
}

function log_isTraceEnabled() {
  return _log_isEnabled(LOG_LEVEL_TRACE);
}
function log_isDebugEnabled() {
  return _log_isEnabled(LOG_LEVEL_DEBUG);
}
function log_isInfoEnabled() {
  return _log_isEnabled(LOG_LEVEL_INFO);
}
function log_isWarnEnabled() {
  return _log_isEnabled(LOG_LEVEL_WARN);
}



function _log(lebel, messageArg) {
  function getDispLOGLEVEL(lebel) {
    if (lebel === LOG_LEVEL_TRACE) return '[TRACE]';
    if (lebel === LOG_LEVEL_DEBUG) return '[DEBUG]';
    if (lebel === LOG_LEVEL_INFO)  return '[INFO ]';
    if (lebel === LOG_LEVEL_WARN)  return '[WARN ]';
    if (lebel === LOG_LEVEL_ERROR) return '[ERROR]';
  }

  // skip判定
  if (! _log_isEnabled(lebel)) return;
  // ログ出力
  var message = getDispLOGLEVEL(lebel) + ' ' + messageArg;
  Logger.log(message);
}

function _log_isEnabled(lebel) {
  if (LOG_LEVEL === LOG_LEVEL_TRACE) {
    return true;
  }

  if (LOG_LEVEL === LOG_LEVEL_DEBUG) {
    if (lebel === LOG_LEVEL_TRACE) return false;
    return true;
  }

  if (LOG_LEVEL === LOG_LEVEL_INFO) {
    if (lebel === LOG_LEVEL_TRACE) return false;
    if (lebel === LOG_LEVEL_DEBUG) return false;
    return true;
  }

  if (LOG_LEVEL === LOG_LEVEL_WARN) {
    if (lebel === LOG_LEVEL_TRACE) return false;
    if (lebel === LOG_LEVEL_DEBUG) return false;
    if (lebel === LOG_LEVEL_INFO) return false;
    return true;
  }

  if (lebel === LOG_LEVEL_TRACE) return false;
  if (lebel === LOG_LEVEL_DEBUG) return false;
  if (lebel === LOG_LEVEL_INFO) return false;
  if (lebel === LOG_LEVEL_WARN) return false;
  return true;
}


//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_logging_utils() {
  function printLogs() {
    Logger.log('---------- LOG_LEVEL: ' + LOG_LEVEL + ' ----------');
    log_trace('trace log message');
    log_debug('debug log message');
    log_info( 'info  log message');
    log_warn( 'warn  log message');
    log_error('error log message');
  }

  LOG_LEVEL = 'error';
  printLogs();

  LOG_LEVEL = 'warn';
  printLogs();

  LOG_LEVEL = 'info';
  printLogs();

  LOG_LEVEL = 'debug';
  printLogs();

  LOG_LEVEL = 'trace';
  printLogs();
}
