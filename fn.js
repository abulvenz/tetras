var optional = value => {
  var isPresent = () => !!value;
  var map = fn => (isPresent() ? optional(fn(value)) : optional(null));
  var ifPresent = fn => (isPresent() ? fn(value) : null);
  return {
    isPresent,
    map,
    ifPresent
  };
};

var plus = (a, b) => a + b;

var range = (startInclusive, endExclusive) => {
  let result = [];
  for (let i = startInclusive; i < endExclusive; i++) {
    result.push(i);
  }
  return result;
};

var nFrom = (start, number) => {
  return range(start, start + number);
};

var interval = (startInclusive, endInclusive) => {
  return range(startInclusive, endInclusive + 1);
};

var zipWith = (fn, ...arrs) => {
  arguments.l;
  return range(0, Math.min(...arrs.map(arr => arr.length))).map(i =>
    fn(...arrs.map(arr => arr[i]))
  );
};

var tail = arr => {
  return arr[arr.length - 1];
};

var head = arr => {
  return arr[0];
};

var isEmpty = arr => {
  return arr.length === 0;
};

var withoutLast = (arr = []) => {
  return arr.length > 1 ? arr.slice(0, arr.length - 1) : [];
};

var flatten = (arr, depth = 100) => {
  var merged = [];
  for (let step = 0; step < depth; step++) {
    if (merged.length === 0) {
      merged = arr.slice(0);
    }
    let l1 = merged.length;
    merged = [].concat.apply([], merged);
    let l2 = merged.length;
    if (l1 === l2) break;
  }
  return merged;
};

var foldLeft = (arr, start, fn) => {
  return arr.reduce(fn, start);
};
var foldRight = (arr, start, fn) => {
  return arr.reverse().reduce(fn, start);
};

var and = (acc, curr) => acc && curr;
var not = fn => !fn;

var id = n => n;
var succ = n => n + 1;
var pred = n => n - 1;

var directions = [id, succ, pred];

const contains = (arr, e) => {
  return arr.indexOf(e) >= 0;
};

const without = (arr1, arr2) => {
  return arr1.filter(e => !contains(arr2, e));
};

const unique = arr => {
  let r = [];
  arr.forEach(e => (!contains(r, e) ? r.push(e) : 0));
  return r;
};

const reverse = arr =>
  range(0, arr.length)
    .map(i => arr.length - 1 - i)
    .map(i => arr[i]);

export default {
  flatten,
  foldLeft,
  foldRight,
  and,
  withoutLast,
  head,
  tail,
  nFrom,
  range,
  interval,
  optional,
  plus,
  id,
  succ,
  pred,
  zipWith,
  not,
  isEmpty,
  contains,
  without,
  unique,
  reverse
};
