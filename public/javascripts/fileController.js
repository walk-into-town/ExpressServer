"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.download = void 0;
const FileComponent_1 = require("./FileComponent");
function download(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield FileComponent_1.getFileLink(req.query.filename);
        res.send(response);
        res.end();
    });
}
exports.download = download;
function upload(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield FileComponent_1.uploadFile(req.file.originalname, req.file.path);
        console.log(response);
        res.send(response);
        res.end();
    });
}
exports.upload = upload;
