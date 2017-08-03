import { registerViewModel, registerTemplate } from './metadata.component';
import blankTemplate from './templates/blank.html';
import inputTemplate from './templates/input.html';
import gridTemplate from './templates/grid.html';
import gridInfiniteTemplate from './templates/grid-infinite.html';
import responsiveTemplate from './templates/responsive.html';
import metadataTemplate from './templates/metadata.html';

import { gridViewModel } from './viewmodels/grid';
import { actionViewModel } from './viewmodels/action';
import { ajaxRenderViewModel } from './viewmodels/ajaxRender';
import { inputViewModel } from './viewmodels/input';
import { storeViewModel } from './viewmodels/store';

import './functions/transform';

registerTemplate(inputTemplate, 'input-template');
registerTemplate(gridTemplate, 'grid-template');
registerTemplate(responsiveTemplate, 'responsive-template');
registerTemplate(gridInfiniteTemplate, 'grid-infinite-template');
registerTemplate(metadataTemplate, 'metadata-template');

// template-less components
registerTemplate(blankTemplate, 'store-template');

registerViewModel({
    grid: gridViewModel,
    action: actionViewModel,
    ajaxRender: ajaxRenderViewModel,
    input: inputViewModel,
    store: storeViewModel
});

export * from './metadata.component';


