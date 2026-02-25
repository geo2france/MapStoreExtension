import Rx from "rxjs";
import { TOGGLE_CONTROL, SET_CONTROL_PROPERTY } from "@mapstore/actions/controls";
import { UPDATE_MAP_LAYOUT, updateDockPanelsList, updateMapLayout } from "@mapstore/actions/maplayout";
import { changeMapInfoFormat, changeMapInfoState, featureInfoClick } from "@mapstore/actions/mapInfo";
import { CLICK_ON_MAP } from "@mapstore/actions/map";
import { refreshLayers } from "@mapstore/actions/layers";
import {
    buildDeleteTransactionPayload,
    buildUpdateTransactionPayload,
    postWfsTransaction
} from "../requests/wfsTransaction";
import { getAreaOfCompetence } from "../requests/restrictedArea";
import { getLayerConfig, getLayersList, getVisibleFieldNames, getWfsUrl, resolveFieldDefinition } from "../utiles/attributes";
import { t } from "../utiles/i18n";
import { canEditField, canEditLayer, isRoleAllowed } from "../utiles/permissions";
import { extractAreaGeometry, isRestrictedAreaOperationAllowed } from "../utiles/restrictedArea";
import {
    PANEL_EDITOR_REQUEST_CANCEL_EDIT,
    PANEL_EDITOR_REQUEST_START_EDIT,
    PANEL_EDITOR_REQUEST_DELETE,
    PANEL_EDITOR_REQUEST_SAVE,
    setFormValues,
    setEditMode,
    setMapInfoWasEnabled,
    setSaveMessage,
    setSaveStatus,
    setValidationErrors
} from "./actions";
import { PANEL_EDITOR_CONTROL } from "../plugin/constants";
import {
    isActive,
    currentLocaleSelector,
    formValuesSelector,
    pluginCfgSelector,
    selectedFeatureSelector,
    selectedFeatureIdSelector,
    selectedFeaturePropertiesSelector,
    selectedResponseLayerNameSelector,
    userRoleSelector,
    mapInfoClickPointSelector,
    mapInfoClickLayerSelector,
    mapInfoFilterNameListSelector,
    mapInfoWasEnabledSelector,
    mapInfoOverrideParamsSelector,
    mapInfoItemIdSelector
} from "./selectors";

const isPanelEditorControlAction = (action = {}) =>
    action?.control === PANEL_EDITOR_CONTROL
    && (!action?.property || action?.property === "enabled");

const getCurrentPanelState = (state) => !!state?.controls?.[PANEL_EDITOR_CONTROL]?.enabled;

const getEnabledFromControlAction = (action = {}, state = {}) => {
    if (!isPanelEditorControlAction(action)) {
        return null;
    }
    if (action.type === TOGGLE_CONTROL) {
        return !getCurrentPanelState(state);
    }
    if (action.type === SET_CONTROL_PROPERTY) {
        return !!action?.value;
    }
    return null;
};

const getPanelSize = (state = {}) => {
    const pluginCfg = pluginCfgSelector(state);
    return Number.isFinite(pluginCfg?.size) ? pluginCfg.size : 420;
};

const isRequiredValueMissing = (value) =>
    value === null
    || value === undefined
    || (typeof value === "string" && value.trim() === "");

const getLayerToRefresh = (state = {}, selectedLayerName = "") =>
    (state?.layers?.flat || []).find((layer) =>
        layer?.name === selectedLayerName
        || layer?.id === selectedLayerName
    );

const getEditableFieldChanges = ({
    locale,
    userRole,
    selectedAttributes = {},
    formValues = {},
    layerConfig = {}
}) => {
    const visibleFields = getVisibleFieldNames(selectedAttributes, layerConfig);
    console.log(layerConfig);
    return visibleFields.reduce((acc, fieldName) => {
        const fieldDefinition = resolveFieldDefinition(
            fieldName,
            selectedAttributes[fieldName],
            layerConfig
        );

        if (!canEditField(userRole, fieldDefinition)) {
            return acc;
        }

        const nextValue = Object.prototype.hasOwnProperty.call(formValues, fieldName)
            ? formValues[fieldName]
            : selectedAttributes[fieldName];
        const previousValue = selectedAttributes[fieldName];

        if (fieldDefinition.required && isRequiredValueMissing(nextValue)) {
            acc.validationErrors[fieldName] = t(locale, "requiredField");
            return acc;
        }

        if (nextValue !== previousValue) {
            acc.changedAttributes[fieldName] = nextValue;
        }

        return acc;
    }, { changedAttributes: {}, validationErrors: {} });
};

