var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SnapshotSchema = new Schema({
  ts: { type: Number },
  doc: { type: Schema.Types.Mixed },
  name: String
});

var Snapshot = mongoose.model('Snapshot', SnapshotSchema);

module.exports = Snapshot;
