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
            if(typeof strSelector === 'string') {
    			var objElements = elementContext.querySelectorAll(strSelector),
    				i = 0,
    				len = objElements.length;

    			for (; i < objElements.length; i++) {
    				this[i] = objElements[i];
    			}
                // 'this' is not an array
    			this.length = objElements.length;
            } else if(strSelector instanceof Element) {
                this[0] = strSelector;
                this.length = 1;
            }
		};

	// attach prototype to .fn and start the party.
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

    	empty: function () {
    		this.each(function (element) {
    			if(element.innerHTML) {
    				element.innerHTML = null;
    			} else if(element.contentText) {
                    element.contentText = '';
                }
    		});
    		return this;
    	},

    	append: function (objContent) {
            // analize objContent to determine if it's a tag,
            this.each(function (element) {
                element.appendChild(objContent);
            });
            return this;
    	},

    	before: function (objContent) {
            this.each(function (element) {
                element.parentNode.insertBefore(objContent);
            });
            return this;
    	},

    	remove: function () {
    		this.each(function (element) {
    			element.parentNode.removeChild(element);
    		});
    		return this;
    	},

        siblings: function () {
        },

        parent: function (strSelector) {
            var element = this[0];

            while(element.parentNode) {
                //display, log or do what you want with element
                element = element.parentNode;
            }
            return element;
        },

    	/**
    	 * set/gets named attribute
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
         * uses data API
         * @param  {String} strName Index of the data
         * @param  {Any} value   Optional value
         * @return {Any}         this if setting, the value if getting
         */
    	data: function (strName, value) {
    		var data;

    		if(value) {

	    		return this;
    		} else {

    			return data;
    		}
    	},

    	val: function (value) {
    		if(value !== undefined) {
                this.each(function (element) {
                    element.value = value;
                });
    			return this;
    		} else {
    			return this[0] ? this[0].value : undefined;
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
         * sets the text content for the current selection
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

    	// WARNING: it only applies to the first element
    	// returns boolean
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

    domLib.fn.forEach = domLib.fn.each;

	// override any $
	window.$ = domLib;
}());
