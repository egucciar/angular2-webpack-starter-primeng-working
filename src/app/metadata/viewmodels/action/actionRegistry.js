import { extend } from 'lodash';

const registeredActions = {};

function registerActions(actions) {
    extend(registeredActions, actions);
}

function getRegisteredActions() {
    return registeredActions;
}

export { registerActions, getRegisteredActions };