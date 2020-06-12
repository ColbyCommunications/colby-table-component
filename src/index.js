/* eslint-disable jsx-a11y/no-onchange */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import Paginator from '@colbycommunications/colby-paginator-component';
import _cloneDeep from 'lodash/cloneDeep';
import _forIn from 'lodash/forIn';
import _has from 'lodash/has';
import _map from 'lodash/map';
import _find from 'lodash/find';
import _filter from 'lodash/filter';
import _intersection from 'lodash/intersection';
import _isEqual from 'lodash/isEqual';
import _sortBy from 'lodash/sortBy';
import _escapeRegExp from 'lodash/escapeRegExp';
import _last from 'lodash/last';
import _slice from 'lodash/slice';
import _forEach from 'lodash/forEach';
import _isString from 'lodash/isString';
import _isFunction from 'lodash/isFunction';
import _isEmpty from 'lodash/isEmpty';
import moment from 'moment';
import Loader from '@colbycommunications/colby-loader';
import md5 from 'md5';
import storage from 'store';
import classnames from 'classnames';
import Actions from './actions.js';
import Filter from './filter.js';
import FilterSelected from './filterSelected.js';
import Disabled from './disabledMessage.js';
import ListTemplate from './listTemplate.js';

import style from './table.css';

export default class Table extends React.Component {
    // Component properties
    filteredTotal = 0;

    static propTypes = {
        name: PropTypes.string,
        wrapperClassName: PropTypes.string,
        className: PropTypes.string,
        columns: PropTypes.instanceOf(Object),
        data: PropTypes.instanceOf(Object),

        /** URL for API <br> Note: You cannot use "apiUrl" and "data" simultaneously; "data" will be ignored.
         */
        apiUrl: PropTypes.string,
        rowKey: PropTypes.string,
        isRowNumber: PropTypes.bool,
        rowActions: PropTypes.instanceOf(Object),
        selectedRows: PropTypes.instanceOf(Object),
        rowSelectedCallback: PropTypes.func,
        didMount: PropTypes.func,
        orderBy: PropTypes.string,
        isAscentOrder: PropTypes.bool,
        perPage: PropTypes.number,
        showPerPageOptions: PropTypes.bool,
        perPageOptions: PropTypes.instanceOf(Object),
        hideShowingRowsSummary: PropTypes.bool,
        constantFilter: PropTypes.instanceOf(Object),
        showBottomPaginator: PropTypes.bool,

        /** When in AJAX mode, the number of rows that will be returned from an AJAX request. <br> If "0" AJAX will not be used.
         */
        ajaxLimit: PropTypes.number,

        /** When in AJAX mode, this will prevent the page from changing while loading data from an AJAX request */
        isHardLoading: PropTypes.bool,

        /** The regular filter <i>e.g.</i>: <br/>
         <pre>{name: "Bob", email: "@gmail.com"}</pre> */
        filter: PropTypes.instanceOf(Object),

        /** A query that will be appended to all apiURL requests <i>e.g.</i>:
<pre>{codebook_id: 1}</pre>
        */
        constantQuery: PropTypes.instanceOf(Object),

        /** This symbol will mean nothing when put in a filter. */
        emptySymbol: PropTypes.string,

        /** Show the reload button or not? Only applies to AJAX mode */
        showReloadButton: PropTypes.bool,

        /** Save the table's state, sort and filter params, in local storage? */
        saveState: PropTypes.bool,

        /** Display the CSV download button or not? */
        // isCsvDownload: PropTypes.bool,

        /** Sets the title for the CSV download button. */
        // csvButtonTitle: PropTypes.string,

        /** Sets the name of the CSV file to be downloaded */
        // csvFilename: PropTypes.string,

        /** Customizable download function */
        // csvDownloadFunction: PropTypes.func,

        /** An array of column names, that will be omitted in the CSV file */
        // csvOmittedColumns: PropTypes.instanceOf(Array),

        /** Display a single, simple checkbox that allows a user to select all or none of the table. */
        isSimpleCheckboxes: PropTypes.bool,

        callbacks: PropTypes.instanceOf(Object),
        noRecordsMessage: PropTypes.string,
        renderAsList: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
        listTemplate: PropTypes.func,
        onRowClick: PropTypes.func,
        showRowClickable: PropTypes.bool,
        setRowClass: PropTypes.func,
        useOnlyNameForHash: PropTypes.bool,
    };

