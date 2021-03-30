"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Report_1 = require("../../models/@js/Report");
const Report_2 = require("../../models/@js/Report");
let report = new Report_1.Report();
report.type = Report_2.Type.Campaign;
console.log(report.type);
