import _pick from 'lodash/pick';

export default props =>
    _pick(props, [
        'autoComplete',
        'autoFocus',
        'checked',
        'disabled',
        'name',
        'onBlur',
        'onChange',
        'onDragStart',
        'onDrop',
        'onFocus',
        'placeholder',
        'type',
        'value',
        'style',
    ]);
