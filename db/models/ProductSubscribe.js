var mongoose = require('../dbConnect');
var Schema = mongoose.Schema;

var productSubscribeSchema = new Schema({
    product_id: String,
    user_id: String,
    amount: String,
    subscribe_time: String,
    subscribe_date: Date
});

var ProductSubscribe = mongoose.model('ProductSubscribe', productSubscribeSchema, 'ProductSubscribes');

module.exports = ProductSubscribe;