    static defaultProps = {
        name: '',
        wrapperClassName: '',
        className: 'table table-condensed table-striped table-bordered table-responsive-md',
        columns: [],
        data: [],
        apiUrl: '',
        rowKey: 'id',
        isRowNumber: false,
        rowActions: [],
        selectedRows: [],
        rowSelectedCallback: null,
        didMount() {},
        orderBy: '',
        isAscentOrder: true,
        perPage: 50,
        showPerPageOptions: true,
        perPageOptions: [10, 25, 50, 100, 200],
        hideShowingRowsSummary: false,
        ajaxLimit: 1000,
        isHardLoading: true,
        filter: {},
        constantFilter: {},
        constantQuery: {},
        emptySymbol: '*',
        showBottomPaginator: true,
        showReloadButton: true,
        saveState: true,
        // isCsvDownload: false,
        // csvButtonTitle: 'CSV',
        // csvFilename: 'download.csv',
        // csvDownloadFunction: null,
        // csvOmittedColumns: [],
        isSimpleCheckboxes: false,
        callbacks: {},
        noRecordsMessage: 'No matching records found',
        renderAsList: null,
        listTemplate: ListTemplate,
        onRowClick: null,
        showRowClickable: true,
        setRowClass: null,
        useOnlyNameForHash: false,
    };

    constructor(props, context) {
        super(props, context);
        const settings = this.getSettings();

        this.state = {
            data: [],
            total: 0,
            filtered: 0,
            loading: false,
            hardLoading: true,
            currentPage: 1,
            perPage: settings.perPage,
            selectedRows: _cloneDeep(props.selectedRows),
            selectAllChecked: false,
            filters: settings.filters,
            orderBy: settings.orderBy,
            isAscentOrder: settings.isAscentOrder,
            showOnlySelected: false,
            filterFunction: null,
        };
    }

    componentDidMount() {
        const { didMount, rowSelectedCallback } = this.props;
        didMount();

        if (_isFunction(rowSelectedCallback)) {
            rowSelectedCallback(this.getRealSelectedRows());
        }

        if (this.isAjaxMode()) {
            this.update();
        }
    }

    componentDidUpdate() {
        const { apiUrl, data, rowSelectedCallback } = this.props;

        // Show warning message
        if (apiUrl !== '' && data.length > 0) {
            console.warn(
                'You cannot pass "apiUrl" and "data" props together. "data" will be ignored.'
            );
        }

        this.saveSettings();

        if (_isFunction(rowSelectedCallback)) {
            rowSelectedCallback(this.getRealSelectedRows());
        }
    }

    isAjaxMode = () => {
        const { apiUrl } = this.props;
        return apiUrl !== '';
    };

    isAjax = () => {
        const { ajaxLimit } = this.props;
        const { filtered } = this.state;
        return this.isAjaxMode() && ajaxLimit !== 0 && ajaxLimit <= filtered;
    };

    isAllData = () => {
        const { total, ajaxLimit } = this.state;
        return !this.isAjaxMode() || total <= ajaxLimit;
    };

    getQuery = () => {
        const query = [];
        const { constantFilter, ajaxLimit, columns } = this.props;
        const { perPage, filters, orderBy, isAscentOrder } = this.state;

        if (!_isEmpty(constantFilter) && !_isFunction(constantFilter)) {
            _forIn(constantFilter, (value, key) => {
                query.push(`*${key}=${value}`);
            });
        }

        // Set ajax row number
        query.push(`_ajax=${ajaxLimit}`);

        // Set limit
        query.push(`_limit=${perPage}`);

        // Set offset
        query.push(`_offset=${this.getStartRowNumber()}`);

        // Set filter
        columns.forEach(column => {
            if (
                !column.ajax ||
                !_has(column, 'filter') ||
                column.filter !== true ||
                !_has(filters, column.name)
            ) {
                return;
            }

            const filterSettings = column.filterSettings || { type: 'text' };
            const field = filterSettings.field || column.name;

            if (typeof field === 'object') {
                console.warn(`You cannot use field as an array for column "${column.name}"`);
                return;
            }

            switch (filterSettings.type) {
                case 'text':
                    query.push(`${field}-lk=*${encodeURIComponent(filters[column.name])}*`);
                    break;

                case 'equal':
                    query.push(`${field}=${encodeURIComponent(filters[column.name])}`);
                    break;

                case 'selectbox':
                    if (_has(filterSettings, 'custom')) {
                        console.warn(`You cannot use custom function for column "${column.name}"`);
                    }
                    query.push(`${field}=${encodeURIComponent(filters[column.name])}`);
                    break;

                case 'date': {
                    let [startDate, endDate] = filters[column.name];

                    if (startDate && moment(startDate).isValid()) {
                        startDate = moment(startDate)
                            .startOf('day')
                            .format('YYYY-MM-DD HH:mm:ss');
                        query.push(`${field}-min=${startDate}`);
                    }

                    if (endDate && moment(endDate).isValid()) {
                        endDate = moment(endDate)
                            .endOf('day')
                            .format('YYYY-MM-DD HH:mm:ss');
                        query.push(`${field}-max=${endDate}`);
                    }

                    break;
                }

                default:
                    console.warn(`Unknown filter type "${filterSettings.type}"`);
                    break;
            }
        });

        // Set order
        const currentColumn = _find(columns, { name: orderBy });
        if (currentColumn && currentColumn.ajax) {
            const order = isAscentOrder ? '' : '-';
            query.push(`_sort=${order}${orderBy}`);
        }

        _forEach(constantQuery, (value, key) => {
            query.push(`${key}=${value}`);
        });

        return `?${query.join('&')}`;
    };

