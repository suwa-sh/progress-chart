var AsanaAdapter = function(token, workspace, project, estimateTagPrefix) {
  notEmpty('AsanaAdapter.token', token);
  notEmpty('AsanaAdapter.workspace', workspace);
  notEmpty('AsanaAdapter.project', project);
  notEmpty('AsanaAdapter.estimateTagPrefix', estimateTagPrefix);

  this.token = token;
  this.workspace = workspace;
  this.project = project;
  this.estimateTagPrefix = estimateTagPrefix;
  
  this.auth = { "Authorization" : "Bearer " + this.token };
  this.workspaceId = this._getWorkspaceId();
  this.projectId = this._getProjectId();
  this.tags = this._getTags();

  log_trace("AsanaAdapter:" + JSON.stringify(this)); 
}


AsanaAdapter.prototype.getGetParams = function() {
  return { "method" : "get",   "contentType" : "application/json", "headers" : this.auth };
}
AsanaAdapter.prototype.getPostParams = function(payload) {
  return { "method" : "post",  "contentType" : "application/json", "headers" : this.auth, "payload" : JSON.stringify(payload) };
}
AsanaAdapter.prototype.getPutParams = function(payload) {
  return { "method" : "put",   "contentType" : "application/json", "headers" : this.auth, "payload" : JSON.stringify(payload) };
}
AsanaAdapter.prototype.getDeleteParams = function() {
  return { "method" : "delete", "contentType" : "application/json", "headers" : this.auth };
}

AsanaAdapter.prototype._getWorkspaceId = function() {
  var url = "https://app.asana.com/api/1.0/workspaces";
  log_trace("request url:" + url + ', params:' + JSON.stringify(this.getGetParams())); 
  var response = JSON.parse(UrlFetchApp.fetch(url, this.getGetParams()));
  var workspaces = response.data;
  for (var index = 0; index < workspaces.length; index++) {
    var workspace = workspaces[index];
    if (workspace.name === this.workspace) return workspace.gid;
  }
  
  throw new Error("workspace id が取得できません。 name:" + workspace.name);
}

AsanaAdapter.prototype._getProjectId = function() {
  var url = "https://app.asana.com/api/1.0/workspaces/" + this.workspaceId + "/projects";
  log_trace("request url:" + url); 
  var response = JSON.parse(UrlFetchApp.fetch(url, this.getGetParams()));
  var projects = response.data;
  for (var index = 0; index < projects.length; index++) {
    var project = projects[index];
    if (project.name === this.project) return project.gid;
  }
  
  throw new Error("project id が取得できません。 name:" + project.name);
}

AsanaAdapter.prototype._getTags = function() {
  var url = "https://app.asana.com/api/1.0/workspaces/" + this.workspaceId + "/tags";
  log_trace("request url:" + url); 
  var response = JSON.parse(UrlFetchApp.fetch(url, this.getGetParams()));
  var asanaTags = response.data;
  var tags = [];
  for (var index = 0; index < asanaTags.length; index++) {
    tags.push(asanaTags[index]);
  }

  return tags;
}

/*
AsanaAdapter.prototype.getSections = function(queryString) {
  log_trace('AsanaAdapter.getSections start');
  
  var url = "https://app.asana.com/api/1.0/projects/" + this.projectId + "/sections?limit=100";
  if (queryString != null) url += '&' + queryString;

  var sections = [];
  while (true) {
    log_trace("request url:" + url); 
    var response = JSON.parse(UrlFetchApp.fetch(url, this.getGetParams()));
    var asanaSections = response.data;
    var nextPage = response.next_page;
    for (var asanaSection in asanaSections) {
      sections.push(asanaSection);
    }
    
    if (nextPage == null) break;
    url = nextPage.uri;
  }
  
  log_trace('AsanaAdapter.getSections end sections:' + JSON.stringify(sections));
  return sections;
}
*/

