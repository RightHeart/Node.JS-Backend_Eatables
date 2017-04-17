var schedule = require('node-schedule');
var dbHandler = require('../db/dbHandler');

function prepare_data(data) {
    for (var i = 0; i < data.length; i++) {
        var product = data[i];
        console.log(product);
    }
}

var job = schedule.scheduleJob('*/5 * * * * *', function () {
    let current_time = new Date().getHours().toString();
    current_time = current_time.length > 1 ? current_time : "0" + current_time;
    let send_time = current_time + ":00";
    dbHandler.getProductSubscribeByTime(send_time, function (data) {
        if (data.status) {
            let products = data.data;
            prepare_data(products);
        }
    });
});