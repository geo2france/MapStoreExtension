# Configuration

La configuration se fait dans `localConfig.json` sous le plugin `panel-editor`.

## 1) Configuration globale du plugin (`cfg`)

| Clé | Type | Obligatoire | Description |
|---|---|---:|---|
| `title` | `string` | non | Titre du panneau. |
| `tooltip` | `string` | non | Tooltip du bouton du plugin. |
| `icon` | `string` | non | Icône MapStore (`Glyphicon`). |
| `size` | `number` | non | Largeur de base du panneau (le plugin ajoute +100 px). |
| `geoserver` | `string` | non | URL GeoServer de base (fallback pour WFS). |
| `wfsUrl` | `string` | non | URL WFS globale (prioritaire sur `geoserver`). |
| `layers` | `object` | oui | Dictionnaire des règles par couche (`workspace:layer`). |

## 2) Configuration par couche (`cfg.layers["workspace:layer"]`)

| Clé | Type | Obligatoire | Description |
|---|---|---:|---|
| `featureFieldLabel` | `string` | non | Champ utilisé dans la liste des entités. |
| `featureFielLabel` | `string` | non | Alias toléré (compatibilité). |
| `hidden` | `string[]` | non | Champs masqués en lecture/édition. |
| `fields` | `array` | non | Définition fine des champs (voir tableau suivant). |
| `edit` / `editingRoles` | `string[]` | non | Rôles autorisés à éditer la couche. |
| `delete` / `deletionRoles` | `string[]` | non | Rôles autorisés à supprimer. |
| `wfsUrl` | `string` | non | URL WFS spécifique à la couche. |
| `idField` | `string` | non | Nom du champ identifiant (défaut: `id`). |
| `restrictedArea` | `object` | non | Restriction spatiale d’édition (zone de compétence). |

## 3) Configuration par champ (`fields`)

Chaque entrée de `fields` accepte le format compact:
`[name, label, type, editable, required, roles, options]`

| Position | Nom | Type | Description |
|---:|---|---|---|
| `0` | `name` | `string` | Nom du champ (clé attribut). |
| `1` | `label` | `string` | Libellé affiché. |
| `2` | `type` | `string` | Type UI (`string`, `number`, `date`, `select`, etc.). |
| `3` | `editable` | `boolean` | Champ éditable ou non. |
| `4` | `required` | `boolean` | Champ obligatoire. |
| `5` | `roles` | `string[]` | Rôles autorisés à éditer ce champ. |
| `6` | `options` | `array` | Valeurs pour listes (`select`). |

## Exemple complet (global + couche + champs)

```json
{
  "name": "panel-editor",
  "cfg": {
    "title": "Projets avisés",
    "tooltip": "Projets avisés",
    "icon": "map",
    "size": 420,
    "geoserver": "http://localhost/geoserver",
    "layers": {
      "test:avisee_projets": {
        "featureFieldLabel": "nom",
        "idField": "id",
        "hidden": [
          "geom",
          "log_date_crea",
          "log_date_modi",
          "log_user_crea",
          "log_user_modi"
        ],
        "edit": ["EDITOR", "ADMIN"],
        "delete": ["ADMIN"],
        "restrictedArea": {
          "url": "/console/account/areaofcompetence",
          "operation": "INTERSECTS"
        },
        "fields": [
          ["numero_identifiant", "Identifiant", "string", true, true],
          ["nom", "Nom", "string", false, true],
          ["etat", "Etat", "select", true, false, ["EDITOR", "ADMIN"], ["Nouveau", "Validé", "Refusé"]],
          ["commentaire", "Commentaire", "string", true, false]
        ]
      }
    }
  }
}
```

## Notes importantes

- La liste des entités affiche un label au format:
  `[numero] - (nom_champ) valeur_champ`.
- `ADMIN` / `ROLE_ADMIN` a tous les droits.
- Si un champ est `required` et vide, il reste éditable même si `editable` vaut `false`.
- La clé de restriction spatiale utilisée par le plugin est `restrictedArea`.
