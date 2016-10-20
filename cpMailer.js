"use strict";

/**
    Required packages
**/
var nodemailer = require('nodemailer'),
    config = require('./config/config'),
    bunyan = require('bunyan');
var err = require('./error');
var log = bunyan.createLogger({
    name: 'mailer',
    streams: [{
        path: config.logPath
    }]
});

var defaultConfig = {
    pool: true,
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'dandekar.atharva@gmail.com',
        pass: '*******'
    }
}
var emailConfig = "";
exports.setConfig = function(userEmailConfig) {
    emailConfig = userEmailConfig;
}

/**
    Export categories object.
**/
exports.categories = {
    REGISTER : "reg",
    LOGIN : "login",
    INFO: "info"
};

/*##################################################################################################################################################
    SAMPLE TEMPLATES
*/
/**
    registerTemplate
    placeholders : username , password
**/
var registerTemplate = {
    subject: 'Hello',
    text: 'Hello, {{username}}',
    html: '<b>Register template <br> Hello, <i>{{username}}</i> your password is {{password}} !</b>',
    from: 'dandekar.atharva@gmail.com'
};
/**
    loginTemplate
    placeholders : name , email
**/
var loginTemplate = {
    subject: 'Hello',
    text: 'Hello, {{name}}',
    html: '<b>Login template <br> Hello, <i>{{name}}</i> and your email is {{email}}</b>',
    from: 'dandekar.atharva@gmail.com'
};
/**
    infoTemplate
    placeholders : username , name , address , contact
**/
var infoTemplate = {
    subject: 'Info template',
    text: 'Hello {{username}}',
    html: 'Hello {{username}} <br> you have registered to the system and your credentials are <br> name : {{name}} <br> address : {{address}} <br> contact : {{contact}}',
    from: 'dandekar.atharva@gmail.com'
}
/*################################################################################################################################################################################

/**
    mapCategoryNameWithTemplate
    @description: map the category object key with its respective template object.
**/
var mapCategoryNameWithTemplate = {
    "reg": registerTemplate,
    "login": loginTemplate,
    "info": infoTemplate
};

/**
    @function: getWordsBetweenCurlies
    @param: string
    @description: get placeholders between {{ }}
**/
function getWordsBetweenCurlies(str) {
    var results = [], re = /{([^{}]+)}/g, text;
    while(text = re.exec(str)) {
        results.push(text[1]);
    }
    return results;
}

/**
    Export sendMail method
    @function: sendMail
    @param: category , recipient email , placeholders , callback function
    @description: validates placeholders and then sends email to given recipient and on error sends the response to callback function
**/
exports.sendMail = function(category , recipient, mailData, callback) {
    /**
        if user set his own email config then it is used
        else the default config is used
    **/
    emailConfig = (emailConfig) ? emailConfig : config.poolConfig;
    console.log(emailConfig);
    /**
        transporter
        @description: main object required for sending emails.
    **/
    var transporter = nodemailer.createTransport(emailConfig);

    /**
        categoryKey contains the given category template object
    **/
    var categoryKey = mapCategoryNameWithTemplate[category];
    var matchedPlaceholdersInText = getWordsBetweenCurlies(categoryKey.text);
    var matchedPlaceholdersInHtml = getWordsBetweenCurlies(categoryKey.html);
    /**
        totalPlaceholdersMatched contains all placeholders from matchedPlaceholdersInHtml and matchedPlaceholdersInText
    **/
    var totalPlaceholdersMatched = [];
    for (var i = 0; i < matchedPlaceholdersInText.length; i++) {
        totalPlaceholdersMatched[i] = matchedPlaceholdersInText[i];
    }
    for(var i = 0,j = totalPlaceholdersMatched.length; i < matchedPlaceholdersInHtml.length;i++,j++){
        totalPlaceholdersMatched[j] = matchedPlaceholdersInHtml[i];
    }
    /**
        uniquePlaceholders contains unique placeholders from totalPlaceholdersMatched
    **/
    var uniquePlaceholders = totalPlaceholdersMatched.filter(function(elem, index, self) {
        return index == self.indexOf(elem);
    });
    console.log(uniquePlaceholders);
    var keyNotFound = "";
    /**
        loop to make sure that only if all the placeholders in mailData are their in
        templates then only proceed to send mail
    **/
    for(var match in uniquePlaceholders){
        console.log('searching for : ' + uniquePlaceholders[match]);
        keyNotFound = uniquePlaceholders[match];
        var matched = false;
        for (var key in mailData) {
            console.log('matching with : ' + key);
            if(key == uniquePlaceholders[match]) {
                console.log('found : ' + uniquePlaceholders[match]);
                matched = true;
            }
        }
        if(!matched) {
            /**
                if the placeholders dont match with mailData keys throw an error
            **/
            err.setErrorType(err.errors.PLACEHOLDER_ERROR,'Placeholder ' + keyNotFound + ' not found in the mail data');
        }
    }
    /**
        template contains the function transporter.templateSender mapped to given category
    **/
    var template = transporter.templateSender(mapCategoryNameWithTemplate[category]);
    template({
        to: recipient
    },mailData,function(err, info){
        if(err){
            /**
                error sending email then call the callback function with error and success state
                and log the error in a file
            **/
            var info = {
                recipient: recipient,
                subject: categoryKey.subject,
                text: categoryKey.text,
                html: categoryKey.html
            };
            log.warn({info: info},"Email sending failed Incorrect email or password");
            callback(err, false);
        }else{
            callback(true);
        }
    });
};
