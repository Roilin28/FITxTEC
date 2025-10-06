import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#0e0f13",
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 60,
    },

    // Hero section
    hero: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 25,
        marginBottom: 15,
    },
    greeting: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
    motivation: {
        color: "#9ca3af",
        fontSize: 14,
        marginTop: 4,
    },

    // Weekly progress
    progressSection: {
        marginTop: 15,
        marginBottom: 20,
    },
    sectionTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
    },
    progressContainer: {
        width: "100%",
        height: 8,
        backgroundColor: "#222",
        borderRadius: 5,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#7EE300",
        borderRadius: 5,
    },
    progressLabel: {
        color: "#999",
        fontSize: 13,
        marginTop: 6,
    },

    // AI recommendation card
    aiCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#15171f",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "#2c2f36",
        marginBottom: 22,
    },
    aiTitle: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },
    aiText: {
        color: "#aaa",
        fontSize: 13,
        marginTop: 4,
    },

    // Days section
    daysSection: {
        marginBottom: 24,
    },
    daysScroll: {
        flexDirection: "row",
        gap: 12,
        paddingVertical: 8,
    },
    dayCard: {
        backgroundColor: "#15171f",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#2f3138",
    },
    dayText: {
        color: "#fff",
        fontSize: 14,
        marginBottom: 4,
    },

    // Workout section
    workoutContainer: {
        backgroundColor: "#15171f",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    headerText: { color: "#ccc", fontSize: 16, marginLeft: 8 },
    title: { color: "white", fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    subtitle: { color: "#888", fontSize: 13, marginBottom: 20 },

    startButton: {
        backgroundColor: "#7EE300",
        paddingVertical: 14,
        borderRadius: 10,
        marginBottom: 10,
    },
    startButtonText: {
        color: "#15171f",
        fontWeight: "700",
        textAlign: "center",
        fontSize: 16,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: "#15171f",
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 10,
        alignItems: "center",
    },
    secondaryButtonText: { color: "#e5e7eb", fontWeight: "700", fontSize: 15 },
    iconButton: {
        flex: 1,
        backgroundColor: "#15171f",
        borderWidth: 1,
        borderColor: "#333",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
});

export default styles;
