/* eslint-disable react/destructuring-assignment */
import PropTypes from 'prop-types';
import React from 'react';

import style from './listTemplate.css';

export default class ListTemplate extends React.Component {
    static propTypes = {
        tableProps: PropTypes.instanceOf(Object).isRequired,
        list: PropTypes.node.isRequired,
        paginator: PropTypes.node.isRequired,
        sortBlock: PropTypes.node.isRequired,
        filterBlock: PropTypes.node.isRequired,
        count: PropTypes.node.isRequired,
        perPageOptions: PropTypes.node.isRequired,
        reloadDataButton: PropTypes.node.isRequired,
    };

    render() {
        const {
            filterBlock,
            sortBlock,
            count,
            paginator,
            reloadDataButton,
            perPageOptions,
            list,
            tableProps,
        } = this.props;
        const showLeftPanel = sortBlock || filterBlock;

        return (
            <div className="row">
                {showLeftPanel && (
                    <div className="col-lg-2 col-md-3 col-sm-4">
                        {sortBlock && (
                            <div className={style.sorting}>
                                <div>{sortBlock}</div>
                            </div>
                        )}

                        {filterBlock && (
                            <div>
                                <h4>Filters:</h4>
                                <div>{count}</div>
                                <div>{filterBlock}</div>
                            </div>
                        )}
                    </div>
                )}
                <div className={showLeftPanel ? 'col-lg-10 col-md-9 col-sm-8' : 'col-xs-12'}>
                    <div className={`clearfix ${style.topPaginator}`}>
                        {paginator}
                        <div className="pull-right">
                            {reloadDataButton}
                            {perPageOptions}
                        </div>
                    </div>

                    <div className={style.list}>
                        {list.length !== 0 ? list : tableProps.noRecordsMessage}
                    </div>

                    <div className={style.bottomPaginator}>{paginator}</div>
                </div>
            </div>
        );
    }
}
