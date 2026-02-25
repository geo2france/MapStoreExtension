import React from "react";
import PropTypes from "prop-types";
import { FormControl } from "react-bootstrap";

const DateInputControl = ({ value, onChange }) => (
    <FormControl
        type="date"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
    />
);

DateInputControl.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
};

DateInputControl.defaultProps = {
    value: "",
    onChange: () => {}
};

export default DateInputControl;
