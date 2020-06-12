/* eslint-disable react/destructuring-assignment */
import PropTypes from 'prop-types';
import React from 'react';

import style from './filter.css';

// **********************************************************************
// Table: Filter "Text"
// **********************************************************************
export default class FilterText extends React.Component {
    static propTypes = {
        column: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        onFilterChange: PropTypes.func.isRequired,
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
        const { value: valueProp, disabled } = this.props;
        const value = typeof valueProp !== 'undefined' ? valueProp : '';

        const className = value === '' ? '' : `has-warning ${style.isFilter}`;

        let cleanButton = null;
        if (value !== '') {
            cleanButton = (
                <button className={style.cleanButton} onClick={this.clearFilter} type="button">
                    <svg
                        className="bi bi-x"
                        width="1em"
                        height="1em"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            d="M11.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708-.708l7-7a.5.5 0 0 1 .708 0z"
                        />
                        <path
                            fillRule="evenodd"
                            d="M4.146 4.146a.5.5 0 0 0 0 .708l7 7a.5.5 0 0 0 .708-.708l-7-7a.5.5 0 0 0-.708 0z"
                        />
                    </svg>
                </button>
            );
        }

        return (
            <div className={`${className} ${style.filterBlock}`}>
                <input
                    type="text"
                    value={value}
                    className="form-control input-sm"
                    onChange={this.onChange}
                    disabled={disabled}
                />
                {cleanButton}
            </div>
        );
    }
}
