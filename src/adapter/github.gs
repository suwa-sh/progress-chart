var GitHubAdapter = function(token, owner, repository, estimateLabelPrefix) {
  notEmpty('GitHubAdapter.token', token);
  notEmpty('GitHubAdapter.owner', owner);
  notEmpty('GitHubAdapter.repository', repository);
  notEmpty('GitHubAdapter.estimateLabelPrefix', estimateLabelPrefix);

  this.token = token;
  this.owner = owner;
  this.repository = repository;
  this.estimateLabelPrefix = estimateLabelPrefix;
}

GitHubAdapter.prototype.find = function(queryString) {
  log_trace('GitHubAdapter.find start');
  
  function getPoint(labels, estimateLabelPrefix) {
    for (var index in labels) {
      var label = labels[index];
      log_trace("---- label:" + JSON.stringify(label));
      var name = label['name'];
      if (name == null) continue;
      if (name.substr(0, estimateLabelPrefix.length) == estimateLabelPrefix) {
        return name.substr(estimateLabelPrefix.length, name.length);
      }
    }
    return '';
  }

  function appendIssues(issues, githubIssues, estimateLabelPrefix) {
    for(var index = 0; index < githubIssues.length; index++) {
      var githubIssue = githubIssues[index];
      log_trace("-- githubIssue:" + JSON.stringify(githubIssue));

      // pull requestをスキップ
      if (githubIssue["pull_request"] != null) continue;

      var milestone = '';
      if (githubIssue["milestone"] != null) milestone = githubIssue["milestone"]["title"];
      var id = githubIssue["number"];
      var title = githubIssue["title"];
      // TODO URLあったほうが便利かな？
//      var url = githubIssue["html_url"];
      var created_at = githubIssue["created_at"];
      var closed_at = githubIssue["closed_at"];
      var point = getPoint(githubIssue['labels'], estimateLabelPrefix);
      var issue = new Issue(id, milestone, title, created_at, closed_at, point);
      
      issues.push(issue);
    }
  }


  var apiUrl = 'https://api.github.com/repos/' + this.owner + '/' + this.repository + '/issues' + '?access_token=' + this.token;
  if (queryString != null) apiUrl += '&' + queryString;

  var issues = [];
  var page = 1;
  while (true) {
    var url = apiUrl + '&page=' + page;
    log_trace("request url:" + url); 
    var response = UrlFetchApp.fetch(url);
    // TODO check response
    var githubIssues = JSON.parse(response);

    if (githubIssues.length == 0) break;

    appendIssues(issues, githubIssues, this.estimateLabelPrefix);
    page++;
  }
  
  log_trace('GitHubAdapter.find end');
  return issues;
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_GitHubAdapter() {
  LOG_LOGLEVEL = LOG_LOGLEVEL_DEBUG;

  var settings = settings_load('settings - Sample GitHub');
  var token = settings['its.token'];
  var owner = settings['its.owner'];
  var repository = settings['its.repository'];
  var estimateLabelPrefix = settings['its.estimate_label_prefix'];
  var queryString = settings['its.query_string'];

  try {
    adapter = new GitHubAdapter();
  } catch(e) {
    log_debug('error message:' + e);
  }

  try {
    adapter = new GitHubAdapter(token);
  } catch(e) {
    log_debug('error message:' + e);
  }

  try {
    adapter = new GitHubAdapter(token, owner);
  } catch(e) {
    log_debug('error message:' + e);
  }

  try {
    adapter = new GitHubAdapter(token, owner, repository);
  } catch(e) {
    log_debug('error message:' + e);
  }

  var adapter;
  adapter = new GitHubAdapter(token, owner, repository, estimateLabelPrefix);
  var issues = adapter.find();
  log_debug('find() issues.length:' + issues.length);
  
  issues = adapter.find(queryString);
  log_debug('find(' + queryString + ') issues.length:' + issues.length);
}