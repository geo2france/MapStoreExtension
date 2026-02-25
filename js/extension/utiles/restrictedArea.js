import WKT from "ol/format/WKT";
import GeoJSON from "ol/format/GeoJSON";
import booleanContains from "@turf/boolean-contains";
import booleanIntersects from "@turf/boolean-intersects";

const wktFormat = new WKT();
const geoJsonFormat = new GeoJSON();

const toFeature = (featureOrGeometry) => {
    if (!featureOrGeometry) {
        return null;
    }
    if (featureOrGeometry.type === "Feature") {
        return featureOrGeometry;
    }
    if (featureOrGeometry.type && featureOrGeometry.coordinates) {
        return {
            type: "Feature",
            properties: {},
            geometry: featureOrGeometry
        };
    }
    return null;
};

const parseWktGeometry = (wktValue) => {
    if (!wktValue || typeof wktValue !== "string") {
        return null;
    }
    try {
        const geometry = wktFormat.readGeometry(wktValue);
        return geoJsonFormat.writeGeometryObject(geometry);
    } catch (error) {
        return null;
    }
};

const parseAreaGeometry = (rawResponse, fallbackWkt) => {
    if (!rawResponse && fallbackWkt) {
        return parseWktGeometry(fallbackWkt);
    }

    if (typeof rawResponse === "string") {
        const parsedWkt = parseWktGeometry(rawResponse);
        if (parsedWkt) {
            return parsedWkt;
        }
        try {
            return parseAreaGeometry(JSON.parse(rawResponse), fallbackWkt);
        } catch (error) {
            return parseWktGeometry(fallbackWkt);
        }
    }

    if (Array.isArray(rawResponse)) {
        return rawResponse.length ? parseAreaGeometry(rawResponse[0], fallbackWkt) : parseWktGeometry(fallbackWkt);
    }

    if (!rawResponse || typeof rawResponse !== "object") {
        return parseWktGeometry(fallbackWkt);
    }

    if (rawResponse.type === "FeatureCollection" && Array.isArray(rawResponse.features) && rawResponse.features.length > 0) {
        return parseAreaGeometry(rawResponse.features[0], fallbackWkt);
    }
    if (rawResponse.type === "Feature") {
        return rawResponse.geometry || null;
    }
    if (rawResponse.type && rawResponse.coordinates) {
        return rawResponse;
    }

    const wktGeometry = parseWktGeometry(rawResponse.wkt || rawResponse.wtk || rawResponse.WKT);
    if (wktGeometry) {
        return wktGeometry;
    }

    const candidateKeys = ["geometry", "areaOfCompetence", "area", "feature", "geojson", "result", "data"];
    for (let index = 0; index < candidateKeys.length; index += 1) {
        const key = candidateKeys[index];
        const nestedGeometry = parseAreaGeometry(rawResponse[key], fallbackWkt);
        if (nestedGeometry) {
            return nestedGeometry;
        }
    }

    return parseWktGeometry(fallbackWkt);
};

export const extractAreaGeometry = parseAreaGeometry;

export const isRestrictedAreaOperationAllowed = ({ operation = "WITHIN", featureGeometry, areaGeometry }) => {
    const feature = toFeature(featureGeometry);
    const area = toFeature(areaGeometry);
    if (!feature || !area) {
        return true;
    }

    const normalizedOperation = String(operation || "WITHIN").toUpperCase();
    switch (normalizedOperation) {
    case "INTERSECTS":
        return booleanIntersects(feature, area);
    case "CONTAINS":
        return booleanContains(feature, area);
    case "WITHIN":
    default:
        return booleanContains(area, feature);
    }
};
