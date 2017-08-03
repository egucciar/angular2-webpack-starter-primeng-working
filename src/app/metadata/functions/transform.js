import registry from './index';
import { get } from '../helpers';

const typeMap = {
    Q: questionMapper
};

function questionMapper(node) {

    console.log('Transform applied to node:', node);

    return {
        type: 'input',
        id: node.id,
        label: node.question
    };
}

function transform(data) {
    const form = {
        "type": "responsive"
    };

    const children = [ { type: 'Q', id: 'test', question: 'test label' }],
        mappedChildren = children.map(node => {
            return typeMap[node.type] ? typeMap[node.type](node) : node
        });

    form.children = mappedChildren;

    return {
        data: form
    };
}
registry.register('transform-form', transform);