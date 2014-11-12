/**
 * Override native indexOf with a faster one
 * 
 * @param  {Array} element to search for
 * @return {Number}  the ordinal of the element or -1 if not found
 */
Array.prototype.indexOf = function (v) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i] === v) {
            return i;
        }
    }
    return -1;
};

Array.prototype.contains = function (needle) {
    return this.indexOf(needle) > -1;
};

/**
 * there's no Array.prototype.containsKey()
 * use  array[key] !== undefined  instead
 */

/**
 * intersects to arrays.
 * it DON'T modifies the original one
 * 
 * @param {Array} c the array to intersect with the calling one
 */
Array.prototype.intersect = function(c) {
  var d = [], a, b, len = this.length, len2 = c.length;
  for (a = 0;a < len;a++) {
    for (b = 0;b < len2;b++) {
      if (this[a] === c[b]) {
        d.push(a);
        break;
      }
    }
  }
  return d;
};

/**
 * excludes the elements on b array from current array.
 * it modifies the original one
 * 
 * @param {Array} b 
 */
Array.prototype.exclude = function(b) {
  var a, c, len = this.length;
  for (a = 0;a < len;a++) {
    c = b.indexOf(this[a]), -1 !== c && b.splice(c, 1);
  }
  return b;
};

/**
 * extends the current array with the content of the one passed as param
 */
Array.prototype.union = function(a) {
  for (var b in a) {
    a.hasOwnProperty(b) && (this[b] = a[b]);
  }
  return this;
};

/**
 * Overrides and extend native forEach function.
 * This version is about 80% faster in iOS 7 and 100% faster in Chrome
 *
 *
 * The invoked function will receive the element of the array and 
 * the index of the item plus the array itself.
 *
 * You can break from the function by returning false on your function.
 */
Array.prototype.forEach = function (someFn) {
    for (var i = 0, len = this.length; i < len; i++) {
        if(someFn(this[i], i, this) === false) {
            break;
        }
    }
};