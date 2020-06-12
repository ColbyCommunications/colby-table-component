/* eslint-disable react/destructuring-assignment */
import PropTypes from 'prop-types';
import React from 'react';
// import Tooltip from '@colbycommunications/colby-tooltip-component';
import _omit from 'lodash/omit';

export default class DisabledMessage extends React.Component {
    static propTypes = {
        disabled: PropTypes.bool,
        number: PropTypes.number,
        children: PropTypes.node.isRequired,
    };

    static defaultProps = {
        disabled: false,
        number: 0,
    };

    render() {
        const { disabled, children, number } = this.props;
        if (!disabled) {
            return children;
        }

        const title = `Action available if less than ${number} rows`;

        /*
            <Tooltip
                size="medium"
                type="warning"
                {..._omit(this.props, ['disabled', 'number'])}
                title={title}
            >
                {children}
            </Tooltip>
        */
        return <div>Tootip</div>;
    }
}
