import React from "react";
import PropTypes from "prop-types";
import ResponsivePanel from "@mapstore/components/misc/panels/ResponsivePanel";
import { Alert, Button, ControlLabel, FormGroup, Glyphicon, HelpBlock } from "react-bootstrap";
import { t } from "../utiles/i18n";
import { canDeleteFeature, canEditField, canEditLayer } from "../utiles/permissions";
import {
    getFeatureOptionLabel,
    getVisibleFieldNames,
    resolveFieldDefinition
} from "../utiles/attributes";
import renderInputByType from "./formControls/renderInputByType";
import SelectInputControl from "./formControls/SelectInputControl";
import StaticValueControl from "./formControls/StaticValueControl";

const PANEL_SIZE_EXTRA = 100;

const PanelEditor = ({
    layerConfig,
    enabled,
    onClose,
    dockStyle,
    cfg,
    locale,
    userRole,
    responseOptions,
    selectedResponseIndex,
    selectedFeatureIndex,
    selectedFeatures,
    selectedFeature,
    selectedAttributes,
    editMode,
    formValues,
    saveStatus,
    saveMessage,
    validationErrors,
    onSelectResponse,
    onSelectFeature,
    onStartEdit,
    onCancelEdit,
    onUpdateField,
    onSave,
    onDelete
}) => {
    const visibleFields = getVisibleFieldNames(selectedAttributes, layerConfig);
    const canEditCurrentLayer = canEditLayer(userRole, layerConfig);
    const canDeleteCurrentFeature = canDeleteFeature(userRole, layerConfig);

    const title = cfg?.title || t(locale, "panelTitle");
    const baseSize = Number.isFinite(cfg?.size) ? cfg.size : 420;
    const size = baseSize + PANEL_SIZE_EXTRA;

    console.log(layerConfig);

    return (
        <ResponsivePanel
            containerId="panel-editor-container"
            containerClassName="dock-container panel-editor-container"
            className="panel-editor-dock-panel"
            containerStyle={dockStyle}
            style={dockStyle}
            open={enabled}
            position="right"
            size={size}
            title={title}
            onClose={onClose}
        >
            <div className="panel-editor-body">
                {saveMessage ? (
                    <Alert bsStyle={saveStatus === "error" ? "danger" : "info"}>
                        {saveMessage}
                    </Alert>
                ) : null}

                {!responseOptions.length ? (
                    <div className="panel-editor-empty-state">{t(locale, "emptyState")}</div>
                ) : (
                    <div className="panel-editor-content">
                        <div className="panel-editor-static-header">
                            {responseOptions.length > 1 ? (
                                <FormGroup>
                                    <ControlLabel>{t(locale, "layerLabel")}</ControlLabel>
                                    <SelectInputControl
                                        value={selectedResponseIndex}
                                        options={responseOptions}
                                        onChange={(value) => onSelectResponse(Number(value))}
                                    />
                                </FormGroup>
                            ) : null}

                            {selectedFeatures.length > 1 ? (
                                <FormGroup>
                                    <ControlLabel>{t(locale, "featureLabel")}</ControlLabel>
                                    <SelectInputControl
                                        value={selectedFeatureIndex}
                                        options={selectedFeatures.map((feature, index) => ({
                                            value: index,
                                            label: getFeatureOptionLabel(feature, layerConfig, index),
                                            key: feature?.id || index
                                        }))}
                                        onChange={(value) => onSelectFeature(Number(value))}
                                    />
                                </FormGroup>
                            ) : null}

                            {editMode ? (
                                <div className="panel-editor-mode-title">
                                    <span className="label label-primary">{t(locale, "editModeTitle")}</span>
                                </div>
                            ) : null}
                            <div className="panel-editor-toolbar">
                                {!editMode ? (
                                    <Button
                                        bsStyle="primary"
                                        disabled={!canEditCurrentLayer || !selectedFeature}
                                        onClick={onStartEdit}
                                        title={t(locale, "switchToEdit")}
                                        aria-label={t(locale, "switchToEdit")}
                                    >
                                        <Glyphicon glyph="pencil" />
                                    </Button>
                                ) : (
                                    <div className="panel-editor-actions">
                                        <Button
                                            bsStyle="success"
                                            disabled={saveStatus === "saving"}
                                            onClick={onSave}
                                            title={t(locale, "save")}
                                            aria-label={t(locale, "save")}
                                        >
                                            <Glyphicon glyph="floppy-disk" />
                                        </Button>
                                        <Button
                                            disabled={saveStatus === "saving"}
                                            onClick={onCancelEdit}
                                            bsStyle="warning"
                                            title={t(locale, "cancel")}
                                            aria-label={t(locale, "cancel")}
                                        >
                                            <Glyphicon glyph="remove" />
                                        </Button>
                                        <Button
                                            bsStyle="danger"
                                            disabled={!canDeleteCurrentFeature || saveStatus === "saving"}
                                            onClick={onDelete}
                                            title={t(locale, "delete")}
                                            aria-label={t(locale, "delete")}
                                        >
                                            <Glyphicon glyph="trash" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="panel-editor-scroll">
                            {!visibleFields.length ? (
                                <div className="panel-editor-empty-state">{t(locale, "noAttributes")}</div>
                            ) : null}

                            {!editMode && visibleFields.length ? (
                                <table className="table table-striped panel-editor-attributes-table">
                                    <tbody>
                                        {visibleFields.map((fieldName) => {
                                            const fieldDefinition = resolveFieldDefinition(
                                                fieldName,
                                                selectedAttributes[fieldName],
                                                layerConfig
                                            );
                                            return (
                                                <tr key={fieldName}>
                                                    <th>{fieldDefinition.label}</th>
                                                    <td>{String(selectedAttributes[fieldName] ?? "")}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : null}

                            {editMode && visibleFields.length ? (
                                <div>
                                    {visibleFields.map((fieldName) => {
                                        const fieldDefinition = resolveFieldDefinition(
                                            fieldName,
                                            selectedAttributes[fieldName],
                                            layerConfig
                                        );
                                        const fieldEditable = canEditField(
                                            userRole,
                                            fieldDefinition,
                                            selectedAttributes[fieldName]
                                        );
                                        const fieldError = validationErrors[fieldName];
                                        console.log(fieldEditable);
                                        return (
                                            <FormGroup key={fieldName} validationState={fieldError ? "error" : null}>
                                                <ControlLabel>
                                                    {fieldDefinition.label}
                                                    {fieldDefinition.required ? " *" : ""}
                                                </ControlLabel>
                                                {fieldEditable
                                                    ? renderInputByType({
                                                        type: fieldDefinition.type,
                                                        value: formValues[fieldName],
                                                        options: fieldDefinition.options,
                                                        onChange: (value) => onUpdateField(fieldName, value)
                                                    })
                                                    : (
                                                        <StaticValueControl
                                                            value={formValues[fieldName] ?? selectedAttributes[fieldName] ?? ""}
                                                        />
                                                    )}
                                                {fieldError ? <HelpBlock>{fieldError}</HelpBlock> : null}
                                            </FormGroup>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </ResponsivePanel>
    );
};

PanelEditor.propTypes = {
    layerConfig: PropTypes.object,
    enabled: PropTypes.bool,
    onClose: PropTypes.func,
    dockStyle: PropTypes.object,
    cfg: PropTypes.object,
    locale: PropTypes.string,
    userRole: PropTypes.string,
    responseOptions: PropTypes.array,
    selectedResponseIndex: PropTypes.number,
    selectedFeatureIndex: PropTypes.number,
    selectedFeatures: PropTypes.array,
    selectedFeature: PropTypes.object,
    selectedAttributes: PropTypes.object,
    editMode: PropTypes.bool,
    formValues: PropTypes.object,
    saveStatus: PropTypes.string,
    saveMessage: PropTypes.string,
    validationErrors: PropTypes.object,
    onSelectResponse: PropTypes.func,
    onSelectFeature: PropTypes.func,
    onStartEdit: PropTypes.func,
    onCancelEdit: PropTypes.func,
    onUpdateField: PropTypes.func,
    onSave: PropTypes.func,
    onDelete: PropTypes.func
};

PanelEditor.defaultProps = {
    layerConfig: {},
    enabled: false,
    onClose: () => {},
    dockStyle: {},
    cfg: {},
    locale: "en-US",
    userRole: "",
    responseOptions: [],
    selectedResponseIndex: 0,
    selectedFeatureIndex: 0,
    selectedFeatures: [],
    selectedFeature: null,
    selectedAttributes: {},
    editMode: false,
    formValues: {},
    saveStatus: "idle",
    saveMessage: "",
    validationErrors: {},
    onSelectResponse: () => {},
    onSelectFeature: () => {},
    onStartEdit: () => {},
    onCancelEdit: () => {},
    onUpdateField: () => {},
    onSave: () => {},
    onDelete: () => {}
};

export default PanelEditor;
