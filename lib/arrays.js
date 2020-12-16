/**
 * Adds or remove an element to an array.
 *
 * @param  a element to toogle
 */
Array.prototype.toggle = function (a) {
    const b = this.indexOf(a);

    -1 === b ? this.push(a) : this.splice(b, 1); // jshint ignore: line
};

/**
 * Adds an element to the array only if it's not already on it.
 *
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
Array.prototype.pushUnique = function (element) {
    if (!this.includes(element)) {
        this.push(element);
    }
};