const getTransactionParams = (state = {}) => {
    const pluginCfg = pluginCfgSelector(state);
    const selectedLayerName = selectedResponseLayerNameSelector(state);
    const selectedAttributes = selectedFeaturePropertiesSelector(state);
    const selectedFeatureId = selectedFeatureIdSelector(state);
    const userRole = userRoleSelector(state);
    const formValues = formValuesSelector(state);
    const locale = currentLocaleSelector(state);
    const layerConfig = getLayerConfig(pluginCfg, selectedLayerName) || {};
    console.log(layerConfig);
    const clickPoint = mapInfoClickPointSelector(state);
    const clickLayer = mapInfoClickLayerSelector(state);
    const filterNameList = mapInfoFilterNameListSelector(state);
    const overrideParams = mapInfoOverrideParamsSelector(state);
    const itemId = mapInfoItemIdSelector(state);
    const layerToRefresh = getLayerToRefresh(state, selectedLayerName);

    const typeName = layerConfig?.name || selectedLayerName;
    const idField = layerConfig?.idField || "id";
    const idValue = selectedAttributes?.[idField] ?? selectedFeatureId;
    const wfsUrl = getWfsUrl(pluginCfg, layerConfig);

    return {
        locale,
        typeName,
        idField,
        idValue,
        wfsUrl,
        formValues,
        userRole,
        selectedAttributes,
        layerConfig,
        selectedLayerName,
        clickPoint,
        clickLayer,
        filterNameList,
        overrideParams,
        itemId,
        layerToRefresh
    };
};

const getStartEditParams = (state = {}) => {
    const pluginCfg = pluginCfgSelector(state);
    const selectedLayerName = selectedResponseLayerNameSelector(state);
    const selectedFeature = selectedFeatureSelector(state);
    const selectedAttributes = selectedFeaturePropertiesSelector(state);
    const userRole = userRoleSelector(state);
    const locale = currentLocaleSelector(state);
    const layerConfig = getLayerConfig(pluginCfg, selectedLayerName) || {};
    console.log(layerConfig);
    const restrictedArea = layerConfig?.restrictedArea;

    return {
        locale,
        userRole,
        selectedFeature,
        selectedAttributes,
        layerConfig,
        restrictedArea
    };
};

// Reset editor transient state when the panel is closed.
export const syncIdentifyStateWithPanelEditorEpic = (action$, { getState }) =>
    action$
        .ofType(TOGGLE_CONTROL, SET_CONTROL_PROPERTY)
        .map((action) => ({ action, state: getState() }))
        .map(({ action, state }) => ({
            enabled: getEnabledFromControlAction(action, state),
            state
        }))
        .filter(({ enabled }) => enabled !== null)
        .switchMap(({ enabled, state }) => {
            if (enabled) {
                return Rx.Observable.empty();
            }
            return Rx.Observable.from([
                updateDockPanelsList(PANEL_EDITOR_CONTROL, "remove", "right"),
                setEditMode(false),
                setSaveStatus("idle"),
                setSaveMessage(""),
                setValidationErrors({}),
                changeMapInfoState(mapInfoWasEnabledSelector(state)),
                setMapInfoWasEnabled(false)
            ]);
        });

// Register this panel as a right dock panel when opened.
export const registerPanelEditorDockPanelEpic = (action$, { getState }) =>
    action$
        .ofType(TOGGLE_CONTROL, SET_CONTROL_PROPERTY)
        .map((action) => ({ action, state: getState() }))
        .map(({ action, state }) => ({
            enabled: getEnabledFromControlAction(action, state),
            state
        }))
        .filter(({ enabled }) => enabled === true)
        .switchMap(({ state }) => Rx.Observable.from([
            updateDockPanelsList(PANEL_EDITOR_CONTROL, "add", "right"),
            setMapInfoWasEnabled(!!state?.mapInfo?.enabled),
            changeMapInfoState(false),
            changeMapInfoFormat("application/json")
        ]));

