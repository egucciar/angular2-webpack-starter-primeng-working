import { observable } from 'mobx';
import { createViewModel } from '../metadata.component';

const dictionary = observable.shallowMap(new Map());

function storeViewModel(node) {
    const self = this,
        context = this._context,
        storeKey = node.storeKey,
        options = node.options || {},
        keyMap = node.keyMap || {};

    if (!storeKey) {
        console.warn('Cannot store data without a storeKey', node);
        return;
    }

    function fetchData() {
        createViewModel.call(self, {
            type: 'action',
            actionType: 'ajax',
            onlyf: node.onlyf,
            options: node.dataSourceEndpoint
        }).action({
            callback: (err, results) => {
                let value;

                if (err) {
                    console.error('Error when retrieving data for node', node, error);
                    dictionary.merge(storeKey, err);
                    return;
                }

                value = keyMap.resultsKey ? results[keyMap.resultsKey] : results;

                if (options.mapArrayToDictionaryWithKey) {
                    value = value.reduce((obj, item) => {
                        const key = options.mapArrayToDictionaryWithKey;
                        if (options.aggregateMappedItems) {
                            obj[item[key]] = obj[item[key]] || [];
                            obj[item[key]].push(item);
                        } else {
                            // will overwrite any existing items with the key
                            obj[item[key]] = keyMap.resultsValueKey ?
                                item[keyMap.resultsValueKey] :
                                item;
                        }
                        return obj;
                    }, {});
                }

                dictionary.set(storeKey, value);
            }
        });
    }

    if (node.dataSourceEndpoint) {
        fetchData();
    }
}

storeViewModel.controlsData = true;

export {
    storeViewModel,
    dictionary
};