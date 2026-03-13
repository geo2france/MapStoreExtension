# Configuration

Configuration is defined in `localConfig.json` under the `panel_editor` plugin.

## 1) Global plugin configuration (`cfg`)

| Key | Type | Required | Description |
|---|---|---:|---|
| `title` | `string` | no | Panel title. |
| `tooltip` | `string` | no | Plugin button tooltip. |
| `icon` | `string` | no | MapStore icon (`Glyphicon`). |
| `size` | `number` | no | Base panel width (plugin adds +100 px). |
| `geoserver` | `string` | no | Base GeoServer URL (WFS fallback). |
| `wfsUrl` | `string` | no | Global WFS URL (higher priority than `geoserver`). |
| `layers` | `object` | yes | Per-layer rules (`workspace:layer`). |

## 2) Layer configuration (`cfg.layers["workspace:layer"]`)

| Key | Type | Required | Description |
|---|---|---:|---|
| `featureFieldLabel` | `string` | no | Field used in feature selector labels. |
| `featureFielLabel` | `string` | no | Tolerated alias (compatibility). |
| `hidden` | `string[]` | no | Fields hidden in read/edit views. |
| `fields` | `array` | no | Detailed field definition (see next table). |
| `auto` | `array` | no | Fields filled automatically on save. |
| `edit` / `editingRoles` | `string[]` | no | Roles allowed to edit the layer. |
| `delete` / `deletionRoles` | `string[]` | no | Roles allowed to delete. |
| `wfsUrl` | `string` | no | Layer-specific WFS URL. |
| `idField` | `string` | no | Identifier field name (default: `id`). |
| `restrictedArea` | `object` | no | Spatial edit restriction (area of competence). |

## 3) Field configuration (`fields`)

Each `fields` entry accepts compact format:
`[name, label, type, editable, required, roles, options]`

| Position | Name | Type | Description |
|---:|---|---|---|
| `0` | `name` | `string` | Attribute key. |
| `1` | `label` | `string` | Display label. |
| `2` | `type` | `string` | UI type (`string`, `number`, `date`, `select`, etc.). |
| `3` | `editable` | `boolean` | Editable or read-only. |
| `4` | `required` | `boolean` | Required field. |
| `5` | `roles` | `string[]` | Roles allowed to edit this field. |
| `6` | `options` | `array` | Values for list/select inputs. |

## 4) Automatic field configuration (`auto`)

Each `auto` entry accepts compact format:
`[name, type, source]`

| Position | Name | Type | Description |
|---:|---|---|---|
| `0` | `name` | `string` | Field name to populate. |
| `1` | `type` | `string` | Automatic type. Supported values: `header`, `date`, `area`, `length`. |
| `2` | `source` | `string` | Source to use. For `header`, path to read from `security.user`. For `date`, desired display format. Not used for `area` and `length`. |

Rules:

- A field declared in `auto` is never editable in the form.
- The panel always displays the last known value.
- If `type` is `header`, the value is read from user information already exposed by MapStore/geOrchestra, using the configured path.
- If `type` is `date`, the value is replaced with the current date on save.
- If `type` is `area`, the value is computed from the feature geometry. Default unit is square meters (`m²`).
- If `type` is `length`, the value is computed from the feature geometry. For a line, this is the length. For a polygon, this is the perimeter. Default unit is meters (`m`).
- `auto` fields are injected into the WFS-T transaction even if they are also listed in `hidden`.

## Complete example (global + layer + fields)

```json
{
  "name": "panel_editor",
  "cfg": {
    "title": "Reviewed projects",
    "tooltip": "Reviewed projects",
    "icon": "map",
    "size": 420,
    "geoserver": "http://localhost/geoserver",
    "layers": {
      "test:reviewed_projects": {
        "featureFieldLabel": "name",
        "idField": "id",
        "hidden": [
          "geom",
          "log_date_crea",
          "log_date_modi",
          "log_user_crea",
          "log_user_modi"
        ],
        "auto": [
          ["log_user_modi", "header", "username"],
          ["log_date_modi", "date", "DD/MM/YYYY"],
          ["surface_carto", "area"],
          ["longueur_carto", "length"]
        ],
        "edit": ["EDITOR", "ADMIN"],
        "delete": ["ADMIN"],
        "restrictedArea": {
          "url": "/console/account/areaofcompetence",
          "operation": "INTERSECTS"
        },
        "fields": [
          ["identifier", "Identifier", "string", true, true],
          ["name", "Name", "string", false, true],
          ["status", "Status", "select", true, false, ["EDITOR", "ADMIN"], ["New", "Validated", "Rejected"]],
          ["comment", "Comment", "string", true, false]
        ]
      }
    }
  }
}
```

## Important notes

- Feature selector labels follow:
  `[number] - (field_name) field_value`.
- `ADMIN` / `ROLE_ADMIN` has full permissions.
- If a field is `required` and empty, it stays editable even if `editable` is `false`.
- `auto` fields stay read-only and are populated at save time.
- Default units for geometry-based calculations are `m²` for `area` and `m` for `length`.
- Spatial restriction key supported by the plugin is `restrictedArea`.
- A WFS-T HTTP `200` response that contains an XML error is treated as a failure and shows an error notification.
