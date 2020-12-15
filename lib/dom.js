/**
 * YA dom lib
 * A modern browsers DOM manipulation quick lib
 * Work in progress by ff@forcen.com
 */

(function () {
    'use strict';

    // constructor
	var domLib = function(strSelector, elementContext) {
            return new DOMLib(strSelector, elementContext || document);
        },

		DOMLib = function (strSelector, elementContext) {
            if(typeof strSelector === 'string' && strSelector) {
    			var objElements = elementContext.querySelectorAll(strSelector),
    				i = 0,
    				len = objElements.length;

    			for (; i < objElements.length; i++) {
    				this[i] = objElements[i];
    			}
                // 'this' is not an array, thus has no length method
    			this.length = objElements.length;
            } else if(strSelector instanceof Element) {
                this[0] = strSelector;
                this.length = 1;
            } else {
                // user will be check for length most of the time
                this.length = 0;
            }
		};

	domLib.fn = DOMLib.prototype = {
		each: function (someFn) {
		    for (var i = 0, len = this.length; i < len; i++) {
                if(someFn(this[i], i, this) === false) {
                    break;
                }
		    }
		},

        first: function() { return this[0]; },

    	last: function() { return this.length > 0 ? this[this.length - 1] : null; },

        find: function (strSelector) {
            if(this[0]) {
                var objElements = this[0].querySelectorAll(strSelector),
                    i = 0,
                    len = objElements.length;

                for (; i < objElements.length; i++) {
                    this[i] = objElements[i];
                }
                this.length = objElements.length;
            }
            return this;
        },

        /**
         * UNTESTED
         * @param  {[type]} strSelector [description]
         * @return {[type]}             [description]
         */
        parent: function (strSelector) {
            var element = this[0].parentNode,
                collectionHas = function (a, b) {
                                    for(var i = 0, len = a.length; i < len; i ++) {
                                        if(a[i] == b) return true;
                                    }
                                    return false;
                                },
                all = document.querySelectorAll(strSelector);

            while(element && !collectionHas(all, element)) {
                element = element.parentNode;
            }
            return element;
        },

    	empty: function () {
    		this.each(function (element) {
    			if(element.innerHTML) {
    				element.innerHTML = '';
    			} else if(element.contentText) {
                    element.contentText = '';
                }
    		});
    		return this;
    	},

    	append: function (elemToAppend) {
            // analize objContent to determine if it's an Element,
            if(elemToAppend instanceof Element) {
                this.each(function (element) {
                    element.appendChild(elemToAppend);
                });
            }
            return this;
    	},

    	before: function (objContent) {
            if(elemToAppend instanceof Element) {
                this.each(function (element) {
                    element.parentNode.insertBefore(objContent);
                });
            }
            return this;
    	},

    	remove: function () {
    		this.each(function (element) {
    			element.parentNode.removeChild(element);
    		});
    		return this;
    	},

    	/**
    	 * Set/gets named attribute.
         *
    	 * @param  attrName the name of the attribute to get/set
    	 * @param  value    optional value to set the attribute to
    	 * @return the value of the named attribute if !value or this otherwise
    	 */
    	attr: function (attrName, value) {
    		if(strAttrName) {	// setter
	    		this.each(function (element) {
    				element.setAttribute(attrName, value);
    			});
    			return this;
    		} else {			// getter
    			return this[0] && this[0].getAttribute ? this[0].getAttribute(strName) : '';
    		}
    	},

        /**
         * Set/get value using data API.
         * 
         * @param  {String} strName Index of the data
         * @param  {Any} value   Optional value
         * @return {Any}         this if setting, the value if getting
         */
    	data: function (strName, value) {
    		var data;

    		if(value !== undefined) {
                this.each(function (element) {
                    element.dataset[strName] = value;
                });
	    		return this;
    		} else {
                return this[0] ? this[0].dataset[strName] : undefined;
    		}
    	},

    	val: function (value) {
    		if(value !== undefined) {
                this.each(function (element) {
                    switch(element.type) {
                        case 'checkbox':
                            element.checked = value;
                            break;
                        default:
                            element.value = value;
                            break;
                    }
                });
    			return this;
    		} else {
                if(this[0]) {
                    switch(this[0].type) {
                        case 'checkbox':
                            value = this[0].checked;
                            break;
                        default:
                            value = this[0].value;
                            break;
                    }
                }
                return value;
    		}
    	},

        getText: function () {
            var element = this[0] || {},
                nodeType = element.nodeType;

            if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                if (typeof element.textContent === "string") {
                    return element.textContent;
                }
            } else if (nodeType === 3 || nodeType === 4) {
                return element.nodeValue;
            }
        },

        /**
         * Sets the text content for the current selection
         */
        setText: function (strContent) {
            this.each(function (element) {
                var nodeType = element.nodeType;

                // @todo check that the content is safe
                if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                    element.textContent = strContent;
                } else if (nodeType === 3 || nodeType === 4) {
                    element.nodeValue = strContent;
                }
            });
            return this;
        },

    	/**
         * WARNING: it only applies to the first element.
         *
         * @return {boolean}         this if setting, the value if getting
         */
    	hasClass: function (className) {
    		return this[0].classList.contains(className);
    	},

    	addClass: function (className) {
    		this.each(function (element) {
				element.classList.add(className);
    		});
    		return this;
    	},

    	removeClass: function (className) {
			this.each(function (element) {
				element.classList.remove(className);
    		});
    		return this;
    	},

    	show: function () {
			this.each(function (element) {
    			element.style.display = 'block';
    		});
    		return this;
    	},

    	hide: function () {
    		this.each(function (element) {
    			element.style.display = 'none';
    		});
    		return this;
    	}
    };

    // another way to extend the lib, method by method
    domLib.fn.on = function (strEvent, fn) {
    	var arrEvents = strEvent.split(' ');

    	this.each(function (element) {
    		arrEvents.forEach(function (eventName) {
    			element.addEventListener(eventName, fn);
    		});
		});
		return this;
    };

    // an alias
    domLib.fn.forEach = domLib.fn.each;

	// override any $
	window.$ = domLib;
}());
