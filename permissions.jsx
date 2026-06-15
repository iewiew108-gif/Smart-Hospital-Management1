// =========================================================
// Permissions — Role-based access control
// =========================================================
// Roles: admin | lead | member | viewer

const ROLE_MENUS = {
  admin:  "all",
  lead:   ["dashboard","hospitals","team","gateway","reports","summary","leader-summary","installation-timeline","installation-calendar","team-schedule","calendar","targets"],
  member: ["dashboard","hospitals","team","gateway","reports","summary","installation-timeline","installation-calendar","team-schedule","calendar"],
  viewer: ["dashboard","hospitals","reports","summary"],
};

const ROLE_CAPS = {
  //                    canEdit  canEditTeam  canEditTargets  canViewTeam  canViewGateway
  admin:  { canEdit: true,  canEditTeam: true,  canEditTargets: true,  canViewTeam: true,  canViewGateway: true  },
  lead:   { canEdit: true,  canEditTeam: false, canEditTargets: false, canViewTeam: true,  canViewGateway: true  },
  member: { canEdit: false, canEditTeam: false, canEditTargets: false, canViewTeam: true,  canViewGateway: true  },
  viewer: { canEdit: false, canEditTeam: false, canEditTargets: false, canViewTeam: false, canViewGateway: false },
};

const ROLE_LABELS = {
  admin:  { label: "Admin",   color: "#ef4444" },
  lead:   { label: "Lead",    color: "#f59e0b" },
  member: { label: "Member",  color: "#3b82f6" },
  viewer: { label: "Viewer",  color: "#94a3b8" },
};

const canAccessMenu = (role, menuId) => {
  const allowed = ROLE_MENUS[role] || ROLE_MENUS.viewer;
  if (allowed === "all") return true;
  return allowed.includes(menuId);
};

const getPerms = (role) => ROLE_CAPS[role] || ROLE_CAPS.viewer;

const getRoleLabel = (role) => ROLE_LABELS[role] || ROLE_LABELS.viewer;

Object.assign(window, { canAccessMenu, getPerms, getRoleLabel, ROLE_LABELS });
