import { get } from '../helpers';

function gridViewModel(node) {
    if (this.node.dataSourceEndpoint && !node.pagination) {
        const keyMap = this.node.dataSourceEndpoint.target.keyMap || {},
            resultsKey = keyMap.resultsKey || '';
        this._dataService.ajax(this.node.dataSourceEndpoint.target)
            .subscribe(data => this.data = resultsKey ? get(data, resultsKey) : data);
    }

    function loadData(LazyLoadEvent) {
        console.log('Lazy load event -->', LazyLoadEvent);
        if (this.node.dataSourceEndpoint) {
            const paginationData = this.node.dataSourceEndpoint.target.data || {},
                keyMap = this.node.dataSourceEndpoint.target.keyMap || {},
                resultsKey = keyMap.resultsKey || '';
            
            paginationData.offset = LazyLoadEvent.first || 0;
            
            this._dataService.ajax(this.node.dataSourceEndpoint.target)
                .subscribe((data) => {
                    const resultData = resultsKey ? get(data, resultsKey) : data;
                    if (node.infinite) {
                        this.data = this.data || [];
                        this.data = this.data.concat(resultData);
                    } else {
                        this.data = resultData;
                    }
                    this.totalRecords = data.pagination.total;
                    this.offset = data.pagination.offset;
                });
        }
    }

    return _.merge(node, {
        loadData
    });
}

gridViewModel.controlsData = true;

export {
    gridViewModel
};