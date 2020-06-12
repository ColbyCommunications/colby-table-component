/* eslint-disable react/destructuring-assignment */
import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import ClickButton from '@colbycommunications/colby-click-button-component';
import domOnlyProps from './domOnlyProps.js';

import style from './actionForm.css';

class Form extends React.Component {
    static propTypes = {
        fields: PropTypes.instanceOf(Object).isRequired,
        handleSubmit: PropTypes.func.isRequired,
        submitting: PropTypes.bool.isRequired,
        fieldsArray: PropTypes.instanceOf(Array).isRequired,
        submitButtonProps: PropTypes.instanceOf(Object).isRequired,
    };

    clicked = () => {
        const { submitButtonProps, handleSubmit } = this.props;
        if (!submitButtonProps.isDisabled) {
            handleSubmit();
        }
    };

    renderField = (field, fieldInfo) => {
        switch (fieldInfo.type) {
            case 'text':
                return (
                    <input
                        className="form-control input-sm"
                        type="text"
                        placeholder={fieldInfo.label || fieldInfo.name}
                        {...domOnlyProps(field)}
                    />
                );
            case 'selectbox': {
                const options = fieldInfo.options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ));

                return (
                    <select
                        {...domOnlyProps(field)}
                        className="form-control input-sm"
                        id={`row_actions_${field.name}_select_box`}
                    >
                        {options}
                    </select>
                );
            }
            case 'password': {
                return (
                    <input
                        className="form-control input-sm"
                        type="password"
                        placeholder={fieldInfo.label || fieldInfo.name}
                    />
                );
            }
            default: {
                return null;
            }
        }
    };

    render() {
        const { fields, fieldsArray, submitButtonProps, submitting } = this.props;

        const rows = fieldsArray.map(fieldInfo => {
            const field = fields[fieldInfo.name];

            return (
                <span key={fieldInfo.name}>
                    <div
                        className={`form-group ${style.wrapper} ${
                            field.touched && field.error ? 'has-error' : ''
                        }`}
                    >
                        {this.renderField(field, fieldInfo)}
                        {field.touched && field.error && (
                            <div className={style.error}>{field.error}</div>
                        )}
                    </div>{' '}
                </span>
            );
        });

        const isLoading = submitting || submitButtonProps.isLoading;

        return (
            <span>
                {rows}
                <ClickButton
                    {...submitButtonProps}
                    isLoading={isLoading}
                    className="btn btn-primary btn-sm"
                    onClick={this.clicked}
                    isConfirm={false}
                />
            </span>
        );
    }
}

export default reduxForm({
    form: 'actionForm',
})(Form);
