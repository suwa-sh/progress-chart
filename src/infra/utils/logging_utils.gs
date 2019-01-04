var LOG_LOGLEVEL_TRACE = 'trace';
var LOG_LOGLEVEL_DEBUG = 'debug';
var LOG_LOGLEVEL_INFO = 'info';
var LOG_LOGLEVEL_WARN = 'warn';
var LOG_LOGLEVEL_ERROR = 'error';

var LOG_LOGLEVEL = LOG_LOGLEVEL_DEBUG;


function log_trace(message) {
  _log(LOG_LOGLEVEL_TRACE, message);
}
function log_debug(message) {
  _log(LOG_LOGLEVEL_DEBUG, message);
}
function log_info(message) {
  _log(LOG_LOGLEVEL_INFO, message);
}
function log_warn(message) {
  _log(LOG_LOGLEVEL_WARN, message);
}
function log_error(message) {
  _log(LOG_LOGLEVEL_ERROR, message);
}

function log_isTraceEnabled() {
  return _log_isEnabled(LOG_LOGLEVEL_TRACE);
}
function log_isDebugEnabled() {
  return _log_isEnabled(LOG_LOGLEVEL_DEBUG);
}
function log_isInfoEnabled() {
  return _log_isEnabled(LOG_LOGLEVEL_INFO);
}
function log_isWarnEnabled() {
  return _log_isEnabled(LOG_LOGLEVEL_WARN);
}



function _log(lebel, messageArg) {
  function getDispLOGLEVEL(lebel) {
    if (lebel === LOG_LOGLEVEL_TRACE) return '[TRACE]';
    if (lebel === LOG_LOGLEVEL_DEBUG) return '[DEBUG]';
    if (lebel === LOG_LOGLEVEL_INFO)  return '[INFO ]';
    if (lebel === LOG_LOGLEVEL_WARN)  return '[WARN ]';
    if (lebel === LOG_LOGLEVEL_ERROR) return '[ERROR]';
  }

  // skip判定
  if (! _log_isEnabled(lebel)) return;
  // ログ出力
  var message = getDispLOGLEVEL(lebel) + ' ' + messageArg;
  Logger.log(message);
}

function _log_isEnabled(lebel) {
  if (LOG_LOGLEVEL === LOG_LOGLEVEL_TRACE) {
    return true;
  }

  if (LOG_LOGLEVEL === LOG_LOGLEVEL_DEBUG) {
    if (lebel === LOG_LOGLEVEL_TRACE) return false;
    return true;
  }

  if (LOG_LOGLEVEL === LOG_LOGLEVEL_INFO) {
    if (lebel === LOG_LOGLEVEL_TRACE) return false;
    if (lebel === LOG_LOGLEVEL_DEBUG) return false;
    return true;
  }

  if (LOG_LOGLEVEL === LOG_LOGLEVEL_WARN) {
    if (lebel === LOG_LOGLEVEL_TRACE) return false;
    if (lebel === LOG_LOGLEVEL_DEBUG) return false;
    if (lebel === LOG_LOGLEVEL_INFO) return false;
    return true;
  }

  if (lebel === LOG_LOGLEVEL_TRACE) return false;
  if (lebel === LOG_LOGLEVEL_DEBUG) return false;
  if (lebel === LOG_LOGLEVEL_INFO) return false;
  if (lebel === LOG_LOGLEVEL_WARN) return false;
  return true;
}


//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_logging_utils() {
  function printLogs() {
    Logger.log('---------- LOG_LOGLEVEL: ' + LOG_LOGLEVEL + ' ----------');
    log_trace('trace log message');
    log_debug('debug log message');
    log_info( 'info  log message');
    log_warn( 'warn  log message');
    log_error('error log message');
  }

  LOG_LOGLEVEL = 'error';
  printLogs();

  LOG_LOGLEVEL = 'warn';
  printLogs();

  LOG_LOGLEVEL = 'info';
  printLogs();

  LOG_LOGLEVEL = 'debug';
  printLogs();

  LOG_LOGLEVEL = 'trace';
  printLogs();
}