    update = (loading = true) => {
        const { isHardLoading, apiUrl } = this.props;
        const hardLoading = isHardLoading;
        const $this = this;

        $this.setState({
            loading,
            hardLoading,
        });

        return new Promise(async resolve => {
            const response = await axios.get(apiUrl + this.getQuery());

            $this.setState(
                {
                    data: response.data.data,
                    total: response.data.total || response.data.data.length,
                    filtered: response.data.filtered || 0,
                    loading: false,
                    selectedRows: [],
                },
                () => {
                    resolve();
                }
            );
        });
    };

    planUpdate = () => {
        // Don't update if it is not ajax mode
        if (!this.isAjaxMode()) {
            return;
        }

        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.setState({
            loading: true,
            hardLoading: false,
        });

        this.timeout = setTimeout(() => {
            this.update(true, false);
        }, 500);
    };

    // Return data with applied constantFilter
    getActualData = () => {
        const { data: stateData } = this.state;
        const { constantFilter, data } = this.props;
        if (this.isAjaxMode()) {
            return stateData;
        }

        if (_isEmpty(constantFilter) && !_isFunction(constantFilter)) {
            return data;
        }

        return _filter(data, constantFilter);
    };

    // Return only selected rows which matches the data
    getRealSelectedRows = () => {
        const { rowKey } = this.props;
        const { selectedRows } = this.state;
        return _intersection(
            selectedRows,
            _map(this.getActualData(), rowKey).map(id => id.toString())
        );
    };

    gotoPage = page => {
        this.setState(
            {
                currentPage: page,
            },
            () => {
                if (this.isAjax()) {
                    this.update();
                }
            }
        );
    };

    getHash = () => {
        const { useOnlyNameForHash, name, columns } = this.props;
        // Generate unique hash for the page+table
        const str = useOnlyNameForHash
            ? name
            : window.location.hostname +
              window.location.pathname +
              _map(columns, 'name').toString() +
              name;

        return md5(str).substr(0, 10);
    };

    saveSettings = () => {
        const { saveState } = this.props;
        const { perPage, isAscentOrder, orderBy, filters } = this.state;

        if (!saveState) {
            return;
        }

        const hash = this.getHash();
        const state = storage.get('colby-table');
        const oldSettings = state && state[hash];
        const newSettings = {
            filters,
            orderBy,
            isAscentOrder,
            perPage,
        };

        if (!_isEqual(oldSettings, newSettings)) {
            storage.set('colby-table', {
                ...state,
                [hash]: newSettings,
            });
        }
    };

    getSettings = () => {
        const { orderBy, isAscentOrder, perPage, filter, columns, perPageOptions } = this.props;
        const state = storage.get('colby-table');
        let settings = state && state[this.getHash()];
        if (!settings) {
            settings = {
                filters: {},
                orderBy,
                isAscentOrder,
                perPage,
            };
        }

        // Use props filter if exists
        if (!_isEmpty(filter)) {
            settings.filters = filter;
        }

        // Check if orderBy is correct
        let column = _find(columns, { name: settings.orderBy, sort: true });
        if (column === undefined) {
            column = _find(columns, ['sort', true]);
        }
        settings.orderBy = column === undefined ? '' : column.name;

        // Check if isAscentOrder is boolean
        if (typeof settings.isAscentOrder !== 'boolean') {
            settings.isAscentOrder = true;
        }

        // Check if perPage is in range
        if (perPageOptions.indexOf(settings.perPage) === -1) {
            settings.perPage = perPage;
        }

        return settings;
    };

    onPerPageChange = event => {
        this.setState(
            {
                perPage: event.target.value * 1,
                currentPage: 1,
            },
            () => {
                if (!this.isAllData()) {
                    this.update();
                }
            }
        );
    };

    onFilterChange = (column, value) => {
        const { filters: stateFilters } = this.state;
        const { columns } = this.props;
        const filters = stateFilters;
        if (value === '') {
            delete filters[column];
        } else {
            filters[column] = value;
        }

        this.setState(
            {
                currentPage: 1,
                filters,
            },
            () => {
                if (!this.isAllData()) {
                    const currentColumn = _find(columns, ['name', column]);
                    if (currentColumn.ajax) {
                        this.planUpdate();
                    }
                }
            }
        );
    };

    removeFilter = () => {
        this.setState(
            {
                currentPage: 1,
                showOnlySelected: false,
                filters: {},
            },
            () => {
                if (!this.isAllData()) {
                    this.update();
                }
            }
        );
    };

    onSelectRow = ({ target: { value: eventValue } }) => {
        const { selectedRows: stateSelectedRows } = this.state;
        const value = eventValue;
        const selectedRows = stateSelectedRows;

        const index = selectedRows.indexOf(value);
        if (index === -1) {
            selectedRows.push(value);
        } else {
            selectedRows.splice(index, 1);
        }

        this.setState({
            selectedRows,
        });
    };

