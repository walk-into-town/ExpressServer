export =  async function quickSort (array: Array<any>, left: number = 0, right: number = array.length - 1) {
    if (left >= right) {
      return array;
    }
    const mid = Math.floor((left + right) / 2);
    const pivot = array[mid].name;
    const partition = divide(array, left, right, pivot);
    quickSort(array, left, partition - 1);
    quickSort(array, partition, right);
    function divide (array: Array<any>, left: number, right: number, pivot: String) {
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
  }