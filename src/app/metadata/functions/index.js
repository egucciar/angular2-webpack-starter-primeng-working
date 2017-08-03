const registry = functionRegistry();

function functionRegistry() {
    const dictionary = {};

    function register(key, func, prefix) {
        dictionary[key] = func;
        // if a prefix is supplied make a second function , intial use case mocking
        if (prefix) {
            dictionary[prefix + key] = func;
        }
    }

    function get(key) {
        const func = dictionary[key];
        if (func) {
            return func;
        }
    }

    function remove(key) {
        if (dictionary[key]) {
            delete dictionary[key];
        }
    }

    return {
        register: register,
        get: get,
        remove: remove,
        dictionary: dictionary
    };
}

function invoke(functionName, ...args) {
    const [data] = args;

    if (functionName) {
        const func = registry.get(functionName);
        if (func) {
            return func(...args);
        }
    }
    return data;
}

// return for require
export { invoke };
export default registry;