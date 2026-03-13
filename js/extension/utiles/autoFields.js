import {
    formatDateValue,
    getAutoFields,
    guessDateFormat
} from "./attributes";

export const isAutoFieldUpdatedOnSave = (autoField = {}) => {
    if (autoField?.onSave) {
        return true;
    }
    return autoField?.type === "date" || autoField?.type === "header";
};

const getValueByPath = (source = {}, path = "") =>
    String(path || "")
        .split(".")
        .filter(Boolean)
        .reduce((result, key) => (result === null || result === undefined ? undefined : result[key]), source);

export const resolveHeaderAutoValue = (currentUser = {}, source = "") => {
    const normalizedSource = String(source || "").trim();
    if (!normalizedSource) {
        return "";
    }

    return String(getValueByPath(currentUser, normalizedSource) || "");
};

export const getAutomaticFieldChanges = ({
    selectedAttributes = {},
    layerConfig = {},
    currentUser = {}
}) =>
    getAutoFields(layerConfig).reduce((acc, autoField) => {
        if (!isAutoFieldUpdatedOnSave(autoField)) {
            return acc;
        }

        const previousValue = selectedAttributes[autoField.name];
        let nextValue = previousValue;

        if (autoField.type === "date") {
            nextValue = formatDateValue(
                new Date(),
                autoField.source || guessDateFormat(previousValue)
            );
        }

        if (autoField.type === "header") {
            nextValue = resolveHeaderAutoValue(currentUser, autoField.source);
        }

        if (nextValue !== previousValue) {
            acc[autoField.name] = nextValue;
        }

        return acc;
    }, {});
