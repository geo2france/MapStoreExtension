import React from "react";
import PropTypes from "prop-types";
import ResponsivePanel from "@mapstore/components/misc/panels/ResponsivePanel";
import { Alert, Button, ButtonGroup, ControlLabel, FormGroup, Glyphicon, HelpBlock } from "react-bootstrap";
import { t } from "../utiles/i18n";
import { canDeleteFeature, canEditField, canEditLayer } from "../utiles/permissions";
import {
    getLayerConfig,
    getVisibleFieldNames,
    resolveFieldDefinition
} from "../utiles/attributes";
import renderInputByType from "./formControls/renderInputByType";
import SelectInputControl from "./formControls/SelectInputControl";
import StaticValueControl from "./formControls/StaticValueControl";

const PanelEditor = ({
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
    selectedLayerName,
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
    const layerConfig = getLayerConfig(cfg, selectedLayerName) || {};
    const visibleFields = getVisibleFieldNames(selectedAttributes, layerConfig);
    const canEditCurrentLayer = canEditLayer(userRole, layerConfig);
    const canDeleteCurrentFeature = canDeleteFeature(userRole, layerConfig);

    const title = cfg?.title || t(locale, "panelTitle");
    const size = Number.isFinite(cfg?.size) ? cfg.size : 420;

    console.log(visibleFields);

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
                    <div>
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
                                        label: `${t(locale, "featureLabel")} ${index + 1}`,
                                        key: feature?.id || index
                                    }))}
                                    onChange={(value) => onSelectFeature(Number(value))}
                                />
                            </FormGroup>
                        ) : null}

                        <div className="panel-editor-mode-title">
                            <strong>{editMode ? t(locale, "editModeTitle") : t(locale, "readModeTitle")}</strong>
                        </div>

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
                                    const fieldEditable = canEditField(userRole, fieldDefinition);
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

                        <div className="panel-editor-toolbar">
                            {!editMode ? (
                                <Button
                                    bsStyle="primary"
                                    disabled={!canEditCurrentLayer || !selectedFeature}
                                    onClick={onStartEdit}
                                >
                                    <Glyphicon glyph="pencil" /> {t(locale, "switchToEdit")}
                                </Button>
                            ) : (
                                <ButtonGroup>
                                    <Button
                                        bsStyle="success"
                                        disabled={saveStatus === "saving"}
                                        onClick={onSave}
                                    >
                                        <Glyphicon glyph="floppy-disk" /> {t(locale, "save")}
                                    </Button>
                                    <Button
                                        disabled={saveStatus === "saving"}
                                        onClick={onCancelEdit}
                                    >
                                        {t(locale, "cancel")}
                                    </Button>
                                    <Button
                                        bsStyle="danger"
                                        disabled={!canDeleteCurrentFeature || saveStatus === "saving"}
                                        onClick={onDelete}
                                    >
                                        {t(locale, "delete")}
                                    </Button>
                                </ButtonGroup>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ResponsivePanel>
    );
};

PanelEditor.propTypes = {
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
    selectedLayerName: PropTypes.string,
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
    selectedLayerName: "",
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
