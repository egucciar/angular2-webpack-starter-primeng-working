import { notify } from '../../messagebus';
import _ from 'lodash';
import mustache from 'mustache';

import { registerActions } from './actionRegistry';

function renderParams(params, data) {
    let ret = params;
    try {
        ret = JSON.parse(
            mustache.render(JSON.stringify(params), data)
        );
    } catch (ex) {
        console.error('Unable to JSON parse/stringify params', ex);
    }

    return ret;
}

function event(options) {
    let context = this.node._context,
        data = context.data,
        optionData = options.data || {};
    let params = options.params;

    if (options.paramsKey) {
        params = merge({}, params || {}, options[options.paramsKey]);
    }

    if (options.useOptions) {
        optionData = options;
    }

    if (params && options.renderParams !== false) {
        params = renderParams(params, _.merge({}, data, optionData));
    }

    notify(options.target, params);
}

registerActions({ event });

