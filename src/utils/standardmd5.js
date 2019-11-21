//import md5 from "js-md5";
import md5 from './md5ForZy';

function wordSet(a, b) {
  var str = '0abcdefghijklmnopqrstuvwxyz';
  var i = 0;
  var flage = true;
  var res = false;
  while (flage) {
    if (str.indexOf(a[i]) > str.indexOf(b[i])) {
      res = true;
      flage = false;
    } else if (str.indexOf(a[i]) === str.indexOf(b[i])) {
      i++;
      if (!a[i]) {
        res = false;
        flage = false;
      }
      if (!b[i]) {
        res = true;
        flage = false;
      }
    } else {
      res = false;
      flage = false;
    }
  }
  return res;
}

function bubbleSort(arr) {
  var len = arr.length;
  for (var i = 0; i < len; i++) {
    for (var j = 0; j < len - 1 - i; j++) {
      if (wordSet(arr[j], arr[j + 1])) {
        var temp = arr[j + 1];
        arr[j + 1] = arr[j];
        arr[j] = temp;
      }
    }
  }
  return arr;
}

function aTOA(str) {
  var str1 = '0123456789abcdefghijklmnopqrstuvwxyz';
  var str2 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var str3 = str.split('');
  str3.forEach(function(v, k) {
    str3[k] = str2[str1.indexOf(v)];
  });
  return str3.join('');
}

function ensign(data) {
  var karr = bubbleSort(Object.keys(data));
  karr.forEach(function(v, k) {
    if (data[v] || data[v] === 0) {
      karr[k] = v + data[v];
    }
  });
  // console.log('======================================');
  // console.log(karr.join('') + 'secret5b0a5a5ab0dc8f38381990870e309e75');
  // console.log('======================================');
  // console.log(md5(karr.join('') + 'secret5b0a5a5ab0dc8f38381990870e309e75'));
  // console.log('======================================');
  // console.log(aTOA(md5(karr.join('') + 'secret5b0a5a5ab0dc8f38381990870e309e75')));
  // console.log('======================================');
  data.sign = aTOA(md5(karr.join('') + 'secret5b0a5a5ab0dc8f38381990870e309e75'));
  return data;
}

export default ensign;