    onSelectAll = e => {
        const { selectedRows: stateSelectedRows } = this.state;
        const { rowKey } = this.props;
        e.preventDefault();
        if (this.isAjax()) {
            return;
        }

        const selectedRows = stateSelectedRows;
        const rows = this.getFilteredData();

        rows.forEach(row => {
            if (selectedRows.indexOf(row[rowKey].toString()) === -1) {
                selectedRows.push(row[rowKey].toString());
            }
        });

        this.setState({
            selectedRows,
        });
    };

    onSelectReallyAll = e => {
        const checked = e.target.checked;
        const { rowKey } = this.props;

        let selectedRows = [];

        if (checked) {
            selectedRows = this.getActualData().map(row => row[rowKey].toString());
        }

        this.setState({
            selectAllChecked: checked,
            selectedRows,
        });
    };

    onSelectNone = e => {
        e.preventDefault();

        const { selectedRows: stateSelectedRows } = this.state;
        const { rowKey } = this.props;

        if (this.isAjax()) {
            return;
        }

        const selectedRows = stateSelectedRows;

        const rows = this.getFilteredData();

        rows.forEach(row => {
            const index = selectedRows.indexOf(row[rowKey].toString());
            if (index !== -1) {
                selectedRows.splice(index, 1);
            }
        });

        this.setState({
            selectedRows,
        });
    };

    afterAction = () => {
        this.setState({
            showOnlySelected: false,
            selectedRows: [],
        });
    };

    onOrder = (orderBy, order) => {
        const { isAscentOrder: stateIsAscentOrder, orderBy: stateOrderBy } = this.state;
        let isAscentOrder;
        if (_isString(order)) {
            isAscentOrder = order.toLowerCase() === 'asc';
        } else {
            isAscentOrder = stateIsAscentOrder;
            // eslint-disable-next-line eqeqeq
            if (stateOrderBy == orderBy) {
                isAscentOrder = !isAscentOrder;
            }
        }

        this.setState(
            {
                currentPage: 1,
                orderBy,
                isAscentOrder,
            },
            () => {
                if (this.isAjax()) {
                    this.update();
                }
            }
        );
    };

    registerFilterFunction = func => {
        this.setState({
            filterFunction: func,
        });
    };

    getFilteredData = () => {
        const {
            filterFunction,
            showOnlySelected,
            selectedRows,
            filters,
            orderBy: stateOrderBy,
            isAscentOrder: stateIsAscentOrder,
        } = this.state;
        const { rowKey, columns, emptySymbol } = this.props;

        let rows = this.getActualData();

        // Don't proceed if it is an ajax request
        if (this.isAjax()) {
            return rows;
        }

        if (_isFunction(filterFunction)) {
            rows = _filter(rows, filterFunction);
        }

        if (showOnlySelected) {
            rows = _filter(rows, row => selectedRows.indexOf(row[rowKey].toString()) !== -1);
        }

        // Apply the filter
        columns.forEach(column => {
            if (
                (this.isAjaxMode() && !this.isAllData() && column.ajax) ||
                !_has(column, 'filter') ||
                column.filter !== true ||
                !_has(filters, column.name)
            ) {
                return;
            }

            const filterSettings = column.filterSettings || { type: 'text' };
            let fields = filterSettings.field || column.name;
            // make fields array
            if (typeof fields === 'string') {
                fields = [fields];
            }

            if (_has(filterSettings, 'custom')) {
                rows = _filter(rows, row => filterSettings.custom(row, filters[column.name]));
            } else {
                switch (filterSettings.type) {
                    case 'text': {
                        rows = _filter(rows, row => {
                            let result = false;
                            fields.forEach(field => {
                                if (filters[column.name] === emptySymbol) {
                                    // Check if the column is empty
                                    if (String(row[field]) === '' || row[field] === null) {
                                        result = true;
                                    }
                                } else if (
                                    String(row[field]).match(
                                        new RegExp(_escapeRegExp(filters[column.name]), 'i')
                                    )
                                ) {
                                    result = true;
                                }
                            });

                            return result;
                        });
                        break;
                    }
                    case 'equal': {
                        rows = _filter(rows, row => {
                            let result = false;
                            fields.forEach(field => {
                                // eslint-disable-next-line eqeqeq
                                if (row[field] == filters[column.name]) {
                                    result = true;
                                }
                            });

                            return result;
                        });
                        break;
                    }
                    case 'selectbox': {
                        rows = _filter(rows, row => {
                            let result = false;
                            fields.forEach(field => {
                                // eslint-disable-next-line eqeqeq
                                if (row[field] == filters[column.name]) {
                                    result = true;
                                }
                            });

                            return result;
                        });
                        break;
                    }
                    case 'date': {
                        let [startDate, endDate] = filters[column.name];

                        if (startDate && moment(startDate).isValid()) {
                            startDate = moment(startDate)
                                .startOf('day')
                                .format('YYYY-MM-DD HH:mm:ss');

                            rows = _filter(rows, row => {
                                let result = false;
                                fields.forEach(field => {
                                    if (row[field] >= startDate) {
                                        result = true;
                                    }
                                });

                                return result;
                            });
                        }

                        if (endDate && moment(endDate).isValid()) {
                            endDate = moment(endDate)
                                .endOf('day')
                                .format('YYYY-MM-DD HH:mm:ss');

                            rows = _filter(rows, row => {
                                let result = false;
                                fields.forEach(field => {
                                    if (row[field] <= endDate) {
                                        result = true;
                                    }
                                });

                                return result;
                            });
                        }

                        break;
                    }
                    default: {
                        console.warn(`There is no "${filterSettings.type}" filter type`);
                        break;
                    }
                }
            }
        });

        // Order the data
        if (stateOrderBy !== '') {
            const column = _find(columns, ['name', stateOrderBy]);

            // Check if the column hasn't been removed
            if (column !== undefined) {
                const sortSettings = column.sortSettings || {};

                if (_isFunction(sortSettings.custom)) {
                    rows = _sortBy(rows, sortSettings.custom);
                } else {
                    const orderBy = sortSettings.field || column.name;
                    rows = _sortBy(rows, orderBy);
                }

                if (!stateIsAscentOrder) {
                    rows.reverse();
                }
            }
        }

        return rows;
    };

