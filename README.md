# colby-table-component

A table react component that can sort, filter, and represent dynamic data.

## Props

| Name                   | Description                                                                                                                                                                              | Type     | Default Value                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| name                   | The name for the table. It's used when saving the table state. <i>e.g.</i> sortable columns, filters, etc... If there is only one table on the page it's not necessary to assign a name. | string   | " "                                                                      |
| wrapperClassName       | The class name of the wrapper div that contains the table.                                                                                                                               | string   | " "                                                                      |
| className              | The class name of the table.                                                                                                                                                             | string   | "table table-condensed table-striped table-bordered table-responsive-md" |
| columns                | An array of objects representing columns                                                                                                                                                 | array    | []                                                                       |
| data                   | An array of data                                                                                                                                                                         | array    | []                                                                       |
| rowKey                 | A key with a unique value, from "data" above. This key must exist.                                                                                                                       | string   | "id"                                                                     |
| isRowNumber            | Show row number or not?                                                                                                                                                                  | bool     | false                                                                    |
| rowActions             | An array of objects containing JS functions that can be applied to selected rows.                                                                                                        | array    | []                                                                       |
| selectedRows           | An array of rows that will be selected by default rows.                                                                                                                                  | array    | []                                                                       |
| rowSelectedCallback    | A function that will be called afterr changing selected rows rows.                                                                                                                       | function | () => {}                                                                 |
| didMount               | A function that will be called after the table component mounts                                                                                                                          | function | () => {}                                                                 |
| orderBy                | Column name that is used for default sorting, if left blank, the first sortable column will be used.                                                                                     | string   | " "                                                                      |
| isAscentOrder          | Use ascending order or not?                                                                                                                                                              | bool     | true                                                                     |
| perPage                | Number of rows per page                                                                                                                                                                  | number   | 50                                                                       |
| showPerPageOptions     | Show options to change number of rows per page? page                                                                                                                                     | bool     | true                                                                     |
| perPageOptions         | Sets the available options for how many rows per page.                                                                                                                                   | array    | []                                                                       |
| hideShowingRowsSummary | Hide "Showing x of y total rows" at top of table?                                                                                                                                        | bool     | false                                                                    |
| constantFilter         | A filter that will be applied to the table permanently.                                                                                                                                  | object   | {}                                                                       |
| showBottomPaginator    | Display a paginator below the table or not?                                                                                                                                              | bool     | true                                                                     |
| saveState              | Save the table's state, sort and filter params, in local storage?                                                                                                                        | bool     | true                                                                     |
| callbacks              | An object with callback functions that can be called when rendering columns and in rowActions                                                                                            | object   | {}                                                                       |
| noRecordsMessage       | The message shown when there are no records.                                                                                                                                             | string   | No matching records found                                                |
| renderAsList           | A function that renders the table as a list when called.                                                                                                                                 | function | NULL                                                                     |
| listTemplate           | Template/layout component that shows the list.                                                                                                                                           | function | \*default template                                                       |
| onRowClick             | A click event handler for a whole row that accepts row objects.                                                                                                                          | function | NULL                                                                     |
| showRowClickable       | If true, and onRowClick is a function, then each row will have a clickable style.                                                                                                        | bool     | true                                                                     |
| setRowClass            | If this is a function then it will set a className for every row when called. The row can be passed into the function.                                                                   | function | NULL                                                                     |
| useOnlyNameForHash     | Generates a hash based solely on the table name.                                                                                                                                         | bool     | false                                                                    |

## Column Examples

### Simple

```javascript
let columns = [
    { name: 'id', label: 'ID' },
    { name: 'name', label: 'Name', sort: true, filter: true },
    { name: 'email', label: 'Email', sort: true, filter: true },
];
```

### Robust

```javascript
let columns = [
    {
        name: 'image',
        label: '',
        render(value, item, callbacks) {
            return (
                <div className="text-center">
                    <img src={value} />
                </div>
            );
        },
    },
    {
        name: 'name',
        label: 'Name/Title',
        sort: true,
        filter: true,
        filterSettings: {
            type: 'text',
            custom: (row, value) => {
                return (
                    row.name.toLowerCase().includes(value.toLowerCase()) ||
                    row.title.toLowerCase().includes(value.toLowerCase())
                );
            },
        },
        render(value, item, callbacks) {
            return (
                <div>
                    <b>{value}</b>
                    <br />
                    <span className="text-muted">{item.title}</span>
                </div>
            );
        },
    },
    { name: 'email', label: 'E-mail', sort: true, filter: true },
];
```

## Row Action Example

An array of functions which can be applied for checked rows. For example:

```javascript
let rowActions = [
    { text: 'Do something', action: function() {} },
    { text: 'Do another thing', action: function() {} },
];
```

