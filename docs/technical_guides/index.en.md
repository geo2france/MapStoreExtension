# Technical Guide

## Plugin architecture

Code organization:

- `js/extension/components`: React UI (no direct I/O).
- `js/extension/stateManagement`: actions, reducer, selectors, epics.
- `js/extension/requests`: I/O calls (WFS, area of competence).
- `js/extension/utiles`: pure helpers (permissions, attributes, i18n, geometry).
- `js/extension/plugin`: MapStore wiring (`createPlugin`, reducers, epics).

Expected Redux flow:

1. Component dispatches an action.
2. Epic intercepts and calls `requests`.
3. Success/error dispatches Redux actions.
4. Selectors feed the UI.

## Local install

Prerequisites:

- Node.js and npm
- repository cloned with MapStore2 submodule

Commands:

```bash
npm install
npm start
```

Application runs on `http://localhost:8081`.

## Build extension

```bash
npm run ext:build
```

The extension zip is generated in `dist/`.

## Configuration notes

- Plugin is declared in `assets/index.json` with name `panel-editor`.
- Extension name is defined in `config.js`.
- Runtime configuration is in `configs/localConfig.json`.

## Additional reference

For more details about MapStore extension patterns and plugin development, see the official repository:

- [MapStoreExtension (GeoSolutions)](https://github.com/geosolutions-it/MapStoreExtension)