    toggleShowOnlySelected = () => {
        const { showOnlySelected } = this.state;
        this.setState({
            currentPage: 1,
            showOnlySelected: !showOnlySelected,
        });
    };

    renderButtons = () => {
        const buttons = [];

        // Reload data button
        const reloadDataButton = this.renderReloadDataButton();
        if (reloadDataButton) {
            buttons.push(reloadDataButton);
        }

        // Per page
        const perPageOptions = this.renderPerPageOptions();
        if (perPageOptions) {
            buttons.push(perPageOptions);
        }

        if (buttons.length === 0) {
            return null;
        }

        return <span className={style.buttons}>{buttons}</span>;
    };

    renderPerPageOptions = () => {
        const { showPerPageOptions, perPageOptions } = this.props;
        const { perPage } = this.state;

        if (!showPerPageOptions) {
            return null;
        }

        const options = perPageOptions.map(number => (
            <option key={number} value={number}>
                {number}
            </option>
        ));

        return (
            <span className={style.button} key="perPage">
                Per page: &nbsp;
                <select
                    className="form-control input-sm"
                    style={{ width: 'auto', display: 'inline-block' }}
                    value={perPage}
                    onChange={this.onPerPageChange}
                >
                    {options}
                </select>
            </span>
        );
    };

    renderReloadDataButton = () => {
        const { showReloadButton } = this.props;
        const { loading, isHardLoading } = this.state;
        if (!this.isAjaxMode() || !showReloadButton) {
            return null;
        }

        const spinner = loading && !isHardLoading ? <span>loading...</span> : null;
        const buttonStyle = loading && !isHardLoading ? { visibility: 'hidden' } : {};

        return (
            <span
                className={style.button}
                key="refresh"
                style={{ position: 'relative', display: 'inline-block' }}
            >
                {spinner}
                <button
                    type="button"
                    className="btn btn-default btn-sm"
                    onClick={this.update.bind(null, true, true)}
                    title="Reload data"
                    style={buttonStyle}
                >
                    <span className="glyphicon glyphicon-repeat" />
                </button>
            </span>
        );
    };

    getTotal = () => {
        const { total } = this.state;
        return this.isAjaxMode() ? total : this.getActualData().length;
    };

    getFilteredTotal = () => {
        const { filtered } = this.state;
        return this.isAjax() ? filtered : this.filteredTotal;
    };

    renderCount = (filtered, all) => {
        const { filters, showOnlySelected } = this.state;
        const { hideShowingRowsSummary } = this.props;
        let clearFilter = null;
        if (showOnlySelected || !_isEmpty(filters)) {
            clearFilter = (
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={this.removeFilter}
                >
                    <span className="glyphicon glyphicon-remove" />
                    Remove Filter
                </button>
            );
        }
        const countMsg = hideShowingRowsSummary ? '' : `Showing ${filtered} of ${all} total rows`;

        if (!countMsg && !clearFilter) {
            return null;
        }

        return (
            <span className={style.countBlock}>
                {countMsg} {clearFilter}
            </span>
        );
    };

