import { receive } from '../messagebus';
import _ from 'lodash';
import { createViewModel } from '../metadata.component';
import { get } from '../helpers';

function ajaxRenderViewModel(node) {
    const context = this._context,
        ajaxRender = receive(`${node.id}.render`, (options) => {
            createViewModel.call(this, {
                type: 'action',
                actionType: 'ajax',
                options: options
            }).action({
                callback: (err, data) => {
                    if (err) {
                        return;
                    }

                    let children = data;
                    if (options.keyMap) {
                        children = get(data, options.keyMap.resultsKey);
                    }
                    children = Array.isArray(children) ? children : [children];
                    children.forEach(c => c._context = context);
                    this.children = children;
                }
            });
        });

    return _.merge({}, node, {
        dispose() {
            ajaxRender.dispose();
        }
    });
}

export { ajaxRenderViewModel };