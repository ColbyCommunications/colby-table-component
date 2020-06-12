/* eslint-disable react/destructuring-assignment */
import PropTypes from 'prop-types';
import React from 'react';

export default class FilterSelected extends React.Component {
    static propTypes = {
        showSelected: PropTypes.bool.isRequired,
        onClick: PropTypes.func.isRequired,
        disabled: PropTypes.bool.isRequired,
    };

    onClick = () => {
        const { onClick } = this.props;
        onClick();
    };

    render() {
        const { showSelected, disabled } = this.props;
        const className = showSelected ? ' btn-warning' : '';

        return (
            <button
                type="button"
                className={`btn btn-outline-primary btn-sm ${className}`}
                onClick={this.onClick}
                title="Show only checked records"
                disabled={disabled}
            >
                <svg
                    className="bi bi-check"
                    width="1.5em"
                    height="1.5em"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z"
                    />
                </svg>
            </button>
        );
    }
}