    renderThead = () => {
        const { columns, isRowNumber } = this.props;
        const { isAscentOrder, orderBy, selectAllChecked } = this.state;
        const headers = columns.map(column => {
            let className = column.class || '';

            // Show sort style
            if (column.sort && (column.ajax || !this.isAjax())) {
                className += ` ${style.sortable}`;
                // eslint-disable-next-line eqeqeq
                if (column.name == orderBy) {
                    className += isAscentOrder
                        ? ` ${style.sortable_asc}`
                        : ` ${style.sortable_desc}`;
                }
                return (
                    <th
                        className={className}
                        key={column.name}
                        onClick={this.onOrder.bind(null, column.name)}
                    >
                        {column.label}
                    </th>
                );
            }

            return (
                <th className={className} key={column.name}>
                    {column.label}
                </th>
            );
        });
        // Is Number?
        if (isRowNumber) {
            headers.unshift(
                <th key="number_column" className={style.numberColumn}>
                    #
                </th>
            );
        }
        // Is Checkbox?
        if (this.isShowCheckboxes()) {
            //     if (isSimpleCheckboxes) {
            const title = selectAllChecked ? 'Uncheck all' : 'Check all';

            headers.unshift(
                <th
                    key="checkbox_column"
                    className={`${style.checkboxColumn} ${style.checkboxColumnSimple}`}
                >
                    <label htmlFor="colby-table-checkbox">
                        <input
                            title={title}
                            id="colby-table-checkbox"
                            type="checkbox"
                            value="1"
                            checked={selectAllChecked}
                            onChange={this.onSelectReallyAll}
                            disabled={this.isAjax()}
                        />
                    </label>
                </th>
            );
        }
        // } else {
        //     headers.unshift(
        //         <th key="checkbox_column" className={style.checkboxColumn}>
        //             <button
        //                 type="button"
        //                 href="#"
        //                 onClick={this.onSelectAll}
        //                 title="Check all filtered records"
        //                 className={style.checkAllBtn}
        //             >
        //                 <svg
        //                     className="bi bi-check-square"
        //                     width="1em"
        //                     height="1em"
        //                     viewBox="0 0 16 16"
        //                     fill="currentColor"
        //                     xmlns="http://www.w3.org/2000/svg"
        //                 >
        //                     <path
        //                         fillRule="evenodd"
        //                         d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"
        //                     />
        //                     <path
        //                         fillRule="evenodd"
        //                         d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z"
        //                     />
        //                 </svg>
        //             </button>{' '}
        //             <button
        //                 type="button"
        //                 href="#"
        //                 onClick={this.onSelectNone}
        //                 title="Uncheck all filtered records"
        //                 className={style.checkAllBtn}
        //             >
        //                 <svg
        //                     className="bi bi-square"
        //                     width="1em"
        //                     height="1em"
        //                     viewBox="0 0 16 16"
        //                     fill="currentColor"
        //                     xmlns="http://www.w3.org/2000/svg"
        //                 >
        //                     <path
        //                         fillRule="evenodd"
        //                         d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"
        //                     />
        //                 </svg>
        //             </button>
        //         </th>
        //     );
        // }
        // }

        return <tr>{headers}</tr>;
    };

    isShowCheckboxes = () => {
        const { rowActions, rowSelectedCallback } = this.props;
        return rowActions.length > 0 || _isFunction(rowSelectedCallback);
    };

    onRowClick = row => {
        const { onRowClick } = this.props;
        onRowClick(row);
    };

    renderFilter = () => {
        const { columns, ajaxLimit, isRowNumber, isSimpleCheckboxes } = this.props;
        const { filters: stateFilters, showOnlySelected } = this.state;
        // Don't show filter if there is no data
        if (this.getTotal() === 0) {
            return null;
        }

        if (!_find(columns, { filter: true }) && !this.isShowCheckboxes()) {
            return null;
        }

        const lastColumn = _last(columns);
        const filters = columns.map(column => {
            const className = column.class || '';

            if (_has(column, 'filter') && column.filter === true) {
                const disabled = this.isAjax() && !column.ajax;

                return (
                    <th key={column.name} className={className}>
                        <Disabled
                            number={ajaxLimit}
                            disabled={disabled}
                            display="block"
                            placement={column.name === lastColumn.name ? 'bottom-left' : 'bottom'}
                        >
                            <Filter
                                column={column.name}
                                value={stateFilters[column.name]}
                                onFilterChange={this.onFilterChange}
                                settings={column.filterSettings}
                                disabled={disabled}
                            />
                        </Disabled>
                    </th>
                );
            }

            return <th key={column.name} className={className} />;
        });

        // Is Number?
        if (isRowNumber) {
            filters.unshift(<th key="number_column" />);
        }
        // Is Checkbox?
        if (this.isShowCheckboxes()) {
            if (isSimpleCheckboxes) {
                filters.unshift(<th key="checkbox_column" />);
            } else {
                filters.unshift(
                    <th key="checkbox_column">
                        <Disabled
                            number={ajaxLimit}
                            disabled={this.isAjax()}
                            placement="right"
                            size={null}
                        >
                            <FilterSelected
                                showSelected={showOnlySelected}
                                onClick={this.toggleShowOnlySelected}
                                disabled={this.isAjax()}
                            />
                        </Disabled>
                    </th>
                );
            }
        }

        return <tr>{filters}</tr>;
    };

