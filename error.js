"use strict";

var error_type = "";
var error_msg = "";
exports.errors = {
    DB_ERROR : "DB_ERROR",
    PLACEHOLDER_ERROR : "PLACEHOLDER_ERROR"
};

exports.setErrorType = function(type, msg){
    error_type = type;
    error_msg = msg;
    try {
        throw new Error(error_type + ': ' + error_msg);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
