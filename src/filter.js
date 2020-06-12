/* eslint-disable react/destructuring-assignment */
import PropTypes from 'prop-types';
import React from 'react';
import FilterText from './filterText';
import FilterSelectbox from './filterSelectbox';
import FilterDate from './filterDate';

// **********************************************************************
// Table: Filter
// **********************************************************************
export default class Filter extends React.Component {
    static propTypes = {
        column: PropTypes.string.isRequired,
        value: PropTypes.node.isRequired,
        onFilterChange: PropTypes.func.isRequired,
        settings: PropTypes.instanceOf(Object),
    };

    static defaultProps = {
        settings: { type: 'text' },
    };

    render() {
        const { settings } = this.props;
        switch (settings.type) {
            case 'text':
            case 'equal':
                return <FilterText {...this.props} />;

            case 'selectbox':
                return <FilterSelectbox {...this.props} />;

            case 'date':
                return <FilterDate {...this.props} />;

            default:
                console.warn(`There is no "${settings.type}" filter type`);
                return null;
        }
    }
}
