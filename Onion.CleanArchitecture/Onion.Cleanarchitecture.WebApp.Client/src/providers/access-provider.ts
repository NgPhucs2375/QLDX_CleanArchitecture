import { AccessControlProvider } from "@refinedev/core";
import { authProvider } from "./auth-provider";

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action }) => {
    if (!authProvider || typeof authProvider.getPermissions !== "function") {
      return {
        can: false,
        reason: "AuthProvider or getPermissions is undefined",
      };
    }

    const raw = await authProvider.getPermissions();

    // TH1: raw là JSON string chứa mảng permission (từ JWT claim "roles")
    if (typeof raw === "string" && raw.length > 0) {
      try {
        const parsed = JSON.parse(raw);
        const permissions = Array.isArray(parsed) ? parsed : (parsed?.permissions ?? []);
        for (const p of permissions) {
          if (p.resource === resource && p.action.includes(action)) {
            return { can: true };
          }
        }
      } catch {
        // không phải JSON hợp lệ → fall sang TH2
      }
    }

    // TH2: raw là mảng tên role (vd ["Admin", "SuperAdmin"])
    if (Array.isArray(raw)) {
      if (raw.includes("SuperAdmin") || raw.includes("Admin")) {
        return { can: true };
      }
    }

    return { can: false, reason: "Unauthorized" };
  },
  options: {
    buttons: {
      enableAccessControl: true,
      hideIfUnauthorized: true,
    },
  },
};
