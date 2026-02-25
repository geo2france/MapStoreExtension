import React from "react";
import PropTypes from "prop-types";
import { FormControl } from "react-bootstrap";

const TextInputControl = ({ value, onChange }) => (
    <FormControl
        type="text"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
    />
);

TextInputControl.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func
};

TextInputControl.defaultProps = {
    value: "",
    onChange: () => {}
};

export default TextInputControl;