AsanaAdapter.prototype._getSection = function(taskId) {
  const DEFAULT_RETURN_VALUE = '';
  var url = "https://app.asana.com/api/1.0/tasks/" + taskId;
  log_trace("-- request url:" + url); 
  var response = JSON.parse(UrlFetchApp.fetch(url, this.getGetParams()));
  var asanaTask = response.data;
  
  // sectionの場合、デフォルト値
  if (asanaTask.resource_subtype === 'section') return DEFAULT_RETURN_VALUE;

  // membershipがない場合、デフォルト値
  var memberships = asanaTask.memberships;
  if (memberships == null) return DEFAULT_RETURN_VALUE;
  
  // 対象のprojectで、sectionがあればsection.name、sectionがなければ空文字 を返す
  // 想定パターン
  //   - projectがboard -> 空文字
  //   - projectがlist で 単発task -> 空文字
  //   - projectがlist で sectionに所属 -> section.name
  for (var index = 0; index < memberships.length; index++) {
    var membership = memberships[index];
    var project = membership.project;
    if (project.gid != this.projectId) continue;

    var section = membership.section;
    if (section == null) return DEFAULT_RETURN_VALUE;
    
    log_trace("---- section:" + JSON.stringify(section)); 
    return section.name;
  }
}

AsanaAdapter.prototype.find = function(queryString) {
  log_trace('AsanaAdapter.find start');
  
  function appendTasks(issues, asanaTasks, allTags, estimateTagPrefix) {
    for(var index = 0; index < asanaTasks.length; index++) {
      var asanaTask = asanaTasks[index];
      log_trace("-- asanaTask:" + JSON.stringify(asanaTask));
      
      // sectionをスキップ
      if (asanaTask.resource_subtype === 'section') { log_trace('---- skip section'); continue; }
      
      var id = asanaTask["gid"];
      var name = asanaTask["name"];
      var created_at = asanaTask["created_at"];
      var completed_at = asanaTask["completed_at"];
      var point = getPoint(allTags, asanaTask['tags'], estimateTagPrefix);
      var milestone = '';

      var issue = new Issue(id, milestone, name, created_at, completed_at, point);
      issues.push(issue);
    }
  }
  
  function getPoint(allTags, issueTags, estimateTagPrefix) {
    for (var index = 0; index < issueTags.length; index++) {
      var issueTag = issueTags[index];
      var issueTagName = getTagName(allTags, issueTag.gid);
      
      log_trace("---- tagName:" + issueTagName + ", tag:" + JSON.stringify(issueTag));
      if (issueTagName === '') continue;
      if (issueTagName.substr(0, estimateTagPrefix.length) == estimateTagPrefix) {
        return issueTagName.substr(estimateTagPrefix.length, issueTagName.length);
      }
    }
    return '';
  }

  function getTagName(allTags, issueTagId) {
    for (var index = 0; index < allTags.length; index++) {
      var curAllTag = allTags[index];
      if (curAllTag.gid === issueTagId) return curAllTag.name;
    }
    return '';
  }



  var url = "https://app.asana.com/api/1.0/projects/" + this.projectId + 
    "/tasks?opt_fields=name,resource_type,resource_subtype,tags,created_at,completed_at&limit=100";
  if (queryString != null) url += '&' + queryString;

  var issues = [];
  while (true) {
    log_trace("request url:" + url); 
    var response = JSON.parse(UrlFetchApp.fetch(url, this.getGetParams()));
    var asanaTasks = response.data;
    var nextPage = response.next_page;
    appendTasks(issues, asanaTasks, this.tags, this.estimateTagPrefix);
    
    if (nextPage == null) break;
    url = nextPage.uri;
  }

  // TODO 非同期で実行したい
  for (var index = 0; index < issues.length; index++) {
    issues[index].milestone = this._getSection(issues[index].id);
  }

  log_trace('AsanaAdapter.find end');
  return issues;
}



//--------------------------------------------------------------------------------------------------
// test
//--------------------------------------------------------------------------------------------------
function test_AsanaAdapter() {
  LOG_LEVEL = LOG_LEVEL_DEBUG;

  var token = UserProperties.getProperty('AsanaToken');
  var workspace = 'sample';
  var project = 'Backlog';
  var estimateTagPrefix = '+';

  try {
    new AsanaAdapter();
    throw new Error('fail');
  } catch(e) { log_debug('error message:' + e); }

  try {
    new AsanaAdapter(token);
    throw new Error('fail');
  } catch(e) { log_debug('error message:' + e); }

  try {
    new AsanaAdapter(token, workspace);
    throw new Error('fail');
  } catch(e) { log_debug('error message:' + e); }

  try {
    new AsanaAdapter(token, workspace, project);
    throw new Error('fail');
  } catch(e) { log_debug('error message:' + e); }

  var adapter = new AsanaAdapter(token, workspace, project, estimateTagPrefix);
  var queryString = 'modified_since=9999-01-01T00:00:00Z';
  
  log_debug('find() issues.length:'                    + adapter.find().length);
  log_debug('find(' + queryString + ') issues.length:' + adapter.find(queryString).length);
}