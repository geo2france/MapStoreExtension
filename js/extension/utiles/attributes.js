const isObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);

const DEFAULT_FIELD_TYPE = "string";
const normalizeFieldKey = (fieldName = "") =>
    String(fieldName || "")
        .trim()
        .toLowerCase()
        // Remove optional namespace/table prefix (e.g. schema.field or ns:field).
        .replace(/^.*[.:]/, "");

const normalizeLayerConfig = (layerConfig = {}, layerName = "") => ({
    name: layerConfig?.name || layerName,
    ...layerConfig
});

export const getLayersList = (pluginConfig = {}) => {
    const { layers } = pluginConfig || {};
    if (Array.isArray(layers)) {
        return layers.map((layer) => normalizeLayerConfig(layer, layer?.name));
    }
    if (isObject(layers)) {
        return Object.keys(layers).map((layerName) =>
            normalizeLayerConfig(layers[layerName], layerName)
        );
    }
    return [];
};

export const getLayerNameFromResponse = (response = {}) =>
    response?.layer?.name
    || response?.queryParams?.query_layers
    || response?.queryParams?.layers
    || "";

export const getLayerTitleFromResponse = (response = {}) =>
    response?.layerMetadata?.title || getLayerNameFromResponse(response);

const hasOwn = (objectValue = {}, key = "") =>
    Object.prototype.hasOwnProperty.call(objectValue, key);

const toDisplayValue = (value) =>
    value === null || value === undefined ? "" : String(value);

export const getFeatureOptionLabel = (feature = {}, pluginConfig = {}, featureIndex = 0) => {
    const featureProperties = isObject(feature?.properties) ? feature.properties : {};
    const configuredLabel = pluginConfig?.featureFielLabel || pluginConfig?.featureFieldLabel;
    const featureNumber = featureIndex + 1;
    const labelKey = configuredLabel || "id";

    let labelValue = "";
    if (configuredLabel) {
        labelValue = hasOwn(featureProperties, configuredLabel)
            ? toDisplayValue(featureProperties[configuredLabel])
            : "";
    } else if (hasOwn(featureProperties, "id")) {
        labelValue = toDisplayValue(featureProperties.id);
    } else if (feature?.id !== null && feature?.id !== undefined) {
        labelValue = toDisplayValue(feature.id);
    }

    const valueSuffix = labelValue ? ` ${labelValue}` : "";
    return `[${featureNumber}] - (${labelKey})${valueSuffix}`;
};

// Accept both compact tuple and object field definitions from config.
const normalizeFieldEntry = (fieldEntry = []) => {
    if (Array.isArray(fieldEntry)) {
        const [name, label, type, editable, required, roles, options] = fieldEntry;
        return {
            name,
            label: label || name,
            type: type || DEFAULT_FIELD_TYPE,
            editable: editable !== false,
            required: !!required,
            roles: Array.isArray(roles) ? roles : [],
            options: Array.isArray(options) ? options : []
        };
    }

    if (isObject(fieldEntry)) {
        return {
            name: fieldEntry.name,
            label: fieldEntry.label || fieldEntry.name,
            type: fieldEntry.type || DEFAULT_FIELD_TYPE,
            editable: fieldEntry.editable !== false,
            required: !!fieldEntry.required,
            roles: Array.isArray(fieldEntry.roles) ? fieldEntry.roles : [],
            options: Array.isArray(fieldEntry.options) ? fieldEntry.options : []
        };
    }

    return null;
};

export const getConfiguredFields = (layerConfig = {}) => {
    const rawFields = Array.isArray(layerConfig?.fields) ? layerConfig.fields : [];
    return rawFields.map(normalizeFieldEntry).filter((entry) => !!entry?.name);
};

export const getHiddenFields = (layerConfig = {}) =>
    Array.isArray(layerConfig?.hidden) ? layerConfig.hidden : [];

const inferFieldType = (value) => {
    if (typeof value === "number") {
        return "number";
    }
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return "date";
    }
    return DEFAULT_FIELD_TYPE;
};

export const resolveFieldDefinition = (fieldName, fieldValue, layerConfig = {}) => {
    const fields = getConfiguredFields(layerConfig);
    const normalizedInputFieldName = normalizeFieldKey(fieldName);
    // Match by exact name first, then by normalized key to absorb naming differences from GFI.
    const configuredField = fields.find((field) =>
        field.name === fieldName
        || normalizeFieldKey(field.name) === normalizedInputFieldName
    );
    console.log(layerConfig);
    if (configuredField) {
        return configuredField;
    }

    return {
        name: fieldName,
        label: fieldName,
        type: inferFieldType(fieldValue),
        editable: true,
        required: false,
        roles: [],
        options: []
    };
};

export const getVisibleFieldNames = (attributes = {}, layerConfig = {}) => {
    const hiddenFields = getHiddenFields(layerConfig);
    // Visibility is only controlled by the hidden list; editability is resolved later.
    return Object.keys(attributes).filter((fieldName) => !hiddenFields.includes(fieldName));
};

export const getWfsUrl = (pluginConfig = {}, layerConfig = {}) => {
    const explicitWfsUrl = layerConfig?.wfsUrl || pluginConfig?.wfsUrl;
    if (explicitWfsUrl) {
        return explicitWfsUrl;
    }

    const geoserver = pluginConfig?.geoserver;
    if (!geoserver) {
        return null;
    }

    const base = geoserver.startsWith("http://") || geoserver.startsWith("https://")
        ? geoserver
        : `https://${geoserver}`;
    const normalizedBase = base.replace(/\/+$/, "");

    // Normalize common geoserver base URL variants to a canonical WFS endpoint.
    if (/\/wfs$/i.test(normalizedBase)) {
        return normalizedBase;
    }
    if (/\/geoserver$/i.test(normalizedBase)) {
        return `${normalizedBase}/wfs`;
    }
    if (/\/geoserver\//i.test(normalizedBase)) {
        return `${normalizedBase}/wfs`;
    }
    return `${normalizedBase}/geoserver/wfs`;
};