## Constant Filter

```javascript
<Table ... constantFilter={ isActive: 1 } />
```

## Usage

### Simple

```javascript
import React, { Component } from 'react';
import Table from '@colbycommunicaitons/colby-table-component';

export default () => {
    let data = [
        { id: 1, name: 'John', email: 'john@hotmail.com' },
        { id: 2, name: 'Jacob', email: 'jacob@aol.com' },
        { id: 3, name: 'Jingleheimer', email: 'jingleheimer@yahoo.com' },
        { id: 4, name: 'Smith', email: 'smith@gmail.com' },
    ];

    let columns = [
        { name: 'id', label: 'ID' },
        { name: 'name', label: 'Name' },
        { name: 'email', label: 'E-mail' },
    ];

    return <Table columns={columns} data={data} />;
};
```

### Sortable/Filterable

```javascript
import React, { Component } from 'react';
import Table from '@colbycommunicaitons/colby-table-component';

export default () => {
    let data = [
        { id: 1, name: 'Jack', date: '2019-04-25 20:23:05' },
        { id: 2, name: 'Jill', date: '2019-04-01 20:36:36' },
        { id: 3, name: 'Phil', date: '2019-06-30 20:12:11' },
    ];

    let columns = [
        { name: 'id', label: 'ID' },
        { name: 'name', label: 'Name', sort: true, filter: true },
        { name: 'date', label: 'Date', sort: true, filter: true, filterSettings: { type: 'date' } },
    ];

    return <Table columns={columns} data={data} orderBy="name" />;
};
```

### With Row Numbers

```javascript
import React, { Component } from 'react';
import Table from '@colbycommunicaitons/colby-table-component';

export default () => {
    let data = [
        { id: 1, name: 'Oddjob', email: 'oddjob@hotmail.com' },
        { id: 2, name: 'Jaws', email: 'jaws@aol.com' },
        { id: 3, name: 'Nick Nack', email: 'nicknack@yahoo.com' },
    ];
    let columns = [
        { name: 'id', label: 'ID' },
        { name: 'name', label: 'Name' },
        { name: 'email', label: 'E-mail' },
    ];

    return <Table columns={columns} data={data} isRowNumber />;
};
```

### Clickable Rows

```javascript
import React, { Component } from 'react';
import Table from '@colbycommunicaitons/colby-table-component';

export default () => {
    let data = [
        { id: 1, name: 'Athos', profession: 'Musketeer' },
        { id: 2, name: 'Porthos', profession: 'Musketeer' },
        { id: 3, name: 'Aramis', profession: 'Musketeer' },
    ];

    let columns = [
        { name: 'id', label: 'ID' },
        { name: 'name', label: 'Name' },
        { name: 'profession', label: 'Profession' },
    ];

    return (
        <Table
            columns={columns}
            data={data}
            showRowClickable
            onRowClick={row => {
                notification({
                    message: (
                        <div>
                            Clicked row: <pre>{JSON.stringify(row, null, 4)}</pre>
                        </div>
                    ),
                    inModal: true,
                });
            }}
        />
    );
};
```

### Highlighted Rows

```javascript
import React, { Component } from 'react';
import Table from '@colbycommunicaitons/colby-table-component';

export default () => {
    let data = [
        { id: 1, name: 'Harry', profession: 'Wizard' },
        { id: 2, name: 'Ron', profession: 'Witch' },
        { id: 3, name: 'Hermione', profession: 'Wizard' },
    ];

    let columns = [
        { name: 'id', label: 'ID' },
        { name: 'name', label: 'Name' },
        { name: 'profession', label: 'Profession' },
    ];

    return (
        <Table
            columns={columns}
            data={data}
            setRowClass={row => row.name === 'Ron' && 'table-success'}
        />
    );
};
```

### Different Rows Per Page

```javascript
import React, { Component } from 'react';
import Table from '@colbycommunicaitons/colby-table-component';

export default () => {
    let data = [
        { id: 1, name: 'Athos', profession: 'Musketeer' },
        { id: 2, name: 'Porthos', profession: 'Musketeer' },
        { id: 3, name: 'Aramis', profession: 'Musketeer' },
    ];

    let columns = [
        { name: 'id', label: 'ID' },
        { name: 'name', label: 'Name' },
        { name: 'profession', label: 'Profession' },
    ];

    return <Table columns={columns} data={data} perPage={2} perPageOptions={[2, 10]} />;
};
```

### Render As List

