# Restrictions par rôles

Le plugin applique les droits par couche et par champ.

## Règles générales

- `ADMIN` (ou `ROLE_ADMIN`) a tous les droits.
- Sans règle `edit`/`editingRoles`, l’édition de la couche est autorisée.
- Sans règle `delete`/`deletionRoles`, la suppression suit la règle d’édition.

## Règles par champ

- Si un champ a `editable: false`, il est en lecture seule.
- Si un champ définit des `roles`, seuls ces rôles peuvent l’éditer.
- Exception métier active :
  un champ `required` sans valeur reste éditable, même s’il est non éditable par config, pour permettre la saisie obligatoire.

## Boutons d’action

- Lecture : bouton stylo pour passer en édition.
- Édition : sauvegarder (vert), annuler (jaune), supprimer (rouge).
- Les actions restent visibles en haut du panneau (hors scroll).

## Gestion d’interface selon les droits

- Si l’utilisateur ne peut pas éditer la couche, le bouton stylo est désactivé.
- En mode édition, un champ non autorisé reste affiché mais en lecture seule.
- Un champ `required` vide devient éditable pour permettre la saisie obligatoire.
- Le bouton supprimer est activé uniquement si l’utilisateur possède le droit de suppression.
- Les champs masqués (`hidden`) ne sont pas affichés dans l’interface.
