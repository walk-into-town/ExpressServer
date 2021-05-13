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
module.exports = function quickSort(array, left = 0, right = array.length - 1) {
    return __awaiter(this, void 0, void 0, function* () {
        if (left >= right) {
            return array;
        }
        const mid = Math.floor((left + right) / 2);
        const pivot = array[mid].name;
        const partition = divide(array, left, right, pivot);
        quickSort(array, left, partition - 1);
        quickSort(array, partition, right);
        function divide(array, left, right, pivot) {
            while (left <= right) {
                while (array[left].name < pivot) {
                    left++;
                }
                while (array[right].name > pivot) {
                    right--;
                }
                if (left <= right) {
                    let swap = array[left];
                    array[left] = array[right];
                    array[right] = swap;
                    left++;
                    right--;
                }
            }
            return left;
        }
        return array;
    });
};
