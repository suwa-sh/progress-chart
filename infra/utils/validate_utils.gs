function notEmpty(name, value) {
  if (value == null || value === '') throw new Error(name + ' が設定されていません。');
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_validate_utils() {
  LOG_LOGLEVEL = LOG_LOGLEVEL_DEBUG;
  
  try { notEmpty();             } catch(e) { log_debug('error message:' + e); }
  try { notEmpty('undefined');  } catch(e) { log_debug('error message:' + e); }
  try { notEmpty('null', null); } catch(e) { log_debug('error message:' + e); }
  try { notEmpty('empty', '');  } catch(e) { log_debug('error message:' + e); }
  notEmpty('string', 'string');
}
