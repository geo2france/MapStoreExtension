import React from "react";
import TextAreaControl from "./TextAreaControl";
import NumberInputControl from "./NumberInputControl";
import DateInputControl from "./DateInputControl";
import SelectInputControl from "./SelectInputControl";
import TextInputControl from "./TextInputControl";

const renderInputByType = ({ type, value, onChange, options = [] }) => {
    switch (type) {
    case "textarea":
        return <TextAreaControl value={value} onChange={onChange} />;
    case "number":
        return <NumberInputControl value={value} onChange={onChange} />;
    case "date":
        return <DateInputControl value={value} onChange={onChange} />;
    case "list":
        return (
            <SelectInputControl
                value={value}
                options={options}
                includeEmptyOption
                onChange={onChange}
            />
        );
    default:
        return <TextInputControl value={value} onChange={onChange} />;
    }
};

export default renderInputByType;
