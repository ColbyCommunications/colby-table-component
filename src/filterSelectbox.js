/* eslint-disable jsx-a11y/no-onchange */
/* eslint-disable react/destructuring-assignment */
import PropTypes from 'prop-types';
import React from 'react';

export default class FilterSelectbox extends React.Component {
    static propTypes = {
        column: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        onFilterChange: PropTypes.func.isRequired,
        settings: PropTypes.instanceOf(Object).isRequired,
        disabled: PropTypes.bool.isRequired,
    };

    onChange = event => {
        const { onFilterChange, column } = this.props;
        onFilterChange(column, event.target.value);
    };

    clearFilter = () => {
        const { onFilterChange, column } = this.props;
        onFilterChange(column, '');
    };

    render() {
        const { value: propValue, settings, disabled } = this.props;
        const value = typeof propValue !== 'undefined' ? propValue : '';

        const className = value === '' ? '' : 'has-warning';

        const options = settings.options.map(option => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ));
        options.unshift(<option key="empty" value="" />);

        return (
            <div className={`filter_block ${className}`}>
                <select
                    className="form-control input-sm"
                    onChange={this.onChange}
                    value={value}
                    disabled={disabled}
                >
                    {options}
                </select>
            </div>
        );
    }
}