// Handle WFS transactions from Redux actions to keep the component presentation-only.
export const handlePanelEditorTransactionEpic = (action$, store) =>
    action$
        .ofType(PANEL_EDITOR_REQUEST_SAVE, PANEL_EDITOR_REQUEST_DELETE)
        .switchMap((action) => {
            const state = store.getState();
            const {
                locale,
                typeName,
                idField,
                idValue,
                wfsUrl,
                formValues,
                userRole,
                selectedAttributes,
                layerConfig,
                selectedLayerName,
                clickPoint,
                clickLayer,
                filterNameList,
                overrideParams,
                itemId,
                layerToRefresh
            } = getTransactionParams(state);

            if (!wfsUrl || !typeName || idValue === undefined || idValue === null) {
                return Rx.Observable.of(
                    setSaveStatus("error"),
                    setSaveMessage(t(locale, "saveErrorMissingConfig")),
                    setValidationErrors({})
                );
            }

            const {
                changedAttributes,
                validationErrors
            } = action.type === PANEL_EDITOR_REQUEST_SAVE
                ? getEditableFieldChanges({
                    locale,
                    userRole,
                    selectedAttributes,
                    formValues,
                    layerConfig
                })
                : { changedAttributes: {}, validationErrors: {} };

            if (action.type === PANEL_EDITOR_REQUEST_SAVE && Object.keys(validationErrors).length) {
                return Rx.Observable.of(
                    setValidationErrors(validationErrors),
                    setSaveStatus("error"),
                    setSaveMessage(t(locale, "saveValidationError"))
                );
            }

            if (action.type === PANEL_EDITOR_REQUEST_SAVE && !Object.keys(changedAttributes).length) {
                return Rx.Observable.of(
                    setValidationErrors({}),
                    setSaveStatus("idle"),
                    setSaveMessage(t(locale, "saveNoChanges"))
                );
            }

            const payload = action.type === PANEL_EDITOR_REQUEST_SAVE
                ? buildUpdateTransactionPayload({
                    typeName,
                    idField,
                    idValue,
                    attributes: changedAttributes
                })
                : buildDeleteTransactionPayload({
                    typeName,
                    idField,
                    idValue
                });

            return Rx.Observable.fromPromise(postWfsTransaction(wfsUrl, payload))
                .switchMap(() => {
                    const successActions = [
                        setEditMode(false),
                        setValidationErrors({}),
                        setSaveStatus("success"),
                        setSaveMessage(t(locale, "saveSuccess"))
                    ];

                    if (clickPoint) {
                        successActions.push(featureInfoClick(
                            clickPoint,
                            clickLayer || selectedLayerName,
                            filterNameList || [],
                            overrideParams || {},
                            itemId || null
                        ));
                    }

                    if (layerToRefresh) {
                        successActions.push(refreshLayers([layerToRefresh], { force: true }));
                    }

                    return Rx.Observable.from(successActions);
                })
                .catch(() => Rx.Observable.of(
                    setSaveStatus("error"),
                    setSaveMessage(t(locale, "saveErrorGeneric"))
                ))
                .startWith(setValidationErrors({}), setSaveMessage(""), setSaveStatus("saving"));
        });

