import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Input from '../../react-chayns-input/component/Input';
import Formatter from '../utils/Formatter';

export default class FormattedInput extends Component {
    lastSend = null;

    constructor(props) {
        super(props);

        this.formatter = props.initialFormatter;

        this.lastSend = props.defaultValue;
        this.state = {
            value: this.formatter.format(props.defaultValue) || '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeEvent = this.handleChangeEvent.bind(this);
    }

    componentDidUpdate() {
        if (this.selection && this.input) {
            this.input.setSelectionRange(
                this.selection.start,
                this.selection.start
            );
        }

        this.selection = null;
    }

    handleInputChange = (value, ...args) => {
        const { formatter } = this;
        const { value: oldValue } = this.state;

        if (!(formatter instanceof Formatter)) {
            return;
        }

        const { selectionStart, selectionEnd } = this.input;
        const selection = {
            start: selectionStart,
            end: selectionEnd,
        };
        const validationInfo = formatter.validate(value, selection);
        const newValue = validationInfo.valid ? value : oldValue;

        if (!validationInfo.valid) {
            this.selection = validationInfo.selection || null;
        }

        this.setState({
            value: newValue,
        });

        if (validationInfo.valid) {
            const parsedValue = formatter.parse(newValue);
            this.handleChangeEvent(parsedValue, ...args);
        }
    };

    handleChangeEvent = (value, ...args) => {
        const { onChange } = this.props;

        if (onChange && value !== this.lastSend) {
            this.lastSend = value;
            onChange(value, ...args);
        }
    };

    handleChange = (value, ...args) => {
        const { formatter } = this;

        if (!(formatter instanceof Formatter)) {
            return;
        }

        const parsedValue = formatter.parse(value);

        this.setState({
            value: formatter.format(parsedValue),
        });

        this.handleChangeEvent(parsedValue, ...args);
    };

    handleEnter = (value, ...args) => {
        const { onEnter } = this.props;
        if (onEnter) {
            const { formatter } = this;

            if (!(formatter instanceof Formatter)) {
                return;
            }

            const parsedValue = formatter.parse(value);

            onEnter(parsedValue, ...args);
        }
    };

    render() {
        const { value } = this.state;
        const {
            defaultValue,
            initialFormatter,
            inputRef,
            ...props
        } = this.props;

        if (!(initialFormatter instanceof Formatter)) {
            return null;
        }

        return (
            <Input
                {...props}
                inputRef={(ref) => {
                    this.input = ref;

                    if (inputRef) {
                        inputRef(ref);
                    }
                }}
                value={value}
                onChange={this.handleInputChange}
                onBlur={this.handleChange}
                onEnter={this.handleEnter}
            />
        );
    }
}

FormattedInput.propTypes = {
    initialFormatter: PropTypes.instanceOf(Formatter).isRequired,
    onChange: PropTypes.func,
    onEnter: PropTypes.func,
    inputRef: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    defaultValue: PropTypes.any,
};

FormattedInput.defaultProps = {
    onChange: null,
    onEnter: null,
    defaultValue: null,
    inputRef: null,
};

FormattedInput.displayName = 'FormattedInput';
