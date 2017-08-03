import jsep from 'jsep';
import { dictionary } from './viewmodels/store';

function getIdentifiers(term) {
    // TODO: error checking for poorly formatted expressions
    try {
        var parseTree = jsep(term);
    } catch (ex) {
        console.warn('Left term is poorly formatted: ' + term);
        return [];
    }

    var ids = [];
    //console.log(parseTree);
    function collectIds(tree) {
        Object.keys(tree).forEach(function (key) {
            if (key === 'left' || key === 'right' || key === 'argument') {
                if (tree[key].type === 'Identifier') {
                    // check for uniqueness o f idntifier
                    if (ids.indexOf(tree[key].name) === -1) {
                        ids.push(tree[key].name);
                    }
                } else {
                    collectIds(tree[key]);
                }
            }
        });
    }

    collectIds(parseTree);
    return ids;
}

function internalEval(value) {
    return value === 'true' || value === true ? true :
        value === 'false' || value === false ? false :
            value === '' || value === null ? '""' :
                value === 'undefined' || value === undefined ? undefined :
                    isFinite(Number(value)) ? Number(value) :
                        typeof value === 'object' ? JSON.stringify(value) :
                            '"' + value + '"';
}

function evaluate(term, mapFunc, opts = {}) {
    var parseTree;
    try {
        parseTree = jsep(term);
    } catch (ex) {
        console.error('error evaluating expr: ' + term, ex);
        return '';
    }

    function expr(tree) {
        var returnVal,
            left,
            right,
            value,
            test,
            consequent,
            alternate;

        switch (tree.type) {
            case 'BinaryExpression':
                left = expr(tree.left);
                right = expr(tree.right);
                left = internalEval(left);
                right = internalEval(right);;
                tree.left.value = left;
                tree.right.value = right;

                try {
                    returnVal = eval(left + ' ' + tree.operator + ' ' + right);
                } catch (ex) {
                    console.error('error parsing expr:', parseTree, ex);
                    return '';
                }
                return returnVal;
            case 'UnaryExpression':
                value = expr(tree.argument);

                value = internalEval(value);

                tree.argument.value = value;

                try {
                    returnVal = eval(tree.operator + tree.argument.value);
                } catch (ex) {
                    console.error('error parsing expr:', parseTree, ex);
                    return '';
                }
                return returnVal;
            case 'LogicalExpression':
                left = expr(tree.left);
                left = internalEval(left);
                tree.left.value = left;

                if ((tree.operator === '&&' && !left) || (tree.operator === '||' && left)) { //short-circuit
                    returnVal = left;
                    tree.left.value = left;
                } else {
                    right = expr(tree.right);
                    right = internalEval(right);
                    tree.right.value = right;

                    try {
                        returnVal = eval(left + tree.operator + right);
                    } catch (ex) {
                        console.error('There was an error when parsing expression', parseTree, ex);
                        return '';
                    }
                }
                return returnVal;
            case 'Identifier':
                // todo: Possibly replace with .toJS for mobx obs
                if (tree.name === 'store') {
                    returnVal = dictionary;
                } else {
                    returnVal = mapFunc(tree.name);
                }
                return returnVal;
            case 'Literal':
                returnVal = tree.value;
                return returnVal;
            case 'MemberExpression':
                tree.object = expr(tree.object);
                // unwrap is used as an object may have observable values..?
                if (tree.property.type == 'Identifier') {
                    tree.property.value = tree.property.name;
                } else {
                    tree.property.value = expr(tree.property);
                }
                // todo: Possibly replace with .toJS for mobx obs
                if (tree.object === dictionary) {
                    returnVal = dictionary.get(tree.property.value);
                } else {
                    returnVal = (tree.object || {})[tree.property.value];
                }
                return returnVal;
            case 'CallExpression':
                returnVal = '';
                var callee = expr(tree.callee);
                tree.arguments = tree.arguments.map(function (arg) {
                    return expr(arg);
                });
                if (callee instanceof Function) {
                    returnVal = callee.apply(tree.callee.object, tree.arguments);
                }
                return returnVal;
            case 'ArrayExpression':
                returnVal = tree.elements.map(function (arg) {
                    return expr(arg);
                });
                return returnVal;
            case 'ConditionalExpression':
                test = expr(tree.test);
                if (test) {
                    returnVal = expr(tree.consequent);
                } else {
                    returnVal = expr(tree.alternate);
                }
                return returnVal;
            default:
                return tree.value;
        }
    }

    return expr(parseTree);
}

export {
    getIdentifiers,
    evaluate
}