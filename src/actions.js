/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/no-onchange */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-underscore-dangle */
import PropTypes from 'prop-types';
import React from 'react';
import confirmation from '@colbycommunications/colby-confirm-component';

// Redux-form dependencies
import { createStore, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import Disabled from './disabledMessage.js';
import ActionForm from './actionForm.js';

const reducers = {
    form: formReducer,
};
const reducer = combineReducers(reducers);
const store = createStore(
    reducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default class Actions extends React.Component {
    static propTypes = {
        actions: PropTypes.instanceOf(Array).isRequired,
        selectedRows: PropTypes.instanceOf(Array).isRequired,
        afterAction: PropTypes.func.isRequired,
        callbacks: PropTypes.instanceOf(Object).isRequired,
        wrapperClassName: PropTypes.string.isRequired,
        disabled: PropTypes.bool.isRequired,
        disabledNumber: PropTypes.number.isRequired,
    };

    state = {
        selected: -1,
        isLoading: false,
        fields: [],
    };

    submit = values => {
        const { selected } = this.state;
        const { actions, selectedRows, callbacks, afterAction } = this.props;
        const selectedAction = actions[selected];
        const { isConfirm, confirmationMessage } = this.getSubmitButtonProps();

        return new Promise((resolve, reject) => {
            if (isConfirm) {
                confirmation(confirmationMessage)
                    .then(() => {
                        resolve();
                    })
                    .fail(() => {
                        reject();
                    });
            } else {
                resolve();
            }
        })
            .then(() => {
                if (selectedAction.validateAsync) {
                    return selectedAction.validateAsync(values);
                }
            })
            .then(() => {
                this.setState({
                    isLoading: true,
                });

                // Run the action
                return selectedAction.action(selectedRows, values, callbacks);
            })
            .then(() => {
                afterAction();
                this.setState({
                    selected: -1,
                    isLoading: false,
                    fields: [],
                });
            });
    };

    onChange = ({ target: { value } }) => {
        const { actions } = this.props;

        const id = value * 1;

        this.setState({
            selected: id,
            fields: [],
        });

        if (id !== -1) {
            const selectedAction = actions[id];
            if (selectedAction.getFields) {
                this.setState({
                    isLoading: true,
                });

                // getFields can return data or Promise. It doesn't matter
                Promise.resolve(selectedAction.getFields()).then(fields => {
                    this.setState({
                        fields,
                        isLoading: false,
                    });
                });
            }
        }
    };

    getSubmitButtonProps = () => {
        const { actions, selectedRows } = this.props;
        const { selected, isLoading } = this.state;

        const selectedAction = actions[selected];

        // Title
        let badge = null;
        if (selectedRows.length > 0) {
            badge = <span className="badge badge-light">{selectedRows.length}</span>;
        }
        const text =
            selectedAction && selectedAction.buttonText ? selectedAction.buttonText : 'Submit';
        const title = (
            <div>
                {text} {badge}
            </div>
        );

        // Disabled status
        const isDisabled = !(selectedAction && selectedRows.length > 0);

        // Is confirm?
        const isConfirm = !(selectedAction && selectedAction.isConfirm === false);

        // Confirmation message
        let confirmationMessage = 'Are you sure?';
        if (selectedAction && selectedAction.getConfirmationMessage) {
            confirmationMessage = selectedAction.getConfirmationMessage(selectedRows.length);
        }

        return {
            title,
            isDisabled,
            isConfirm,
            confirmationMessage,
            isLoading,
        };
    };

    render() {
        const { actions: propActions, wrapperClassName, disabledNumber, disabled } = this.props;
        const { selected, fields: stateFields } = this.state;
        if (propActions.length === 0) {
            return null;
        }

        // Action options
        /* eslint-disable react/no-array-index-key */
        const actions = propActions.map((action, index) => (
            <option key={index} value={index}>
                {action.name}
            </option>
        ));
        actions.unshift(
            <option key="-1" value="-1">
                - Choose Action -
            </option>
        );

        const currentAction = propActions[selected] || {};
        const fieldsArray = stateFields || [];
        const fields = fieldsArray.map(field => field.name);
        const validate = currentAction.validate;

        return (
            <div className={wrapperClassName}>
                <form className="form-inline">
                    <div className="form-group">
                        <span>Actions for selected rows:</span>
                        &nbsp;
                        <Disabled number={disabledNumber} disabled={disabled}>
                            <select
                                className="form-control input-sm"
                                id="row_actions_select_box"
                                value={selected}
                                onChange={this.onChange}
                                disabled={disabled}
                            >
                                {actions}
                            </select>
                        </Disabled>
                    </div>
                    &nbsp;
                    <ActionForm
                        store={store}
                        fields={fields}
                        validate={validate}
                        onSubmit={this.submit}
                        fieldsArray={fieldsArray}
                        submitButtonProps={this.getSubmitButtonProps()}
                    />
                </form>
            </div>
        );
    }
}
