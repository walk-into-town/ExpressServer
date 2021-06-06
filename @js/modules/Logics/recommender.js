"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommend = void 0;
const Sorter_1 = require("./Sorter");
let weight = {
    five: 0.9,
    four: 0.7,
    three: 0.5,
    two: 0.3,
    one: 0.1
};
let recommend = function (camps) {
    for (let camp of camps) {
        let length = camp.comments.length;
        let five = 0, four = 0, three = 0, two = 0, one = 0;
        let fiveRatio = 0, fourRatio = 0, threeRatio = 0, twoRatio = 0, oneRatio = 0;
        if (length == 0) {
            camp.score = 0;
            continue;
        }
        for (let comment of camp.comments) {
            if (comment.rated == '5') {
                five += 1;
                continue;
            }
            if (comment.rated == '4') {
                four += 1;
                continue;
            }
            if (comment.rated == '3') {
                three += 1;
                continue;
            }
            if (comment.rated == '2') {
                two += 1;
                continue;
            }
            if (comment.rated == '1') {
                one += 1;
                continue;
            }
        }
        fiveRatio = five / length;
        fourRatio = four / length;
        threeRatio = three / length;
        twoRatio = two / length;
        oneRatio = one / length;
        let score = fiveRatio * weight.five + fourRatio * weight.four + threeRatio * weight.three + twoRatio * weight.two + oneRatio * weight.one;
        camp.score = score;
    }
    camps.sort(Sorter_1.recommendSort);
    while (true) {
        if (camps[camps.length - 1].score == 0) {
            camps.pop();
        }
        else {
            break;
        }
    }
    for (const camp of camps) {
        delete camp.score;
    }
    let pos = 10;
    camps = camps.splice(0, pos);
    return camps;
};
exports.recommend = recommend;
