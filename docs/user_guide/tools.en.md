# Role restrictions

The plugin applies permissions at layer and field levels.

## General rules

- `ADMIN` (or `ROLE_ADMIN`) has full access.
- Without `edit`/`editingRoles`, layer editing is allowed.
- Without `delete`/`deletionRoles`, delete follows layer edit permission.

## Field rules

- If a field has `editable: false`, it is read-only.
- If a field defines `roles`, only those roles can edit it.
- Active business override:
  a `required` field with an empty value stays editable, even if configured as non-editable.

## Action buttons

- Read mode: pencil button to enter edit mode.
- Edit mode: save (green), cancel (yellow), delete (red).
- Buttons stay visible in the static toolbar (outside scroll area).

## UI behavior based on permissions

- If the user cannot edit the layer, the pencil button is disabled.
- In edit mode, unauthorized fields are still shown but stay read-only.
- A `required` empty field becomes editable to allow mandatory input.
- Delete button is enabled only when delete permission is granted.
- Hidden fields (`hidden`) are not rendered in the UI.
