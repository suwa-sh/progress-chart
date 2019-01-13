function isNull(value) {
  if (value == null) return true;
  return false;
}

function isEmpty(value) {
  if (value == null || value === '') return true;
  return false;
}

function notNull(name, value) {
  if (isNull(value)) throw new Error(name + ' が設定されていません。');
}

function notEmpty(name, value) {
  if (isEmpty(value)) throw new Error(name + ' が設定されていません。');
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_validate_utils() {
  LOG_LEVEL = LOG_LEVEL_DEBUG;
  
  log_debug('notNull')
  try { notNull();             } catch(e) { log_debug('-- error message:' + e); }
  try { notNull('undefined');  } catch(e) { log_debug('-- error message:' + e); }
  try { notNull('null', null); } catch(e) { log_debug('-- error message:' + e); }
  notNull('string', 'string');

  log_debug('notEmpty')
  try { notEmpty();             } catch(e) { log_debug('-- error message:' + e); }
  try { notEmpty('undefined');  } catch(e) { log_debug('-- error message:' + e); }
  try { notEmpty('null', null); } catch(e) { log_debug('-- error message:' + e); }
  try { notEmpty('empty', '');  } catch(e) { log_debug('-- error message:' + e); }
  notEmpty('string', 'string');
}
