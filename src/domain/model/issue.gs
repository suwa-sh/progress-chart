/*
 * Issue
 */
var Issue = function(id, milestone, title, created_at, closed_at, point) {
  this.id = id;
  this.milestone = milestone;
  this.title = title;
  this.created_at = created_at;
  this.closed_at = closed_at;
  this.point = point;
}

Issue.prototype.toString = function() {
  return JSON.stringify(this);
}
