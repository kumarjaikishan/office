const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // more generic
permission:[{
    permission_name:String,
    permission_value:[Number]
}]
});

module.exports = mongoose.model('Permission', permissionSchema);
