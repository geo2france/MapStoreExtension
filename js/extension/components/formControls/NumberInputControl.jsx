import React from "react";
import PropTypes from "prop-types";
import { FormControl } from "react-bootstrap";

const NumberInputControl = ({ value, onChange }) => (
    <FormControl
        type="number"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
    />
);

NumberInputControl.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func
};

NumberInputControl.defaultProps = {
    value: "",
    onChange: () => {}
};

export default NumberInputControl;
