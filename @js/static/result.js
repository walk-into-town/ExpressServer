"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.fail = exports.success = void 0;
exports.success = {
    result: 'success',
    data: null
};
exports.fail = {
    result: 'failed',
    error: '',
    errdesc: null
};
exports.error = {
    dbError: 'DB Error. Please Contect Manager',
    invalKey: 'Invliad Key Values',
    invalReq: 'Invalid Request Values',
    dataNotFound: 'Can not find data from DB',
    typeMiss: 'Type Mismatch',
    invalAcc: 'Invalid Access'
};
