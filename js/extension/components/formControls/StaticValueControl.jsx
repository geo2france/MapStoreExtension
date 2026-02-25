import React from "react";
import PropTypes from "prop-types";
import { FormControl } from "react-bootstrap";

const StaticValueControl = ({ value }) => (
    <FormControl.Static>
        {String(value ?? "")}
    </FormControl.Static>
);

StaticValueControl.propTypes = {
    value: PropTypes.any
};

StaticValueControl.defaultProps = {
    value: ""
};

export default StaticValueControl;
