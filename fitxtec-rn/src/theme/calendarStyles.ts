import { StyleSheet } from "react-native";

export const calendarStyles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0e0f13" },
    gradient: { ...StyleSheet.absoluteFillObject },
    navbar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#1f1f1f",
    },
    brand: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    backBtn: { padding: 4 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    header: { marginBottom: 16 },
    headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
    headerSubtitle: { color: "#999", fontSize: 13, marginTop: 4 },
    monthNavigator: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    navButton: {
        padding: 8,
    },
    monthDisplay: {
        flex: 1,
        alignItems: "center",
    },
    monthText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    calendar: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 10,
        marginBottom: 20,
    },
    dayBox: {
        width: "13%",
        aspectRatio: 1,
        marginVertical: 6,
        backgroundColor: "#1a1d24",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#222",
    },
    dayText: { color: "#fff", fontSize: 13 },
    dayCompleted: { backgroundColor: "#1f2a1f", borderColor: "#7EE300" },
    daySelected: { borderColor: "#00FF6A", backgroundColor: "#212c1f" },
    dayToday: { borderColor: "#FFA500", borderWidth: 2 },
    dayTodayText: { color: "#FFA500", fontWeight: "700" },

    // Summary card
    summaryCard: {
        backgroundColor: "#15171f",
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: "#222",
    },
    summaryTitle: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 17,
        marginBottom: 12,
    },
    summaryHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
    },
    summaryText: { color: "#fff", fontSize: 15, fontWeight: "600" },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    statBox: {
        alignItems: "center",
        flex: 1,
    },
    statValue: { color: "#fff", fontSize: 15, fontWeight: "700", marginTop: 4 },
    statLabel: { color: "#888", fontSize: 12 },

    exercisesSection: { marginTop: 4 },
    sectionTitle: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
        marginBottom: 8,
    },
    exerciseRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1b1f27",
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
    },
    exerciseName: { color: "#fff", fontWeight: "600", fontSize: 14 },
    exerciseSub: { color: "#aaa", fontSize: 12 },

    // When no workout
    noWorkoutBox: {
        alignItems: "center",
        paddingVertical: 30,
    },
    noWorkoutText: {
        color: "#ccc",
        fontSize: 14,
        marginTop: 8,
        marginBottom: 16,
    },
    addBtn: {
        backgroundColor: "#7EE300",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    addBtnText: {
        color: "#000",
        fontWeight: "700",
        fontSize: 14,
    },
});
