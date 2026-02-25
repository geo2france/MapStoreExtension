import axios from "@mapstore/libs/ajax";

const escapeXml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

const formatLiteralValue = (value) => {
    if (value === null || value === undefined) {
        return "";
    }
    return escapeXml(value);
};

const buildWfsPropertiesBlock = (attributes = {}) =>
    Object.keys(attributes)
        .map((key) => `
            <wfs:Property>
                <wfs:Name>${escapeXml(key)}</wfs:Name>
                <wfs:Value>${formatLiteralValue(attributes[key])}</wfs:Value>
            </wfs:Property>
        `)
        .join("");

const buildFeatureFilter = (idField, idValue) => `
    <ogc:Filter>
        <ogc:PropertyIsEqualTo>
            <ogc:PropertyName>${escapeXml(idField)}</ogc:PropertyName>
            <ogc:Literal>${formatLiteralValue(idValue)}</ogc:Literal>
        </ogc:PropertyIsEqualTo>
    </ogc:Filter>
`;

export const buildUpdateTransactionPayload = ({ typeName, idField, idValue, attributes }) => `
    <wfs:Transaction service="WFS" version="1.1.0"
        xmlns:wfs="http://www.opengis.net/wfs"
        xmlns:ogc="http://www.opengis.net/ogc">
        <wfs:Update typeName="${escapeXml(typeName)}">
            ${buildWfsPropertiesBlock(attributes)}
            ${buildFeatureFilter(idField, idValue)}
        </wfs:Update>
    </wfs:Transaction>
`;

export const buildDeleteTransactionPayload = ({ typeName, idField, idValue }) => `
    <wfs:Transaction service="WFS" version="1.1.0"
        xmlns:wfs="http://www.opengis.net/wfs"
        xmlns:ogc="http://www.opengis.net/ogc">
        <wfs:Delete typeName="${escapeXml(typeName)}">
            ${buildFeatureFilter(idField, idValue)}
        </wfs:Delete>
    </wfs:Transaction>
`;

export const postWfsTransaction = (url, xmlPayload, headers = {}) =>
    axios.post(url, xmlPayload, {
        headers: {
            "Content-Type": "text/xml",
            ...headers
        }
    });
