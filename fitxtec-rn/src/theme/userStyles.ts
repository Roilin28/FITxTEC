import { StyleSheet } from "react-native";
import colors from "./color";

export const userStyles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#0e0f13",
    },

    navbar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 6,
        backgroundColor: "transparent",
        borderBottomWidth: 1,
        borderBottomColor: "#0e0f13",
    },
    brand: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    profileBtn: {
        padding: 4,
    },

    // 🔹 SECCIONES GENERALES
    section: {
        backgroundColor: "#15171f",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#2b2b2b",
        marginBottom: 20,
        padding: 18,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },

    // 🔹 PERFIL
    profileInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 12,
    },
    avatar: {
        backgroundColor: "#9EFF00",
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: "#0b0f0a",
        fontWeight: "800",
        fontSize: 18,
    },
    profileName: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
    profileEmail: {
        color: "#aaa",
        fontSize: 12,
    },
    badge: {
        backgroundColor: "#333",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 4,
    },
    badgeText: {
        color: "#9EFF00",
        fontSize: 11,
        fontWeight: "600",
    },

    // 🔹 INPUTS Y FORMULARIOS
    inputGroup: {
        gap: 8,
    },
    label: {
        color: "#ccc",
        fontSize: 13,
        marginTop: 6,
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#1a1c24",
        borderRadius: 10,
        padding: 10,
        color: "#fff",
        fontSize: 14,
        borderWidth: 1,
        borderColor: "#2f2f2f",
    },
    optionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 4,
    },
    optionChip: {
        backgroundColor: "#1a1c24",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 2,
        borderColor: "#2f2f2f",
        minWidth: 100,
    },
    optionChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    optionChipText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
    },
    optionChipTextActive: {
        color: colors.primaryText,
    },

    // 🔹 SWITCHES / NOTIFICACIONES
    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },
    switchLabel: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },

    // 🔹 ACCIONES FINALES
    actions: {
        gap: 10,
        marginBottom: 40,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1b1e27",
        borderWidth: 1,
        borderColor: "#2f2f2f",
        borderRadius: 10,
        padding: 12,
        gap: 8,
    },
    actionText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#d93636",
        borderRadius: 10,
        padding: 12,
        gap: 8,
        justifyContent: "center",
    },
logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
},
primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
},
primaryBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
},
// 🔹 ESTADÍSTICAS
statRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
},
statItem: {
    flex: 1,
    backgroundColor: "#1a1c24",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2f2f2f",
},
statValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
},
statLabel: {
    color: "#aaa",
    fontSize: 12,
    textAlign: "center",
},
// 🔹 INFORMACIÓN
infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1c24",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#2f2f2f",
},
infoLabel: {
    color: "#ccc",
    fontSize: 14,
    fontWeight: "500",
},
infoValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
},
});
