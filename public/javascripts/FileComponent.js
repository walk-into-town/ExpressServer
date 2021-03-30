"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.getFileLink = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const aws_cloudfront_sign_1 = __importDefault(require("aws-cloudfront-sign"));
const fs_1 = __importDefault(require("fs"));
let dotenv = require('dotenv');
dotenv.config();
function getFileLink(filename) {
    return new Promise(function (resolve, reject) {
        let options = {
            keypairId: process.env.AWS_CLOUDFRONT_KETID,
            privatekeyPath: process.env.AWS_CLOUDFRONT_SECRETKEY
        };
        let signedUrl = aws_cloudfront_sign_1.default.getSignedUrl(process.env.CLOUDFRONT_URL + filename, options);
        resolve(signedUrl);
    });
}
exports.getFileLink = getFileLink;
function uploadFile(filename, fileDirectoryPath) {
    aws_sdk_1.default.config.update({
        accessKeyId: process.env.AWS_S3_KEYID,
        secretAccessKey: process.env.AWS_S3_SECRETKEY
    });
    const s3 = new aws_sdk_1.default.S3();
    return new Promise(function (resolve, reject) {
        fs_1.default.readFile(fileDirectoryPath.toString(), function (err, data) {
            if (err) {
                reject(err);
            }
            s3.putObject({
                Bucket: '' + process.env.AWS_S3_BUCKET_NAME,
                Key: filename,
                Body: data,
                ACL: 'public-read'
            }, function (err, data) {
                if (err)
                    reject(err);
                resolve("succesfully uploaded");
            });
        });
    });
}
exports.uploadFile = uploadFile;
