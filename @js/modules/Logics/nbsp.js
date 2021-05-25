"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nbsp2plus = void 0;
const nbsp2plus = (query) => {
    for (let i = 0; i < query.length; i++) {
        query = query.replace(' ', '+');
    }
    return query;
};
exports.nbsp2plus = nbsp2plus;
