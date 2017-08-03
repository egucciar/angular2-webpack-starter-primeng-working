# Metadata Angular 2+ PJSON Port

Information on the Angular2+ PJSON Port

## Install and run

* Install  [node](https://nodejs.org)
* run `npm install`
* run `npm run server`

## Features Implemented So Far

* Used the angular webpack starter to jump start development
* Implemented `Metadata` component (metadata.component.ts) which takes a `node` PJSON configuration 
* The node defines a `type` and alternatively a `template` (defaults to `<type>-template` if not provided)
* The metadata component implements dynamic component rendering techniques (from Angular 2, there are newer techniques in Angular 4) are used to dynamically create and render component based on type/template
* Every template used while rendering application will be converted into a `PJSONComponent`
* PJSONComponents are created from templates on demand. If a template is unused it wont become a PJSON component
* All available templates are in the templates folder. Also, some default templates exist in `metadata.component.ts`, such as `ignore-template`.
* If template specified in json is not found it will be rendered with `no-template` template
* If a PJSONComponent was made from a template already it is looked up from component cache and not re-created
* A PJSONComponent has default implementation available to all templates
* A `type` can have a `viewModel` defined which will be used to extend the component instance with additional methods and properties before render time
* All viewModels are currently in the viewmodels folder
* A viewModel can also set type settings (ex: grid.js) which alter the behaviour of the PJSONComponent
* All PJSONComponents have a context. If no context was found upon PJSONComponent instantiation, it creates a new one.
* Templates and Viewmodels are created and registered via register functions exported by metadata.component.ts
* PJSONComponent gives the context to all `children` so that context are shared to `children` by default
* The context includes a `dictionary` of all the nodes within the tree and the `data` model tracked by node ID
* PJSONComponent will set the data based on what is passed from above (??? TODO: What is the point of this? do we need it?)
* PJSONComponent will request data for a `dataSourceEndpoint` if provided and not controlled by type settings which will be populated in `data`
* PJSONComponent will accept an initial value, `value` from above and set it in the initial data model
* PJSONComponent will create a few different ways of tracking its value - value (which is used by templates), inputValue (which is an RX observable used to update the data model), and inputValueObs (which is leveraged by expression parsing for automatic dependency detection)
* PJSONComponent will expose a simplified `createExpression` method which can be used to create expressions easily
* Expression functionality is available due to integration with `mobx` and `jsep`
* PJSONComponent wraps all templates with a virtual wrapper that will show/hide the component based on a `rendered` condition if it is provided
* PJSONComponent context exposes a `getValue` function which can be used by the expression parser
* PJSONComponent expression parser also accepts a `mapper` function to map results from the expression
* Injectable DataService is available
* helpers such as `get`, `has`, and `is` are available
* MessageBus (with `notify` and `receive`) is available
* `input` component is available and works with dataModel tracking
* When debugging is set to `true` in the context, the `responsive` template will show the data model
* `responsive` template is available using `primeng` classes
* `input` supports `required` validation, including `onlyIf` conditional application of the same
* `input` supports `text` and `select` as well as no inputType (which defaults to `text`)
* `select` is able to leverage both key/value pairs for options as well as the `fromArray` expression
* this can be used to connect to the `store` component, which is available
* `store` component exposes global noticeboard/observable map/dictionary
* Expressions really work and react to changes in the inputValueObs exposed by all components internally as well as changes in the dictionary context and store
* `inputs` are implemented using the Template-driven form approach. Reactive form approach to be investigated
* PrimeNG is used to have 2 advanced functionalities, `grid` and `grid-infinite`, with paging/infinite scrolling respectively
* `grid` type is reused between normal `grid` and `grid-infinite` templates
* `grid` template is able to render cells as `metadata` components for easy custom rendering (passes rowData as `data` and the cells value as `value` and the column def as `node`)
* `action` component is available
* `ajax` component is available
* `event` component is available
* `ajaxRender` component is available
* `dataMapFunction` capability is available
* functions can be registed and found in functions folder
* one existing function is the `transform` function which would be able to convert a different form json format to pjson format