    getStartRowNumber = () => {
        const { currentPage, perPage } = this.state;
        return (currentPage - 1) * perPage;
    };

    getRowsForPage = () => {
        const { currentPage, perPage } = this.state;
        // const { perPage } = this.props;
        let rows = this.getFilteredData();
        this.filteredTotal = rows.length;

        // Get rows for current page
        const start = this.getStartRowNumber();
        if (!this.isAjax()) {
            const end = currentPage * perPage;
            rows = _slice(rows, start, end);
        }

        return rows;
    };

    renderTbody = () => {
        const {
            columns,
            rowKey,
            callbacks,
            onRowClick,
            isRowNumber,
            isSimpleCheckboxes,
            ajaxLimit,
            name,
            showRowClickable,
            setRowClass,
        } = this.props;
        const { selectedRows } = this.state;
        let rows = this.getRowsForPage();
        const start = this.getStartRowNumber();

        // Render column values
        rows = rows.map((item, index) => {
            const key = item[rowKey].toString();

            const row = columns.map((column, index1) => {
                const value = _isFunction(column.render)
                    ? column.render(item[column.name], item, callbacks)
                    : item[column.name];
                let className = column.class || '';

                // Add special classes
                if (_isFunction(column.setClass)) {
                    className += ` ${column.setClass(item[column.name], item)}`;
                }

                // Add special style
                let tdStyle = {};
                if (_isFunction(column.setStyle)) {
                    tdStyle = column.setStyle(item[column.name], item);

                    // Remove backgroundColor and color for selected rows
                    if (selectedRows.indexOf(key) !== -1) {
                        delete tdStyle.backgroundColor;
                        delete tdStyle.color;
                    }
                }

                const props = {
                    className,
                    key: column.name,
                    style: tdStyle,
                };

                if (onRowClick) {
                    props.onClick = this.onRowClick.bind(null, item);
                }

                /* eslint-disable react/no-array-index-key */
                return (
                    <td key={index1} {...props}>
                        {value}
                    </td>
                );
            });

            // Is Number?
            if (isRowNumber) {
                row.unshift(
                    <td key="number_column" className={style.numberColumn}>
                        {start + index + 1}
                    </td>
                );
            }
            // Is Checkbox?
            if (this.isShowCheckboxes()) {
                const checked = selectedRows.indexOf(key) !== -1;
                const classname = classnames(style.checkboxColumn, {
                    [`${style.checkboxColumnSimple}`]: isSimpleCheckboxes,
                });
                row.unshift(
                    <td key="checkbox_column" className={classname}>
                        <Disabled
                            number={ajaxLimit}
                            disabled={this.isAjax()}
                            placement="right"
                            size={null}
                        >
                            <label htmlFor={`${name}_row_${key}`}>
                                <input
                                    type="checkbox"
                                    value={key}
                                    checked={checked}
                                    onChange={this.onSelectRow}
                                    disabled={this.isAjax()}
                                    id={`${name}_row_${key}`}
                                />
                            </label>
                        </Disabled>
                    </td>
                );
            }

            const className = classnames(
                {
                    [style.selected]: selectedRows.includes(key),
                    [style.clickableRow]:
                        !selectedRows.includes(key) && onRowClick && showRowClickable,
                },
                setRowClass && setRowClass(item)
            );

            return (
                <tr key={key} className={className}>
                    {row}
                </tr>
            );
        });

        return rows;
    };

    renderPaginator = () => {
        const { perPage, currentPage } = this.state;
        const total = Math.ceil(this.getFilteredTotal() / perPage);

        if (total <= 1) {
            return null;
        }

        return (
            <Paginator
                total={total}
                currentPage={currentPage}
                onPageChange={this.gotoPage}
                className={style.paginator}
            />
        );
    };

    getFilters = () => {
        const { columns, ajaxLimit } = this.props;
        const { filters: stateFilters } = this.state;
        // Don't show filter if there is no data
        if (this.getTotal() === 0) {
            return {};
        }

        if (!_find(columns, { filter: true })) {
            return {};
        }

        const filters = {};
        _forEach(columns, column => {
            if (_has(column, 'filter') && column.filter === true) {
                const disabled = this.isAjax() && !column.ajax;

                filters[column.name] = (
                    <div key={column.name} style={{ marginBottom: '.5em' }}>
                        <span>{column.label}</span>
                        <Disabled
                            number={ajaxLimit}
                            disabled={disabled}
                            display="block"
                            placement="bottom"
                        >
                            <Filter
                                column={column.name}
                                value={stateFilters[column.name]}
                                onFilterChange={this.onFilterChange}
                                settings={column.filterSettings}
                                disabled={disabled}
                            />
                        </Disabled>
                    </div>
                );
            }
        });

        return filters;
    };

