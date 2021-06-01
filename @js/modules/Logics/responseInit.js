"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.failInit = exports.successInit = void 0;
let successInit = function (success) {
    success.data = null;
};
exports.successInit = successInit;
let failInit = function (fail) {
    fail.error = null;
    fail.errdesc = null;
};
exports.failInit = failInit;
