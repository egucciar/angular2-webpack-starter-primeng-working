import {
  Component,
  OnInit
} from '@angular/core';

import { AppState } from '../app.service';
import { Title } from './title';
import { XLargeDirective } from './x-large';

//import json from './json/home_simple.json';
//import json from './json/home.json';
import json from './json/inputs.json';

json[0].children.slice(1).forEach(input => {
  input.label = input.inputType;
  input.id = input.inputType
});

@Component({
  selector: 'home',  // <home></home>
  providers: [
    Title
  ],
  styleUrls: [ './home.component.css' ],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  nodes : any;
  public localState = { value: '' };
  constructor(
    public appState: AppState,
    public title: Title
  ) {
    this.nodes = Array.isArray(json) ? json : [json];
  }
  public ngOnInit() {
    console.log('hello `Home` component');
  }

  public submitState(value: string) {
    console.log('submitState', value);
    this.appState.set('value', value);
    this.localState.value = '';
  }
}
