"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const S3Connection_1 = __importDefault(require("./S3Connection"));
const FileUpload_1 = __importDefault(require("./FileUpload"));
const multer = __importStar(require("multer"));
const mime_types_1 = __importDefault(require("mime-types"));
const crypto_random_string_1 = __importDefault(require("crypto-random-string"));
let multerS3 = require('multer-s3');
class UploadFile extends FileUpload_1.default {
    testupload() {
        var storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'uploads/');
            },
            filename: function (req, file, cb) {
                let ext = `.${mime_types_1.default.extension(file.mimetype)}`;
                let filename = crypto_random_string_1.default({ length: 40 });
                cb(null, filename + ext);
                file.filename = filename + ext;
            }
        });
        var upload = multer.default({ storage: storage });
        return upload;
    }
    uploadFile(src) {
        let getS3 = new S3Connection_1.default();
        let s3 = getS3.getS3(); //S3Connection클래스에서 S3 객체를 획득
        let storage = multerS3({
            s3: s3,
            bucket: src,
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: function (req, file, cb) {
                let ext = `.${mime_types_1.default.extension(file.mimetype)}`;
                let filename = crypto_random_string_1.default({ length: 40 });
                cb(null, filename + ext);
                file.filename = filename + ext; //라우터에 생성된 파일 명을 전달하기 위해서
            }
        });
        const upload = multer.default({
            storage: storage
        });
        return upload;
    }
}
exports.default = UploadFile;
