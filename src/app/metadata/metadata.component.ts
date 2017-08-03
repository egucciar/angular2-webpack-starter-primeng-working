import {
  Component,
  Inject,
  Input,
  ComponentRef,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  AfterContentInit,
  OnDestroy,
  OnChanges,
  SimpleChange,
  ComponentFactory,
  NgModule,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import * as _ from 'lodash';
import { JitCompiler } from '@angular/compiler';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// primeng components
import 'font-awesome/css/font-awesome.min.css';
import 'primeng/resources/themes/omega/theme.css';
import 'primeng/resources/primeng.min.css';
import { DataTableModule } from 'primeng/components/datatable/datatable';
import { DataScrollerModule } from 'primeng/components/datascroller/datascroller';
// dataservice
import { DataService } from './data.service';

// scalejs helpers
import { get } from './helpers';

// RX
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

// Expression Parser
import { computed, observable, extendObservable } from 'mobx';
import { evaluate } from './expressions';
// import { MobxAngularModule } from 'mobx-angular';

// custom validators
import { EmailValidator } from './validators/email';

/* Metadata Component */
// components created dynamically
const componentCache = {};

@Component({
  selector: 'metadata',
  template: `<template #dynamicContentPlaceHolder></template>`,
  providers: [DataService]
})
export class MetadataComponent implements AfterViewInit {
  @ViewChild('dynamicContentPlaceHolder', { read: ViewContainerRef })
  dynamicComponentTarget: ViewContainerRef;

  private componentRef: ComponentRef<any>;
  _node: any; _data: any; _value: any;
  @Input() set node(node: any) { this._node = node; } get node() { return this._node };
  @Input() set data(data: any) { this._data = data; } get data() { return this._data };
  @Input() set value(value: any) { this._value = value; } get value() { return this._value };

  constructor(private _rc: JitCompiler, private _cdRef: ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.loadDynamicTags();
    this._cdRef.detectChanges();
  }

  loadDynamicTags() {
    const templateSelector = this._node.template || `${this._node.type}-template`;

    if (this._node.type === 'ignore') {
      return;
    }

    if (componentCache[templateSelector]) {
      let factory = componentCache[templateSelector];
      this.renderDynamicComponent(factory);
    } else {
      const template = getTemplate(templateSelector),
        newComponent = createComponent(template, templateSelector),
        newModule = createComponentModule(newComponent);

      this._rc
        .compileModuleAndAllComponentsAsync(newModule)
        .then((moduleWithFactories) => {
          let factory = _.find(moduleWithFactories.componentFactories, { componentType: newComponent });
          componentCache[templateSelector] = factory;

          this.renderDynamicComponent(factory);
        });
    }
  }

  renderDynamicComponent(factory) {
    if (this.componentRef) {
      this.componentRef.destroy();
    }

    this.componentRef = this.dynamicComponentTarget.createComponent(factory);
    let component = this.componentRef.instance;
    component.node = this.node;
    component.data = this.data;
    component.value = this.value;
  }
}

function createComponentModule(componentType: any) {
  @NgModule({
    imports: [
      BrowserModule,
      CommonModule,
      FormsModule,
      MetadataModule,
      DataTableModule,
      DataScrollerModule /*,
      MobxAngularModule */
    ],
    declarations: [componentType]
  })
  class RuntimeComponentModule { }

  return RuntimeComponentModule;
}

@NgModule({
  imports: [FormsModule],
  declarations: [MetadataComponent, EmailValidator],
  exports: [MetadataComponent, EmailValidator]
})
class MetadataModule { }

/* PJSON Component */
function createComponent(tmpl: string, selector: string) {
  @Component({
    selector: selector,
    template: tmpl,
    entryComponents: [MetadataComponent]
  })
  class PJSONComponent implements OnInit, AfterViewInit, OnDestroy, AfterContentInit {
    _node: any; _data: any; _value: any; rendered: any;
    @Input() set node(node: any) { this._node = node; } get node() { return this._node };
    @Input() set data(data: any) { this._data = data; } get data() { return this._data };
    @Input() set value(value: any) { this._value = value; } get value() { return this._value };

    inputValueObs = observable();
    inputValue = new Subject();
    initialValue = null;
    JSON = JSON;
    onChange(e) {
      this.value = e;
      this.inputValue.next(e);
    }
    createExpression(prop, term, getValue?, mapper?) {
      mapper = mapper || function (x) { return x; }
      getValue = getValue || this.node._context.getValue;
      const expression = computed(() => {
        console.log('Evaluating', term);
        return evaluate(term, getValue);
      }, { context: this });
      this[prop] = mapper(expression.get());
      expression.observe((v) => {
        this[prop] = mapper(v.newValue);
      });
    }
    constructor(private _dataService: DataService) { };

    public ngOnInit() {
      this.nodeDependencies();
    }
    public ngAfterViewInit() {
      this.inputValue.next(this.initialValue);
    }
    public ngAfterContentInit() {
    }
    public ngOnDestroy() {
      this.inputValue.unsubscribe();
    }

    private nodeDependencies() {
      const typeSettings = viewModels[this.node.type] || {};

      /* setup context */
      let context = this.node._context;
      if (!this.node._context) {
        const internalDict = {};

        this.node._top = true;
        this.node._context = context = {
          dictionary: observable.map(new Map()),
          data: {},
          id: this.node.id,
          debugging: true,
          getValue(id) {
            if (id === '_') { return _; }
            let item = context.dictionary.get(id);
            if (!item) return null;
            if (item.hasOwnProperty('inputValueObs')) {
              return item.inputValueObs.get();
            }
          }
        };
      }

      /* supplies context to children if exists */
      if (this.node.children) {
        this.node.children.forEach(c => c._context = context);
      }

      /* initialize value of component if necessary 
        (checks root and options for backwards compatiility) */
      if (this.node.value != null) {
        this.initialValue = this.node.value;
      }
      if (this.value != null) {
        this.initialValue = this.value;
      }

      /* adds itself to dictionary and data */
      if (this.node.id && !this.node._top) {
        context.data[this.node.id] = this.initialValue;
        context.dictionary.merge({
          [this.node.id]: this
        });
        this.inputValue.subscribe((x) => {
          context.data[this.node.id] = x;
          this.inputValueObs.set(x);
        });
      }

      /* gets the data for itself */
      if (this.node.dataSourceEndpoint && !typeSettings.controlsData) {
        const keyMap = this.node.dataSourceEndpoint.target.keyMap || {},
          resultsKey = keyMap.resultsKey || '';
        this._dataService.ajax(this.node.dataSourceEndpoint.target)
          .subscribe(data => this.data = resultsKey ? get(data, resultsKey) : data);
      }

      this.rendered = this.node.rendered === false ? false : true;
      if (typeof this.node.rendered === 'string') {
        const renderedString = this.node.rendered;
        delete this.node.rendered;
        this.createExpression('rendered', renderedString);
      }

      /* Extends itself with more JavaScript if applicable */
      if (!this.node._mapped) {
        const typeExtendFunc = viewModels[this.node.type];
        if (typeExtendFunc) {
          _.extend(this, typeExtendFunc.call(this, this.node));
        } else {
          _.extend(this, this.node);
        }
      } else {
        _.extend(this, this.node);
      }
    }
  }

  return PJSONComponent;
}

/* Viewmodel and Template registry and retrival */
const viewModels = {
  'test-children': function (node) {
    const mappedChildNodes = createViewModels.call(this, node.children || []),
      childNames = mappedChildNodes.map(n => n.name),
      text = `My children are ${childNames.join(',')}`;

    return _.merge({}, node, {
      text,
      mappedChildNodes
    });
  },
  'test-type': function (node) {
    return _.merge({}, node, {
      text: 'hello universe',
      name: 'Test'
    });
  }
};

const templates = {
  'no-template': 'No Template exists (type={{type}}, template={{template}})',
  'ignore-template': '',
  'test-type-template': 'Type test passed',
  'test-children-template': `
        <div *ngFor="let child of mappedChildNodes">
          <metadata [node]="child"></metadata>
        </div>
      </div>`,
};

function createViewModels(nodes) {
  const context = this;
  return nodes.map(createViewModel.bind(this)).filter(n => n != null);
}

function createViewModel(node) {
  const vm = viewModels[node.type] || function () { };
  node._mapped = true;
  return vm.call(this, node);

}

function registerViewModel(vm) {
  _.extend(viewModels, vm);
}

function registerTemplate(template, id) {
  templates[id] = template;
}

function getTemplate(selector) {
  const template = `<template [ngIf]="rendered"> ${templates[selector]} </template>`;
  return template != null ? template : templates['no-template'];
}

export {
  createViewModel,
  createViewModels,
  registerTemplate,
  registerViewModel,
  getTemplate
}