import React from "react";
import PropTypes from "prop-types";
import { FormControl } from "react-bootstrap";

const TextAreaControl = ({ value, onChange }) => (
    <FormControl
        componentClass="textarea"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
    />
);

TextAreaControl.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
};

TextAreaControl.defaultProps = {
    value: "",
    onChange: () => {}
};

export default TextAreaControl;
