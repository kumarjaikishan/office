const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true },
  modules: { type: Object, required: true }, // stores dynamic module keys
});

module.exports = mongoose.model("Permission", permissionSchema);
