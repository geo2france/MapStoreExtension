export const PANEL_EDITOR_SET_EDIT_MODE = "PANEL_EDITOR:SET_EDIT_MODE";
export const PANEL_EDITOR_SET_SELECTED_RESPONSE_INDEX = "PANEL_EDITOR:SET_SELECTED_RESPONSE_INDEX";
export const PANEL_EDITOR_SET_SELECTED_FEATURE_INDEX = "PANEL_EDITOR:SET_SELECTED_FEATURE_INDEX";
export const PANEL_EDITOR_SET_FORM_VALUES = "PANEL_EDITOR:SET_FORM_VALUES";
export const PANEL_EDITOR_UPDATE_FORM_VALUE = "PANEL_EDITOR:UPDATE_FORM_VALUE";
export const PANEL_EDITOR_RESET = "PANEL_EDITOR:RESET";
export const PANEL_EDITOR_SET_SAVE_STATUS = "PANEL_EDITOR:SET_SAVE_STATUS";
export const PANEL_EDITOR_SET_SAVE_MESSAGE = "PANEL_EDITOR:SET_SAVE_MESSAGE";
export const PANEL_EDITOR_SET_VALIDATION_ERRORS = "PANEL_EDITOR:SET_VALIDATION_ERRORS";
export const PANEL_EDITOR_SET_MAPINFO_WAS_ENABLED = "PANEL_EDITOR:SET_MAPINFO_WAS_ENABLED";
export const PANEL_EDITOR_SETUP = "PANEL_EDITOR:SETUP";
export const PANEL_EDITOR_REQUEST_SAVE = "PANEL_EDITOR:REQUEST_SAVE";
export const PANEL_EDITOR_REQUEST_DELETE = "PANEL_EDITOR:REQUEST_DELETE";
export const PANEL_EDITOR_REQUEST_START_EDIT = "PANEL_EDITOR:REQUEST_START_EDIT";
export const PANEL_EDITOR_REQUEST_CANCEL_EDIT = "PANEL_EDITOR:REQUEST_CANCEL_EDIT";

export const setEditMode = (enabled) => ({
    type: PANEL_EDITOR_SET_EDIT_MODE,
    enabled: !!enabled
});

export const setSelectedResponseIndex = (index) => ({
    type: PANEL_EDITOR_SET_SELECTED_RESPONSE_INDEX,
    index: Number.isFinite(index) ? index : 0
});

export const setSelectedFeatureIndex = (index) => ({
    type: PANEL_EDITOR_SET_SELECTED_FEATURE_INDEX,
    index: Number.isFinite(index) ? index : 0
});

export const setFormValues = (values = {}) => ({
    type: PANEL_EDITOR_SET_FORM_VALUES,
    values
});

export const updateFormValue = (name, value) => ({
    type: PANEL_EDITOR_UPDATE_FORM_VALUE,
    name,
    value
});

export const resetPanelEditorState = () => ({
    type: PANEL_EDITOR_RESET
});

export const setSaveStatus = (status = "idle") => ({
    type: PANEL_EDITOR_SET_SAVE_STATUS,
    status
});

export const setSaveMessage = (message = "") => ({
    type: PANEL_EDITOR_SET_SAVE_MESSAGE,
    message
});

export const setValidationErrors = (errors = {}) => ({
    type: PANEL_EDITOR_SET_VALIDATION_ERRORS,
    errors
});

export const setMapInfoWasEnabled = (enabled) => ({
    type: PANEL_EDITOR_SET_MAPINFO_WAS_ENABLED,
    enabled: !!enabled
});

export const setup = (pluginCfg = {}) => ({
    type: PANEL_EDITOR_SETUP,
    pluginCfg
});

export const requestSave = () => ({
    type: PANEL_EDITOR_REQUEST_SAVE
});

export const requestDelete = () => ({
    type: PANEL_EDITOR_REQUEST_DELETE
});

export const requestStartEdit = () => ({
    type: PANEL_EDITOR_REQUEST_START_EDIT
});

export const requestCancelEdit = () => ({
    type: PANEL_EDITOR_REQUEST_CANCEL_EDIT
});