// Authorize write mode according to layer rights and restricted area spatial operation.
export const startEditWithPermissionsEpic = (action$, store) =>
    action$
        .ofType(PANEL_EDITOR_REQUEST_START_EDIT)
        .switchMap(() => {
            console.log("startEditWithPermissionsEpic triggered");
            const state = store.getState();
            const {
                locale,
                userRole,
                selectedFeature,
                selectedAttributes,
                layerConfig,
                restrictedArea
            } = getStartEditParams(state);

            console.log("TEST ===============");

            if (!canEditLayer(userRole, layerConfig)) {
                return Rx.Observable.of(
                    setEditMode(false),
                    setSaveStatus("idle"),
                    setSaveMessage("")
                );
            }

            const bypassRestrictedArea = isRoleAllowed(userRole, restrictedArea?.allowedRoles || []);
            if (!restrictedArea || bypassRestrictedArea) {
                return Rx.Observable.of(
                    setFormValues(selectedAttributes || {}),
                    setEditMode(true),
                    setSaveStatus("idle"),
                    setSaveMessage(""),
                    setValidationErrors({})
                );
            }

            const restrictedAreaUrl = restrictedArea?.url || "/console/account/areaofcompetence";
            const restrictedAreaOperation = restrictedArea?.operation || "WITHIN";
            const fallbackWkt = restrictedArea?.wkt || restrictedArea?.wtk;

            return Rx.Observable.fromPromise(getAreaOfCompetence(restrictedAreaUrl))
                .map((response) => extractAreaGeometry(response, fallbackWkt))
                .map((areaGeometry) => {
                    // Empty area response or parse issue: fallback to base layer/field rights.
                    if (!areaGeometry) {
                        return true;
                    }
                    return isRestrictedAreaOperationAllowed({
                        operation: restrictedAreaOperation,
                        featureGeometry: selectedFeature?.geometry,
                        areaGeometry
                    });
                })
                .switchMap((allowedByArea) => {
                    if (allowedByArea) {
                        return Rx.Observable.of(
                            setFormValues(selectedAttributes || {}),
                            setEditMode(true),
                            setSaveStatus("idle"),
                            setSaveMessage(""),
                            setValidationErrors({})
                        );
                    }
                    return Rx.Observable.of(
                        setEditMode(false),
                        setSaveStatus("idle"),
                        setSaveMessage(t(locale, "editRestrictedAreaDenied")),
                        setValidationErrors({})
                    );
                })
                .catch(() => Rx.Observable.of(
                    setFormValues(selectedAttributes || {}),
                    setEditMode(true),
                    setSaveStatus("idle"),
                    setSaveMessage(""),
                    setValidationErrors({})
                ));
        });

export const cancelEditPanelEditorEpic = (action$, store) =>
    action$
        .ofType(PANEL_EDITOR_REQUEST_CANCEL_EDIT)
        .switchMap(() => {
            const state = store.getState();
            const selectedAttributes = selectedFeaturePropertiesSelector(state);
            return Rx.Observable.of(
                setFormValues(selectedAttributes || {}),
                setEditMode(false),
                setSaveStatus("idle"),
                setSaveMessage(""),
                setValidationErrors({})
            );
        });

// Handle map clicks directly from this plugin when it is active.
export const requestFeatureInfoOnMapClickEpic = (action$, store) =>
    action$
        .ofType(CLICK_ON_MAP)
        .filter(({ point }) => {
            const state = store.getState();
            return !!point && isActive(state) && state?.mapInfo?.enabled === false;
        })
        .switchMap(({ point, layer }) => {
            const pluginCfg = pluginCfgSelector(store.getState());
            const configuredLayerNames = getLayersList(pluginCfg)
                .map((layerConfig) => layerConfig?.name)
                .filter(Boolean);

            if (!configuredLayerNames.length) {
                return Rx.Observable.of(featureInfoClick(point, layer));
            }

            const overrideParams = configuredLayerNames.reduce((acc, layerName) => ({
                ...acc,
                [layerName]: {
                    info_format: "application/json"
                }
            }), {});

            return Rx.Observable.of(
                featureInfoClick(point, layer || configuredLayerNames[0], configuredLayerNames, overrideParams)
            );
        });

// Keep map layout right offset aligned with panel width while the panel is active.
export const updatePanelEditorLayoutEpic = (action$, store) =>
    action$
        .ofType(UPDATE_MAP_LAYOUT)
        .filter(() => isActive(store.getState()))
        .filter(({ source }) => source !== PANEL_EDITOR_CONTROL)
        .map(({ layout }) => {
            const size = getPanelSize(store.getState());
            const sidebarRight = layout?.boundingSidebarRect?.right ?? 0;
            const rightOffset = size + sidebarRight;
            const action = updateMapLayout({
                ...layout,
                right: rightOffset,
                boundingMapRect: {
                    ...(layout?.boundingMapRect || {}),
                    right: rightOffset
                },
                rightPanel: true
            });
            return { ...action, source: PANEL_EDITOR_CONTROL };
        });

export default {
    syncIdentifyStateWithPanelEditorEpic,
    registerPanelEditorDockPanelEpic,
    handlePanelEditorTransactionEpic,
    startEditWithPermissionsEpic,
    cancelEditPanelEditorEpic,
    requestFeatureInfoOnMapClickEpic,
    updatePanelEditorLayoutEpic
};