```javascript
import React, { Component } from 'react';
import Table from '@colbycommunicaitons/colby-table-component';

export default () => {
    let data = [
        { id: 1, name: 'Bill', email: 'Bill@hotmail.com' },
        { id: 2, name: 'Will', email: 'Will@aol.com' },
        { id: 3, name: 'Jill', email: 'jill@yahoo.com' },
    ];

    let columns = [
        { name: 'id', label: 'ID' },
        { name: 'name', label: 'Name', sort: true, filter: true },
        { name: 'email', label: 'E-mail', sort: true, filter: true },
    ];

    return (
        <Table
            columns={columns}
            data={data}
            renderAsList={(row, index) => (
                <div>
                    <h3>
                        {index}. {row.name}
                    </h3>
                    <a href={'mailto:' + row.email}>{row.email}</a>
                </div>
            )}
            showPerPageOptions={false}
            orderBy="name"
        />
    );
};
```

### Render As List with Custom Template

```javascript
import React, { Component } from 'react';
import Table from '@colbycommunicaitons/colby-table-component';
import CustomTemplate from './customTemplate.js';

export default () => {
    let data = [
        { id: 1, name: 'Bill', email: 'Bill@hotmail.com' },
        { id: 2, name: 'Will', email: 'Will@aol.com' },
        { id: 3, name: 'Jill', email: 'jill@yahoo.com' },
    ];

    let columns = [
        { name: 'id', label: 'ID' },
        { name: 'name', label: 'Name', sort: true, filter: true },
        { name: 'email', label: 'E-mail', sort: true, filter: true },
    ];

    return (
        <Table
            columns={columns}
            data={data}
            renderAsList={(row, index) => (
                <div>
                    <h3>
                        {index}. {row.name}
                    </h3>
                    <a href={'mailto:' + row.email}>{row.email}</a>
                </div>
            )}
            listTemplate={CustomTemplate}
            orderBy="name"
        />
    );
};
```

### Row Actions

```javascript
import React, { Component } from 'react';
import Table from '@colbycommunicaitons/colby-table-component';
import notification from '@colbycommunicaitons/colby-notification';

export default () => {
    let data = [
        { id: 1, name: 'Curly', profession: 'Stooge' },
        { id: 2, name: 'Larry', profession: 'Stooge' },
        { id: 3, name: 'Moe', profession: 'Stooge' },
    ];

    let columns = [
        { name: 'id', label: 'ID' },
        { name: 'name', label: 'Name' },
        { name: 'profession', label: 'Profession' },
    ];

    const rowActions = [
        { name: 'Do something', action: () => notification('Some action') },
        {
            name: 'Do something else',
            action: () => notification({ message: 'Another action', type: 'info' }),
        },
    ];

    return <Table columns={columns} data={data} rowActions={rowActions} />;
};
```

### Row Actions with Simple Checkboxes

```javascript
import React, { Component } from 'react';
import Table from '@colbycommunicaitons/colby-table-component';

export default () => {
    let data = [
        { id: 1, name: 'Kirk', email: 'kirk@gmail.com' },
        { id: 2, name: 'Spock', email: 'spock@gmail.com' },
        { id: 3, name: 'Bones', email: 'bones@gmail.com' },
    ];

    let columns = [
        { name: 'id', label: 'ID' },
        { name: 'name', label: 'Name' },
        { name: 'email', label: 'E-mail' },
    ];

    const rowActions = [
        { name: 'Do something', action: () => notification('Some action') },
        {
            name: 'Do something else',
            action: () => notification({ message: 'Another action', type: 'info' }),
        },
    ];

    return <Table columns={columns} data={data} rowActions={rowActions} isSimpleCheckboxes />;
};
```

### Robust Example

```javascript
import React, { Component } from 'react';
import Table from '@colbycommunicaitons/colby-table-component';
import robustData from './data.js';

export default () => {
    let columns = [
        {
            name: 'image',
            label: '',
            render(value, item, callbacks) {
                return (
                    <div className="text-center">
                        <img src={value} />
                    </div>
                );
            },
        },
        {
            name: 'name',
            label: 'Name/Title',
            sort: true,
            filter: true,
            filterSettings: {
                type: 'text',
                custom: (row, value) => {
                    return (
                        row.name.toLowerCase().includes(value.toLowerCase()) ||
                        row.title.toLowerCase().includes(value.toLowerCase())
                    );
                },
            },
            render(value, item, callbacks) {
                return (
                    <div>
                        <b>{value}</b>
                        <br />
                        <span className="text-muted">{item.title}</span>
                    </div>
                );
            },
        },
        { name: 'email', label: 'E-mail', sort: true, filter: true },
    ];

    const rowActions = [
        { name: 'Do something', action: () => notification('Some action') },
        {
            name: 'Do something else',
            action: () => notification({ message: 'Another action', type: 'info' }),
        },
    ];

    return (
        <Table
            columns={columns}
            data={robustData}
            rowActions={rowActions}
            isAscentOrder
            orderBy="name"
            noRecordsMessage="No employee records found"
        />
    );
};
```
