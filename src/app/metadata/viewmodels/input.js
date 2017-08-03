import _ from 'lodash';
import { get, is } from '../helpers';

function inputViewModel(node) {
    const _required = get(node, 'options.validations.required', {}),
        _values = get(node, 'options.values');
    let required = false,
        values = [];

    
    if (_required === true) {
        required = true;
    } else if (_required.params === true && _required.onlyIf) {
        this.createExpression('required', _required.onlyIf);
    }

    if (is(_values, 'object') && _values.fromArray) {
        const keyMap = _.merge({ textKey: 'text', valueKey: 'value '}, _values),
            mapper = (x) => ({ text: x[keyMap.textKey], value: x[keyMap.valueKey]});
        this.createExpression(
            'values', 
            _values.fromArray, 
            null,
            (x) => Array.isArray(x) ? x.map(mapper) : []);
    } else if (is(_values, 'array')) {
        values = _values;
    }



    return _.merge(node, {
        required,
        values
    });
}

// inputViewModel.controlsData = true;

export {
    inputViewModel
};