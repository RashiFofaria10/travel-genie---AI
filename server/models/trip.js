const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
{
destination: {
type: String,
required: true,
trim: true,
},
country: {
type: String,
default: "",
trim: true,
},
startDate: {
type: Date,
required: true,
},
endDate: {
type: Date,
required: true,
},
budget: {
type: Number,
required: true,
min: 0,
},
image: {
type: String,
default: "",
},
notes: {
type: String,
default: "",
},
},
{ timestamps: true }
);

module.exports =
mongoose.models.Trip || mongoose.model("Trip", tripSchema);