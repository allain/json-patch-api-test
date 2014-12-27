var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PatchSchema = new Schema({
  ts: { type: Number },
  diff: { type: [Schema.Types.Mixed] },
  name: String
});

var Patch = mongoose.model('Patch', PatchSchema);

module.exports = Patch;
