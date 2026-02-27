import React from "react";
import { connect } from "react-redux";
import { Button, Glyphicon } from "react-bootstrap";
import tooltip from "@mapstore/components/misc/enhancers/tooltip";
import { toggleControl } from "@mapstore/actions/controls";
import { mapLayoutValuesSelector } from "@mapstore/selectors/maplayout";
import { createPlugin } from "@mapstore/utils/PluginsUtils";
import { name } from "../../../config";
import PanelEditor from "../components/PanelEditor";
import reducer from "../stateManagement/reducer";
import epics from "../stateManagement/epics";
import {
    setup,
    requestDelete,
    requestCancelEdit,
    requestStartEdit,
    requestSave,
    setSelectedFeatureIndex,
    setSelectedResponseIndex,
    updateFormValue
} from "../stateManagement/actions";
import {
    editModeSelector,
    formValuesSelector,
    isActive,
    responseOptionsSelector,
    saveMessageSelector,
    saveStatusSelector,
    selectedFeatureCollectionSelector,
    selectedFeatureIndexSelector,
    selectedLayerConfigSelector,
    selectedFeaturePropertiesSelector,
    selectedFeatureSelector,
    selectedResponseIndexSelector,
    userRoleSelector,
    validationErrorsSelector
} from "../stateManagement/selectors";
import { PANEL_EDITOR_CONTROL, PANEL_EDITOR_REDUCER_NAME } from "./constants";
import init from "./init";
import "../assets/style.css";

const TooltipButton = tooltip(Button);

const compose = (...functions) => (args) =>
    functions.reduceRight((arg, fn) => fn(arg), args);

const SidebarTool = connect(() => ({}), {
    click: toggleControl.bind(null, PANEL_EDITOR_CONTROL, null)
})((props) => (
    <TooltipButton
        onClick={props?.click}
        bsStyle="tray"
        tooltip={props?.pluginCfg?.tooltip || "Attributes"}
        className="square-button"
    >
        <Glyphicon glyph={props?.pluginCfg?.icon || "th-list"} />
    </TooltipButton>
));

const mapStateToProps = (state, ownProps) => ({
    active: isActive(state),
    enabled: isActive(state),
    dockStyle: mapLayoutValuesSelector(state, { height: true, right: true }, true),
    locale: state?.locale?.current || "en-US",
    userRole: userRoleSelector(state),
    responseOptions: responseOptionsSelector(state),
    selectedResponseIndex: selectedResponseIndexSelector(state),
    selectedFeatureIndex: selectedFeatureIndexSelector(state),
    selectedFeatures: selectedFeatureCollectionSelector(state),
    layerConfig: selectedLayerConfigSelector(state),
    selectedFeature: selectedFeatureSelector(state),
    selectedAttributes: selectedFeaturePropertiesSelector(state),
    editMode: editModeSelector(state),
    formValues: formValuesSelector(state),
    saveStatus: saveStatusSelector(state),
    saveMessage: saveMessageSelector(state),
    validationErrors: validationErrorsSelector(state),
    cfg: ownProps?.cfg || {}
});

const mapDispatchToProps = (dispatch) => ({
    onClose: () => dispatch(toggleControl(PANEL_EDITOR_CONTROL, null)),
    onSelectResponse: (index) => dispatch(setSelectedResponseIndex(index)),
    onSelectFeature: (index) => dispatch(setSelectedFeatureIndex(index)),
    onStartEdit: () => dispatch(requestStartEdit()),
    onCancelEdit: () => dispatch(requestCancelEdit()),
    onUpdateField: (fieldName, value) => dispatch(updateFormValue(fieldName, value)),
    onSave: () => dispatch(requestSave()),
    onDelete: () => dispatch(requestDelete())
});

const PanelEditorPluginComponent = compose(
    connect(mapStateToProps, mapDispatchToProps),
    compose(
        connect(() => ({}), { setup }),
        init()
    )
)(PanelEditor);

const panelEditorSelector = (state) => ({
    bsStyle: state?.controls?.[PANEL_EDITOR_CONTROL]?.enabled ? "primary" : "tray",
    active: !!state?.controls?.[PANEL_EDITOR_CONTROL]?.enabled
});

export default createPlugin(name, {
    component: PanelEditorPluginComponent,
    containers: {
        SidebarMenu: {
            name,
            position: 8,
            icon: <Glyphicon glyph="th-list" />,
            action: toggleControl.bind(null, PANEL_EDITOR_CONTROL, null),
            doNotHide: true,
            priority: 1,
            selector: panelEditorSelector,
            //tool: SidebarTool
        },
        BurgerMenu: {
            name,
            position: 8,
            icon: <Glyphicon glyph="th-list" />,
            action: toggleControl.bind(null, PANEL_EDITOR_CONTROL, null),
            doNotHide: true,
            priority: 3
        }
    },
    reducers: {
        [PANEL_EDITOR_REDUCER_NAME]: reducer
    },
    epics
});