    renderListFilters = () => {
        const { columns } = this.props;
        const filters = this.getFilters();
        if (_isEmpty(filters)) {
            return null;
        }

        const result = [];
        _forEach(columns, column => {
            if (filters[column.name]) {
                result.push(filters[column.name]);
            }
        });

        return result;
    };

    renderListSorts = () => {
        const { columns } = this.props;
        const { isAscentOrder, orderBy } = this.state;
        const options = [];
        _forEach(columns, column => {
            if (column.sort && (column.ajax || !this.isAjax())) {
                options.push(
                    <option key={`asc_${column.name}`} value={`asc_${column.name}`}>
                        {`Sort by ${column.label} (A-Z)`}
                    </option>
                );
                options.push(
                    <option key={`desc_${column.name}`} value={`desc_${column.name}`}>
                        {`Sort by ${column.label} (Z-A)`}
                    </option>
                );
            }
        });

        if (options.length === 0) {
            return null;
        }

        const onListSortChange = event => {
            const [order, ...other] = event.target.value.split('_');
            this.onOrder(other.join('_'), order);
        };

        const value = `${isAscentOrder ? 'asc' : 'desc'}_${orderBy}`;

        return (
            <select className="form-control input-sm" value={value} onChange={onListSortChange}>
                {options}
            </select>
        );
    };

    renderList = () => {
        const { renderAsList, rowKey } = this.props;
        if (!_isFunction(renderAsList)) {
            return null;
        }

        const rows = this.getRowsForPage();
        const start = this.getStartRowNumber();

        // Render column values
        return rows.map((row, index) => {
            const key = row[rowKey].toString();

            return <div key={key}>{renderAsList(row, start + index + 1)}</div>;
        });
    };

    renderAsList = () => {
        const { listTemplate } = this.props;
        const { hardLoading, loading } = this.state;

        const Template = listTemplate;

        const templateProps = {
            tableProps: this.props,
            perPageOptions: this.renderPerPageOptions(),
            reloadDataButton: this.renderReloadDataButton(),
            count: this.renderCount(this.getFilteredTotal(), this.getTotal()),
            list: this.renderList(),
            paginator: this.renderPaginator(),
            filterBlock: this.renderListFilters(),
            filters: this.getFilters(),
            sortBlock: this.renderListSorts(),
            rows: this.getRowsForPage(),
            startNumber: this.getStartRowNumber() + 1,
            registerFilterFunction: this.registerFilterFunction,
        };

        return (
            <Loader loading={loading && hardLoading}>
                <Template {...templateProps} />
            </Loader>
        );
    };

    render() {
        const {
            callbacks,
            renderAsList,
            columns,
            isRowNumber,
            noRecordsMessage,
            showBottomPaginator,
            ajaxLimit,
            selectedRows,
            rowActions,
            wrapperClassName,
            className,
        } = this.props;

        const { loading, hardLoading } = this.state;

        if (renderAsList) {
            return this.renderAsList();
        }

        const thead = this.renderThead();
        const filter = this.renderFilter();
        const tbody = this.renderTbody();
        const buttons = this.renderButtons();
        const count = this.renderCount(this.getFilteredTotal(), this.getTotal());

        // Calculate the number of columns
        let colSpan = columns.length;
        if (isRowNumber) {
            colSpan += 1;
        }
        if (this.isShowCheckboxes()) {
            colSpan += 1;
        }
        // Compose the message when there is no filtered data
        const noDataMessage =
            this.filteredTotal === 0 ? (
                <tr>
                    <td colSpan={colSpan}>{noRecordsMessage}</td>
                </tr>
            ) : null;

        let bottomPaginator = null;
        const paginator = this.renderPaginator();
        if (paginator && showBottomPaginator) {
            bottomPaginator = (
                <div className={classnames('clearfix', style.bottomBar)}>
                    <div className="float-right">{paginator}</div>
                </div>
            );
        }

        const showTopBar = buttons || count || paginator;

        return (
            <div className={`${style.tableWrapper} ${wrapperClassName}`}>
                <Actions
                    wrapperClassName={style.marginBottom}
                    actions={rowActions}
                    selectedRows={this.state.selectedRows}
                    afterAction={this.afterAction}
                    callbacks={callbacks}
                    disabled={this.isAjax()}
                    disabledNumber={ajaxLimit}
                />
                {showTopBar && (
                    <div className={classnames('clearfix', style.topBar)}>
                        {buttons}
                        {count}
                        <div className="float-right">{paginator}</div>
                    </div>
                )}
                <Loader loading={loading && hardLoading}>
                    <div className={style.tableScroll}>
                        <table className={`${className} ${style.table}`}>
                            <thead>
                                {thead}
                                {filter}
                            </thead>
                            <tbody>
                                {tbody}
                                {noDataMessage}
                            </tbody>
                        </table>
                    </div>
                </Loader>
                {bottomPaginator}
            </div>
        );
    }
}
