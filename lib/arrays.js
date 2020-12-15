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
 * There's no Array.prototype.containsKey()
 * Use  array[key] !== undefined  instead
 */

/**
 * Adds or remove an element to an array.
 *
 * @param  a element to toogle
 */
Array.prototype.toggle = function(a) {
    var b = this.indexOf(a);
    -1 === b ? this.push(a) : this.splice(b, 1); // jshint ignore: line
};

/**
 * Iintersects to arrays.
 * It DOESN'T modifies the original one.
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
 * Excludes the elements on b array from current array.
 * It modifies the original one
 * 
 * @param {Array} b 
 */
Array.prototype.exclude = function(b) {
    var a, c, len = this.length;
    for (a = 0;a < len;a++) {
        c = b.indexOf(this[a]), -1 !== c && b.splice(c, 1); // jshint ignore: line
    }
    return b;
};

/**
 * Extends the current array with the content of the one passed as param.
 */
Array.prototype.union = function(a) {
    for (var b in a) {
        a.hasOwnProperty(b) && (this[b] = a[b]); // jshint ignore: line
    }
    return this;
};

/**
 * Adds an element to the array only if it's not already on it.
 *
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
Array.prototype.pushUnique = function (element) {
    if(!this.contains(element)) {
        this.push(element);
    }
};
