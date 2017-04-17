var crypto = require('crypto');
var https = require('https');
var dbHandler = require('../db/dbHandler');
var AWS = require('aws-sdk');

module.exports.getCountries = function (req, res) {
    let query = {
        is_active: true
    };
    dbHandler.getAllCountries(query, function (data) {
        res.json(data);
    });
}

module.exports.getLanguages = function (req, res) {
    let query = {
        is_active: true
    };
    dbHandler.getAllLanguages(query, function (data) {
        res.json(data);
    });
}

module.exports.getSlideImages = function (req, res) {
    dbHandler.getAllSlideImages(function (data) {
        res.json(data);
    });
}

module.exports.getProducts = function (req, res) {
    let query = {
        is_active: true
    };
    dbHandler.getAllProducts(query, function (data) {
        res.json(data);
    });
}

module.exports.getProductDetail = function (req, res) {
    let product_id = req.params.product_id;
    let country_id = req.params.country_id;
    let data = {
        product_id: product_id,
        country_id: country_id
    }
    dbHandler.getProductDetail(data, function (data) {
        res.json(data);
    });
}

module.exports.getLocalization = function (req, res) {
    let lang_id = req.params.language_id;
    let data = {
        lang_id: lang_id
    }
    dbHandler.getLocalization(data, function (data) {
        res.json(data);
    });
}

module.exports.mobileVerification = function (req, res) {
    let mobile_number = req.params.mobile_number;
    let pin_number = Math.floor(Math.random() * 100000);
    let send_data = {
        mobile_number: mobile_number,
        pin_number: pin_number
    };

    AWS.config.region = 'eu-west-1';
    // AWS.config.accessKeyId = 'AKIAI6SFIPTRNWNDEU3Q';
    // AWS.config.secretAccessKey = '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';

    AWS.config.accessKeyId = 'AKIAJZXNH32DKXAAEZJQ';
    AWS.config.secretAccessKey = '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';

    var sns = new AWS.SNS();

    sns.setSMSAttributes({
        attributes: {
            DefaultSenderID: 'eatables',
            DefaultSMSType: 'Transactional'
        }
    });

    let message = 'Your activation code for Djoli Djolilo is ' + pin_number.toString();
    var params = {
        MessageAttributes: {
            PhoneNumber: {
                DataType: 'String',
                StringValue: 'String'
            }
        },
        MessageStructure: 'String',
        Message: message.toString(),
        PhoneNumber: mobile_number.toString()
    };

    sns.publish(params, function (err, data) {
        if (err) {
            res.json({
                status: 0,
                message: "Something went wrong. Please try again later.",
                error: err.message
            });
        } else {
            dbHandler.saveMobileVerificationPin(send_data, function (rdata) {
                res.json(rdata);
            });
        }
    });
}

module.exports.registerMobileUser = function (req, res) {
    let mobile_number = req.params.mobile_number;
    let pin_number = req.params.pin_number;
    let data = {
        mobile_number: mobile_number,
        pin_number: pin_number
    };
    dbHandler.checkForMobileUser(data, function (data) {
        if (data.status) {
            let user_token = crypto.randomBytes(Math.ceil(48 / 2)).toString('hex').slice(0, 48);
            let data = {
                mobile_number: mobile_number,
                user_token: user_token,
                pin_number: pin_number,
                created_at: new Date()
            };
            dbHandler.addMobileUser(data, function (data) {
                res.json(data);
            });
        } else {
            res.json({
                "status": 0,
                "message": "Invalid mobile number or pin"
            });
        }
    });
}

module.exports.checkMobileUserExists = function (req, res) {
    let user_token = req.params.user_token;
    let data = {
        user_token: user_token,
    };
    dbHandler.checkMobileUserExists(data, function (data) {
        res.json(data);
    });
}

module.exports.getConfig = function (req, res) {
    dbHandler.getAllConfig(function (data) {
        if (data.status) {
            let config = data.data;
            let json_config = {};
            json_config['status'] = 1;
            for (var i = 0; i < config.length; i++) {
                var con = config[i];
                json_config[con.item] = con.cvalue;
            }
            res.json(json_config);
        } else {
            res.json(data);
        }
    });
}

// Notification control

module.exports.addProductSubscribe = function (req, res) {
    let product_id = req.body.product_id;
    let user_id = req.body.user_id;
    let option = req.body.option;

    if (option == 'subscribe') {
        let subscribe_time = req.body.subscribe_time;
        let amount = req.body.amount;
        let subscribe_date = new Date();

        let psub_data = {
            product_id: product_id,
            user_id: user_id,
            subscribe_time: subscribe_time,
            amount: amount,
            subscribe_date: subscribe_date
        }
        dbHandler.addProductSubscribe(psub_data, function (data) {
            res.json(data);
        });
    } else {
        let psub_data = {
            product_id: product_id,
            user_id: user_id
        }
        dbHandler.removeProductSubscribe(psub_data, function (data) {
            res.json(data);
        });
    }
}

module.exports.getProductSubscribeByUserId = function (req, res) {
    let user_id = req.params.user_id;
    dbHandler.getProductSubscribeByUserId(user_id, function (data) {
        res.json(data);
    });
}