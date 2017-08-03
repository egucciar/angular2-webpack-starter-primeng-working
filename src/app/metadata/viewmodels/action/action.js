import _ from 'lodash';
import { has } from '../../helpers';
import { getRegisteredActions } from './actionRegistry';


function actionViewModel(node) {
    const actions = getRegisteredActions(),
        originalJson = _.cloneDeep(node),
        context = this.node._context,
        options = node.options || {},
        validate = node.validate,
        actionType = node.actionType,
        actionFunc = (actions[actionType] && actions[actionType].bind(this)) || null;

    function action(args) {
        if (!actionFunc) {
            console.error('actionType is not defined', node);
            return;
        }

        if (validate) {
            //TODO: Message bus logic.

            // notify(validate, {
            //     successCallback: function () {
            //         actionFunc(options, args);
            //     },
            //     actionNode: cloneDeep(originalJson),
            //     context: context
            // });
        } else if (node.onlyIf) {
            //TODO: Only if logic.

            // const only = evaluate(node.onlyIf, (identifier) => {
            //     // worried about collisions, we should keep the getValue function consistent as possible
            //     if (identifier === 'results') {
            //         return options.results;
            //     }
            //     if (identifier === 'options') {
            //         return options;
            //     }
            //     return context.getValue(identifier);
            // });
            // if (only) {
            //     actionFunc(options, args);
            // }
        } else {
            actionFunc(options, args);
        }
    }

    if (node.immediate) {
        if (has(node.delay)) {
            setTimeout(() => {
                action();
            }, node.delay);
            return;
        }
        action();
        return;
    }

    return _.merge({}, node, {
        action: action,
        options: options,
        context: context
    });
}

export {
    actionViewModel
};