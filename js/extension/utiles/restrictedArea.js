import WKT from "ol/format/WKT";
import GeoJSON from "ol/format/GeoJSON";
import { transform } from "ol/proj";
import booleanContains from "@turf/boolean-contains";
import booleanIntersects from "@turf/boolean-intersects";

const wktFormat = new WKT();
const geoJsonFormat = new GeoJSON();
const GEOJSON_GEOMETRY_TYPES = [
    "Point",
    "MultiPoint",
    "LineString",
    "MultiLineString",
    "Polygon",
    "MultiPolygon",
    "GeometryCollection"
];

const reprojectGeometryObject = (geometry = null, targetProjection = "EPSG:4326") => {
    if (!geometry || !targetProjection || targetProjection === "EPSG:4326") {
        return geometry;
    }

    if (Array.isArray(geometry.coordinates)) {
        const transformCoordinates = (coordinates) => {
            if (!Array.isArray(coordinates)) {
                return coordinates;
            }
            if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
                return transform(coordinates, "EPSG:4326", targetProjection);
            }
            return coordinates.map(transformCoordinates);
        };

        return {
            ...geometry,
            coordinates: transformCoordinates(geometry.coordinates)
        };
    }

    if (Array.isArray(geometry.geometries)) {
        return {
            ...geometry,
            geometries: geometry.geometries.map((item) => reprojectGeometryObject(item, targetProjection))
        };
    }

    return geometry;
};

const parseWktGeometry = (wktValue, targetProjection = "EPSG:4326") => {
    if (!wktValue || typeof wktValue !== "string") {
        return null;
    }
    try {
        const geometry = wktFormat.readGeometry(wktValue);
        return reprojectGeometryObject(geoJsonFormat.writeGeometryObject(geometry), targetProjection);
    } catch (error) {
        return null;
    }
};

const toFeature = (featureOrGeometry) => {
    if (!featureOrGeometry) {
        return null;
    }
    if (typeof featureOrGeometry === "string") {
        const parsedGeometry = parseWktGeometry(featureOrGeometry);
        return parsedGeometry
            ? {
                type: "Feature",
                properties: {},
                geometry: parsedGeometry
            }
            : null;
    }
    if (featureOrGeometry.type === "Feature") {
        return featureOrGeometry;
    }
    if (
        GEOJSON_GEOMETRY_TYPES.includes(featureOrGeometry.type)
        && (
            featureOrGeometry.coordinates
            || Array.isArray(featureOrGeometry.geometries)
        )
    ) {
        return {
            type: "Feature",
            properties: {},
            geometry: featureOrGeometry
        };
    }
    return null;
};

const parseAreaGeometry = (rawResponse, fallbackWkt, targetProjection = "EPSG:4326") => {
    if (!rawResponse && fallbackWkt) {
        return parseWktGeometry(fallbackWkt, targetProjection);
    }

    if (typeof rawResponse === "string") {
        const parsedWkt = parseWktGeometry(rawResponse, targetProjection);
        if (parsedWkt) {
            return parsedWkt;
        }
        try {
            return parseAreaGeometry(JSON.parse(rawResponse), fallbackWkt, targetProjection);
        } catch (error) {
            return parseWktGeometry(fallbackWkt, targetProjection);
        }
    }

    if (Array.isArray(rawResponse)) {
        return rawResponse.length
            ? parseAreaGeometry(rawResponse[0], fallbackWkt, targetProjection)
            : parseWktGeometry(fallbackWkt, targetProjection);
    }

    if (!rawResponse || typeof rawResponse !== "object") {
        return parseWktGeometry(fallbackWkt, targetProjection);
    }

    if (rawResponse.type === "FeatureCollection" && Array.isArray(rawResponse.features) && rawResponse.features.length > 0) {
        return parseAreaGeometry(rawResponse.features[0], fallbackWkt, targetProjection);
    }
    if (rawResponse.type === "Feature") {
        return rawResponse.geometry || null;
    }
    if (rawResponse.type && rawResponse.coordinates) {
        return rawResponse;
    }

    const wktGeometry = parseWktGeometry(rawResponse.wkt || rawResponse.wtk || rawResponse.WKT, targetProjection);
    if (wktGeometry) {
        return wktGeometry;
    }

    const candidateKeys = ["geometry", "areaOfCompetence", "area", "feature", "geojson", "result", "data"];
    for (let index = 0; index < candidateKeys.length; index += 1) {
        const key = candidateKeys[index];
        const nestedGeometry = parseAreaGeometry(rawResponse[key], fallbackWkt, targetProjection);
        if (nestedGeometry) {
            return nestedGeometry;
        }
    }

    return parseWktGeometry(fallbackWkt, targetProjection);
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
