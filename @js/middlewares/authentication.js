"use strict";
module.exports = function (req, res, next) {
    console.log('called');
    if (req.isAuthenticated() == true) {
        next();
    }
    let result = {
        result: 'failed',
        error: '먼저 로그인 해주세요'
    };
    res.status(400).send(result);
    return;
};
