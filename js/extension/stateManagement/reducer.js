import {
    PANEL_EDITOR_SET_EDIT_MODE,
    PANEL_EDITOR_SET_SELECTED_RESPONSE_INDEX,
    PANEL_EDITOR_SET_SELECTED_FEATURE_INDEX,
    PANEL_EDITOR_SET_FORM_VALUES,
    PANEL_EDITOR_UPDATE_FORM_VALUE,
    PANEL_EDITOR_RESET,
    PANEL_EDITOR_SET_SAVE_STATUS,
    PANEL_EDITOR_SET_SAVE_MESSAGE,
    PANEL_EDITOR_SET_VALIDATION_ERRORS,
    PANEL_EDITOR_SET_MAPINFO_WAS_ENABLED,
    PANEL_EDITOR_SETUP
} from "./actions";

const initialState = {
    editMode: false,
    selectedResponseIndex: 0,
    selectedFeatureIndex: 0,
    formValues: {},
    saveStatus: "idle",
    saveMessage: "",
    validationErrors: {},
    mapInfoWasEnabled: false,
    pluginCfg: {}
};

export default function panelEditor(state = initialState, action = {}) {
    switch (action.type) {
    case PANEL_EDITOR_SET_EDIT_MODE:
        return {
            ...state,
            editMode: action.enabled
        };
    case PANEL_EDITOR_SET_SELECTED_RESPONSE_INDEX:
        return {
            ...state,
            selectedResponseIndex: Math.max(0, action.index || 0),
            selectedFeatureIndex: 0
        };
    case PANEL_EDITOR_SET_SELECTED_FEATURE_INDEX:
        return {
            ...state,
            selectedFeatureIndex: Math.max(0, action.index || 0)
        };
    case PANEL_EDITOR_SET_FORM_VALUES:
        return {
            ...state,
            formValues: action.values || {}
        };
    case PANEL_EDITOR_UPDATE_FORM_VALUE:
        const nextValidationErrors = { ...(state.validationErrors || {}) };
        delete nextValidationErrors[action.name];
        return {
            ...state,
            formValues: {
                ...state.formValues,
                [action.name]: action.value
            },
            validationErrors: nextValidationErrors
        };
    case PANEL_EDITOR_SET_SAVE_STATUS:
        return {
            ...state,
            saveStatus: action.status || "idle"
        };
    case PANEL_EDITOR_SET_SAVE_MESSAGE:
        return {
            ...state,
            saveMessage: action.message || ""
        };
    case PANEL_EDITOR_SET_VALIDATION_ERRORS:
        return {
            ...state,
            validationErrors: action.errors || {}
        };
    case PANEL_EDITOR_SET_MAPINFO_WAS_ENABLED:
        return {
            ...state,
            mapInfoWasEnabled: !!action.enabled
        };
    case PANEL_EDITOR_SETUP:
        return {
            ...state,
            pluginCfg: action.pluginCfg || {}
        };
    case PANEL_EDITOR_RESET:
        return {
            ...initialState
        };
    default:
        return state;
    }
}
