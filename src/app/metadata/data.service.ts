import { Injectable, Output, EventEmitter, Inject } from '@angular/core';
import { Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';
import { invoke } from './functions';

@Injectable()
export class DataService {
    request: any;
    url: string = '';//window.service || '/',
    handleError: any;
    userService: any = {};
    defaultHeaders: any = _.merge({}, {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    });
    state: any = {};

    constructor(private _http: Http) { }

    ajax(request) {
        request.options = _.merge({
            type: 'GET'
        }, request.options || {});
        const _ajax = request.options.type.toUpperCase() === 'GET' ? this.getData : this.sendData;
        return _ajax.call(this, request);
    }

    setupDataCall() {
        let _url = this.request.url || this.url;
        let _uri = this.request.uri;
        let _requestOptions;

        const dataMapFunctions = this.request.dataMapFunctions || {},
            _data = invoke(dataMapFunctions.before, this.request.data, dataMapFunctions.beforeOptions);

        function mapResponse(_response) {
            return invoke(dataMapFunctions.after, _response, dataMapFunctions.afterOptions);
        }

        this.handleError = (error: Response) => {
            console.error('Error happened while proccessing request', this.request, error);
            return Observable.throw(error.json());
        };
        this.request.options.headers = _.merge(this.defaultHeaders, this.request.options.headers);
        _requestOptions = new RequestOptions({ headers: this.request.options.headers });
        return {
            _url,
            _uri,
            _requestOptions,
            _data,
            mapResponse
        };
    }

    sendData(req) {
        this.request = _.cloneDeep(req); // prevent mutations
        const { _url, _uri, _requestOptions, _data, mapResponse } = this.setupDataCall();

        return this._http.post(_url + _uri, _data, _requestOptions)
            .map((_response: Response) => mapResponse(_response.json()))
            .do(data => console.log(data))
            .catch(this.handleError);
    }

    getData(req) {
        this.request = _.cloneDeep(req); // prevent mutations
        const { _url, _uri, _requestOptions, mapResponse } = this.setupDataCall();
        // todo: serialize data in query string

        return this._http.get(_url + _uri)
            .map((_response: Response) => mapResponse(_response.json()))
            .do(data => {
                console.log(data);
            })
            .catch(this.handleError);
    }
}
