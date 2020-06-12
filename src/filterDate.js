/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/destructuring-assignment */
import PropTypes from 'prop-types';
import React from 'react';
import DatePicker from '@colbycommunications/colby-datepicker-component';
import moment from 'moment';
import classnames from 'classnames';

import style from './filter.css';

export default class FilterDate extends React.Component {
    static propTypes = {
        column: PropTypes.string.isRequired,
        value: PropTypes.array.isRequired,
        onFilterChange: PropTypes.func.isRequired,
        // settings: PropTypes.object.isRequired,
        disabled: PropTypes.bool.isRequired,
    };

    handleChangeStartDate = date => {
        const [, endDate] = this.getDates();
        this.props.onFilterChange(this.props.column, [date.format('YYYY-MM-DD'), endDate]);
    };

    handleChangeEndDate = date => {
        const [startDate] = this.getDates();
        this.props.onFilterChange(this.props.column, [startDate, date.format('YYYY-MM-DD')]);
    };

    getDates = () => {
        let [startDate, endDate] = typeof this.props.value !== 'undefined' ? this.props.value : [];

        if (startDate === '') {
            startDate = null;
        }

        if (endDate === '') {
            endDate = null;
        }

        return [startDate, endDate];
    };

    clearStartDate = () => {
        const [, endDate] = this.getDates();
        const newFilter = endDate ? [null, endDate] : '';
        this.props.onFilterChange(this.props.column, newFilter);
    };

    clearEndDate = () => {
        const [startDate] = this.getDates();
        const newFilter = startDate ? [startDate, null] : '';
        this.props.onFilterChange(this.props.column, newFilter);
    };

    renderDateField = ({ date, placeholder, onChange, onClear }) => {
        const value = date ? moment(date) : null;

        let cleanButton = null;
        if (value) {
            cleanButton = (
                <div className={style.cleanButton} onClick={onClear}>
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
                </div>
            );
        }

        const className = classnames([
            style.filterBlock,
            { [`${style.isFilter}`]: value },
            { 'has-warning': value },
        ]);

        return (
            <div className={className}>
                <DatePicker
                    className="form-control input-sm"
                    selected={value}
                    onChange={onChange}
                    dateFormat="MM/DD/YYYY"
                    placeholderText={placeholder}
                    disabled={this.props.disabled}
                />
                {cleanButton}
            </div>
        );
    };

    render() {
        const [startDate, endDate] = this.getDates();

        const startDatePicker = this.renderDateField({
            date: startDate,
            placeholder: 'from',
            onChange: this.handleChangeStartDate,
            onClear: this.clearStartDate,
        });

        const endDatePicker = this.renderDateField({
            date: endDate,
            placeholder: 'to',
            onChange: this.handleChangeEndDate,
            onClear: this.clearEndDate,
        });

        return (
            <div>
                <div className={style.margin}>{startDatePicker}</div>
                {endDatePicker}
            </div>
        );
    }
}
