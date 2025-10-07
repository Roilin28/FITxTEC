import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0e0f13" },
    gradient: { ...StyleSheet.absoluteFillObject },

    // NAVBAR
    navbar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#0e0f13",
    },
    brand: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    profileBtn: { padding: 4 },

    // HEADER
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerTitle: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "800",
    },
    headerSubtitle: {
        color: "#9ca3af",
        fontSize: 13,
        marginTop: 4,
    },

    // SECTION
    section: { marginTop: 1 },
    sectionTitle: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "700",
        marginLeft: 20,
    },
    sectionSubtitle: {
        color: "#999",
        fontSize: 13,
        marginLeft: 20,
        marginTop: 4,
    },
    carousel: {
        paddingVertical: 14,
        gap: 12,
        paddingLeft: 20,
    },

    // TIP BOX

    tipBox: {
        backgroundColor: "#1a1b21",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#2b2b2b",
    },
    tipText: { color: "#9EFF00", fontWeight: "600", fontSize: 13 },


    // MOTIVATION BOX

    motivationBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginVertical: 20,
        marginHorizontal: 20,
        backgroundColor: "#0e0f13", // 15171f
        borderRadius: 12,
        padding: 12,
        borderWidth: 0,
        borderColor: "#333",
    },
    motivationText: {
        color: "#ccc",
        fontSize: 13,
        flex: 1,
        fontStyle: "italic",
    },

    // ROUTINE CARD
    routineCard: {
        backgroundColor: "#15171f",
        borderRadius: 16,
        padding: 16,
        width: 280,
        borderWidth: 1,
        borderColor: "#2b2e35",
    },
    routineHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    routineName: {
        color: "white",
        fontSize: 16,
        fontWeight: "700",
        flex: 1,
        marginLeft: 6,
    },
    duration: { color: "#aaa", fontSize: 12 },
    tagsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginVertical: 6,
    },
    tagDays: {
        color: "#ddd",
        fontSize: 12,
        backgroundColor: "#1b1e27",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    tagLevel: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    tagLevelText: { color: "#000", fontWeight: "700", fontSize: 12 },
    desc: { color: "#aaa", fontSize: 13, marginBottom: 12 },
    btnRow: { flexDirection: "row", justifyContent: "space-between" },
    viewBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#1b1e27",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#333",
    },
    viewBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
    startBtn: {
        backgroundColor: "#7EE300",
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
    },
    startBtnText: { color: "#000", fontWeight: "700", fontSize: 13 },

    // AI SECTION
    aiCard: {
        backgroundColor: "#15171f",
        borderRadius: 16,
        padding: 20,
        marginTop: 12,
        marginHorizontal: 20,
        borderWidth: 0,
        borderColor: "#2b2e35",
    },
    aiHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 10,
    },
    aiTitle: { color: "white", fontWeight: "700", fontSize: 16 },
    aiDesc: { color: "#aaa", marginBottom: 10 },
    aiBullets: { marginBottom: 16 },
    aiBullet: { color: "#ccc", fontSize: 13, marginBottom: 4 },
    aiButton: {
        backgroundColor: "#7EE300",
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
    },
    aiButtonText: { color: "#000", fontWeight: "700", fontSize: 15 },
});

export default styles;
