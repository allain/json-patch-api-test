var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PatchSchema = new Schema({
  ts: { type: Number },
  diff: { type: [Schema.Types.Mixed] },
  snapshotId: { type: Schema.Types.Objectid }
});

var Patch = mongoose.model('Patch', PatchSchema);

module.exports = Patch;
