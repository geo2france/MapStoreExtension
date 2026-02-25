const normalizeRoles = (roles) => (Array.isArray(roles) ? roles.filter(Boolean) : []);
const normalizeRole = (role = "") => String(role).replace(/^ROLE_/, "");

export const isAdminRole = (userRole) => userRole === "ADMIN" || userRole === "ROLE_ADMIN";

export const isRoleAllowed = (userRole, allowedRoles = []) => {
    if (isAdminRole(userRole)) {
        return true;
    }
    const safeRoles = normalizeRoles(allowedRoles);
    if (!safeRoles.length) {
        return false;
    }
    const normalizedUserRole = normalizeRole(userRole);
    return safeRoles.includes("ALL")
        || safeRoles.includes(userRole)
        || safeRoles.includes(`ROLE_${normalizedUserRole}`)
        || safeRoles.map(normalizeRole).includes(normalizedUserRole);
};

export const canEditLayer = (userRole, layerConfig = {}) => {
    if (isAdminRole(userRole)) {
        return true;
    }
    const editingRoles = layerConfig?.editingRoles || layerConfig?.edit || [];
    if (!editingRoles.length) {
        return true;
    }
    return isRoleAllowed(userRole, editingRoles);
};

export const canDeleteFeature = (userRole, layerConfig = {}) => {
    if (isAdminRole(userRole)) {
        return true;
    }
    const deletionRoles = layerConfig?.deletionRoles || layerConfig?.delete || layerConfig?.editingRoles || [];
    if (!deletionRoles.length) {
        return canEditLayer(userRole, layerConfig);
    }
    return isRoleAllowed(userRole, deletionRoles);
};

export const canEditField = (userRole, fieldConfig = {}) => {
    if (isAdminRole(userRole)) {
        return true;
    }
    if (fieldConfig?.editable === false) {
        return false;
    }
    const fieldRoles = fieldConfig?.roles || [];
    if (!fieldRoles.length) {
        return true;
    }
    return isRoleAllowed(userRole, fieldRoles);
};
