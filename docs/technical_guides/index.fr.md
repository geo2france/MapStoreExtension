# Guide technique

## Architecture plugin

Organisation du code :

- `js/extension/components` : UI React (sans I/O direct).
- `js/extension/stateManagement` : actions, reducer, selectors, epics.
- `js/extension/requests` : appels I/O (WFS, zone de compétence).
- `js/extension/utiles` : helpers purs (permissions, attributs, i18n, géométrie).
- `js/extension/plugin` : wiring MapStore (`createPlugin`, reducers, epics).

Flux Redux attendu :

1. Le composant dispatch une action.
2. Un epic intercepte et appelle `requests`.
3. Succès/erreur renvoient des actions Redux.
4. Les selectors alimentent l’UI.

## Installer en local

Prérequis :

- Node.js et npm
- dépôt cloné avec submodule MapStore2

Commandes :

```bash
npm install
npm start
```

Application disponible sur `http://localhost:8081`.

## Build extension

```bash
npm run ext:build
```

Le zip d’extension est généré dans `dist/`.

## Notes de configuration

- Le plugin est déclaré dans `assets/index.json` avec le nom `panel-editor`.
- Le nom d’extension est défini dans `config.js`.
- La configuration d’exécution se fait dans `configs/localConfig.json`.

## Référence complémentaire

Pour plus de détails sur le modèle d’extension et les plugins MapStore, voir le dépôt officiel :

- [MapStoreExtension (GeoSolutions)](https://github.com/geosolutions-it/MapStoreExtension)
