import { registerViewModel, registerTemplate } from './metadata.component';
import inputTemplate from './templates/input.html';
import gridTemplate from './templates/grid.html';
import responsiveTemplate from './templates/responsive.html';

registerTemplate(inputTemplate, 'input-template');
registerTemplate(gridTemplate, 'grid-template');
registerTemplate(responsiveTemplate, 'responsive-template');

export * from './metadata.component';


