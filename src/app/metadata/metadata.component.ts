
import { Component,
         Inject,
         Input,
         ComponentRef,
         ViewChild,
         ViewContainerRef,
         AfterViewInit,
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

// primeng components
import 'font-awesome/css/font-awesome.min.css';
import 'primeng/resources/themes/omega/theme.css';
import 'primeng/resources/primeng.min.css';
import { DataTableModule } from 'primeng/components/datatable/datatable';

// RX
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

const componentCache = {};

@Component({
  selector: 'metadata',
  template: `<template #dynamicContentPlaceHolder></template>`,
})
export class MetadataComponent implements AfterViewInit {
  @ViewChild('dynamicContentPlaceHolder', {read: ViewContainerRef})
    dynamicComponentTarget: ViewContainerRef;

  private componentRef: ComponentRef<any>;
  _node : any;
  _data: any;
  _value: any;
  @Input()
  set node(node: any){
    this._node = node;
  }
  get node() {
    return this._node
  };
  @Input()
    set data(data: any){
      this._data = data;
    }
    get data() {
      return this._data
  };
  @Input()
    set value(value: any){
      this._value = value;
  }
    get value() {
      return this._value
  };

  constructor(private _rc: JitCompiler, private _cdRef : ChangeDetectorRef){}

  ngAfterViewInit(){
      this.loadDynamicTags();
      this._cdRef.detectChanges();
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

  loadDynamicTags(){
      const templateSelector = this._node.template || `${this._node.type}-template`;

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
                  console.log(moduleWithFactories);
                  let factory = _.find(moduleWithFactories.componentFactories, { componentType: newComponent });
                  componentCache[templateSelector] = factory;

                  this.renderDynamicComponent(factory);
              });
      }
  }
}

function createComponent(tmpl:string, selector: string) {
    @Component({
        selector: selector,
        template: tmpl,
        entryComponents: [MetadataComponent]
    })
    class PJSONComponent implements ngOnInit, ngAfterViewInit {      
      _data : any;
      _value: any;
      _node : any;

      inputValue = new Subject();
      initialValue = null;
      JSON = JSON;

      @Input()
      set node(node: any){
        this._node = node;
      }
      get node() {
        return this._node
      };
      @Input()
      set data(data: any){
        this._data = data;
      }
      get data() {
        return this._data
      };
      @Input()
        set value(value: any){
          this._value = value;
      }
        get value() {
          return this._value
      };

      constructor() {};

      onChange(e) {
        this.inputValue.next(e);
      }
       public ngOnInit() {
        this.nodeDependencies();
      }
      public ngAfterViewInit() {
        this.inputValue.next(this.initialValue);
      }

      private nodeDependencies (){
        /* setup context */ 
        console.log('-->', this.node._context, this.data);
        let context = this.node._context;        
        if (!this.node._context) {
          this.node._top = true;
          this.node._context = context = {
            dictionary: {},
            data: {},
            id: this.node.id,
            debugging: true
          };
        }
        if (this.node.data) {
          this.node._context = {
            data: this.data,
            dictionary: {},
            parentContext: context
          };
          context = this.node._context;
        }

        /* supplies context to children if exists */
        if (this.node.children) {
          this.node.children.forEach(c => c._context = context);
        }

        /* initialize value of component if necessary 
          (checks root and options for backwards compatiility) */
        if (!this.node.options) {
          this.node.options = {};
        }
        if (this.node.options.value != null) {
          this.initialValue = this.node.options.value;
        }
        if (this.node.value != null) {
          this.initialValue = this.node.value;
        }
        if (this.value != null) {
          this.initialValue = this.value;
        }

        /* adds itself to dictionary and data */
        if (this.node.id && !this.node._top) {
          console.log('--> Testing');
          context.data[this.node.id] = this.initialValue;
          context.dictionary[this.node.id] = this;
        }

        /* sets initial value and subscribes */        
        this.inputValue.next(this.initialValue);
        this.inputValue.subscribe(x => context.data[this.node.id] = x);

        /* Extends itself with more JavaScript if applicable */
        if (!this.node._mapped) {
          const typeExtendFunc = viewModels[this.node.type];
          if (typeExtendFunc) {
            _.extend(this, typeExtendFunc(this.node));
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


 function createViewModels(nodes) {
   const context = this;
   return nodes.map(createViewModel.bind(this)).filter(n => n != null);
 }

 function createViewModel(node) {
    const vm = viewModels[node.type] || function () {};
    node._mapped = true;
    return vm.call(this, node);

 }
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
    'test-children-template':`
        <div *ngFor="let child of mappedChildNodes">
          <metadata [node]="child"></metadata>
        </div>
      </div>`,
};

function createComponentModule (componentType: any) {
    @NgModule({
      imports: [
        BrowserModule,
        FormsModule,
        MetadataModule,        
        DataTableModule
      ],
      declarations: [ componentType ]
    })
    class RuntimeComponentModule {}

    return RuntimeComponentModule;
}

@NgModule({
    imports: [FormsModule],
    declarations: [MetadataComponent/*, AngularComponent*/],
    exports: [MetadataComponent/*, AngularComponent*/]
})
class MetadataModule {}

export function registerViewModel(vm) {
    _.extend(viewModels, vm);
}

export function registerTemplate(template, id) {
    templates[id] = template;
}

export function getTemplate(selector) {
  const template = templates[selector];
    return  template != null ? template : templates['no-template'];
}
