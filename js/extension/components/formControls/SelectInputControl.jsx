import React from "react";
import PropTypes from "prop-types";
import { FormControl } from "react-bootstrap";

const normalizeOption = (option) => (typeof option === "object" ? option : { value: option, label: option });

const SelectInputControl = ({ value, options, includeEmptyOption, onChange }) => (
    <FormControl
        componentClass="select"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
    >
        {includeEmptyOption ? <option value="" /> : null}
        {options.map((option) => {
            const normalizedOption = normalizeOption(option);
            return (
                <option key={normalizedOption.value} value={normalizedOption.value}>
                    {normalizedOption.label}
                </option>
            );
        })}
    </FormControl>
);

SelectInputControl.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    options: PropTypes.array,
    includeEmptyOption: PropTypes.bool,
    onChange: PropTypes.func
};

SelectInputControl.defaultProps = {
    value: "",
    options: [],
    includeEmptyOption: false,
    onChange: () => {}
};

export default SelectInputControl;
