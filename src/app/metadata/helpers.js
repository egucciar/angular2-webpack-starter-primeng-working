function get(o, path, defaultValue) {
    var props = path.split('.'),
        i,
        // iterative variable
        p,
        // current property
        success = true;

    for (i = 0; i < props.length; i += 1) {
        p = props[i];
        if (has(o, p)) {
            o = o[p];
        } else {
            success = false;
            break;
        }
    }

    return success ? o : defaultValue;
}

function has(object) {
    // The intent of this method is to replace unsafe tests relying on type
    // coercion for optional arguments or obj properties:
    // | function on(event,options){
    // |   options = options || {}; // type coercion
    // |   if (!event || !event.data || !event.data.value){
    // |     // unsafe due to type coercion: all falsy values '', false, 0
    // |     // are discarded, not just null and undefined
    // |     return;
    // |   }
    // |   // ...
    // | }
    // with a safer test without type coercion:
    // | function on(event,options){
    // |   options = has(options)? options : {}; // no type coercion
    // |   if (!has(event,'data','value'){
    // |     // safe check: only null/undefined values are rejected;
    // |     return;
    // |   }
    // |   // ...
    // | }
    //
    // Returns:
    //   * false if no argument is provided or if the obj is null or
    //     undefined, whatever the number of arguments
    //   * true if the full chain of nested properties is found in the obj
    //     and the corresponding value is neither null nor undefined
    //   * false otherwise

    var i,
        // iterative variable
        length,
        o = object,
        property;

    if (!is(o)) {
        return false;
    }

    for (i = 1, length = arguments.length; i < length; i += 1) {
        property = arguments[i];
        o = o[property];
        if (!is(o)) {
            return false;
        }
    }

    return true;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };


function is(value) {
    // If more than two arguments are provided, the value is considered to be
    // nested within a chain of properties starting with the first argument:
    // | is(object,'parent','child','leaf','boolean')
    // will check whether the property object.parent.child.leaf exists and is
    // a boolean.
    //
    // The intent of this method is to replace unsafe guard conditions that
    // rely on type coercion:
    // | if (object && object.parent && object.parent.child) {
    // |   // Issue: all falsy values are treated like null and undefined:
    // |   // '', 0, false...
    // | }
    // with a safer check in a single call:
    // | if ( is(object,'parent','child','number') ) {
    // |   // only null and undefined values are rejected
    // |   // and the type expected (here 'number') is explicit
    // | }
    //
    // Returns:
    //   * false, if no argument is provided
    //   * false, if a single argument is provided which is null or undefined
    //   * true, if a single argument is provided, which is not null/undefined
    //   * if the type argument is a non-empty string, it is compared with the
    //     internal class of the value, put in lower case
    //   * if the type argument is a function, the instanceof operator is used
    //     to check if the value is considered an instance of the function
    //   * otherwise, the value is compared with the provided type using the
    //     strict equality operator ===
    //
    // Notes:
    // This method retrieves the internal class of the provided value using
    // | Object.prototype.toString.call(value).slice(8, -1)
    // The class is then converted to lower case.
    //
    // See "The Class of an Object" section in the JavaScript Garden for
    // more details on the internal class:
    // http://bonsaiden.github.com/JavaScript-Garden/#types.typeof
    //
    // The internal class is only guaranteed to be the same in all browsers for
    // Core JavaScript classes defined in ECMAScript. It differs for classes
    // part of the Browser Object Model (BOM) and Document Object Model (DOM):
    // window, document, DOM nodes:
    //
    //   window        - 'Object' (IE), 'Window' (Firefox,Opera),
    //                   'global' (Chrome), 'DOMWindow' (Safari)
    //   document      - 'Object' (IE),
    //                   'HTMLDocument' (Firefox,Chrome,Safari,Opera)
    //   document.body - 'Object' (IE),
    //                   'HTMLBodyElement' (Firefox,Chrome,Safari,Opera)
    //   document.createElement('div') - 'Object' (IE)
    //                   'HTMLDivElement' (Firefox,Chrome,Safari,Opera)
    //   document.createComment('') - 'Object' (IE),
    //                   'Comment' (Firefox,Chrome,Safari,Opera)

    // do not trust global undefined, which may be overridden
    var undef = void 0,
        i,
        // iterative variable
        length = arguments.length,
        last = length - 1,
        type,
        typeOfType,
        internalClass,
        v = value;

    if (length === 0) {
        return false; // no argument
    }

    if (length === 1) {
        return value !== null && value !== undef;
    }

    if (length > 2) {
        for (i = 0; i < last - 1; i += 1) {
            if (!is(v)) {
                return false;
            }
            v = v[arguments[i + 1]];
        }
    }

    type = arguments[last];
    if (v === null) {
        return type === null || type === 'null';
    }
    if (v === undef) {
        return type === undef || type === 'undefined';
    }
    if (type === '') {
        return v === type;
    }

    typeOfType = typeof type === 'undefined' ? 'undefined' : _typeof(type);
    if (typeOfType === 'string') {
        internalClass = Object.prototype.toString.call(v).slice(8, -1).toLowerCase();
        return internalClass === type;
    }

    if (typeOfType === 'function') {
        return v instanceof type;
    }

    return v === type;
}

export {
    get,
    has,
    is
}