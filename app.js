var express = require('express'),
    config = require('./config/config'),
    glob = require('glob'),
    mongoose = require('mongoose');
var err = require('./error');
var db = mongoose.connection;
db.on('error', function () {
    err.setErrorType(err.errors.DB_ERROR,'could not connect to database at ' + config.db);
});
var models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});
var app = express();

require('./config/express')(app, config);

/**
    nodemailer package included in cpMailer file which is used to send emails
    and configuaration for nodemailer is defined in config file.
**/
var mail = require('./cpMailer');
var mailDataForInfoTemplate = {
    username: 'chaoticbit',
    name: 'Atharva Dandekar',
    addresds: '1 infinite loop, Cupertino, CA 95289',
    contact: '6503363299'
};
var poolConfigForEmail = {
    pool: true,
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'atharva.dandekar@codepandora.com',
        pass: '********'
    }
};
function mailCallback(err, success) {
    if (err) {
        console.log(err);
    }
    else {
        console.log('mail success : ' + success);
    }
}
mail.setConfig(poolConfigForEmail);
mail.sendMail(mail.categories.INFO, 'dandekar.atharva@gmail.com', mailDataForInfoTemplate, mailCallback);

app.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});
