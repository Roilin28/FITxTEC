import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import colors from "../theme/color";
import { getRutinaDeep, RutinaCompleta } from "../services/Routines";
import { useAuth } from "../services/AuthContext";
import {
    saveRoutine,
    getSavedRoutine,
    removeSavedRoutineByRutina,
} from "../services/savedRoutines";
import { crearRutinaEnProgreso, getRutinasEnProgreso } from "../services/rutinasEnProgreso";

type RootStackParamList = {
    RoutinesMain: undefined;
    RoutineDetails: { routineId: string };
};

type TabParamList = {
    HomeTab: undefined;
    RoutinesTab: undefined;
    WorkoutTab: {
        screen?: string;
        params?: { rutinaEnProgresoId: string };
    };
    ProgressTab: undefined;
    ProfileTab: undefined;
};

export default function RoutineDetailsScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const tabNavigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
    const route = useRoute();
    const { user } = useAuth();
    const { routineId } = route.params as { routineId: string };

    const [rutina, setRutina] = useState<RutinaCompleta | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [checkingSaved, setCheckingSaved] = useState(true);

    useEffect(() => {
        const fetchRutina = async () => {
            setLoading(true);
            try {
                const data = await getRutinaDeep(routineId);
                setRutina(data);
            } catch (e) {
                console.error("Error al obtener rutina:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchRutina();
    }, [routineId]);

    useEffect(() => {
        const checkSaved = async () => {
            if (!user) {
                setCheckingSaved(false);
                return;
            }

            try {
                const saved = await getSavedRoutine(user.id, routineId);
                setIsSaved(!!saved);
            } catch (e) {
                console.error("Error al verificar rutina guardada:", e);
            } finally {
                setCheckingSaved(false);
            }
        };
        checkSaved();
    }, [user, routineId]);

    const handleSaveRoutine = async () => {
        if (!user) return;

        setSaving(true);
        try {
            if (isSaved) {
                await removeSavedRoutineByRutina(user.id, routineId);
                setIsSaved(false);
            } else {
                await saveRoutine(user.id, routineId);
                setIsSaved(true);
            }
        } catch (e) {
            console.error("Error al guardar/eliminar rutina:", e);
        } finally {
            setSaving(false);
        }
    };

    const handleStartWorkout = async () => {
        if (!user || !rutina) return;

        try {
            // Verificar si ya existe una rutina en progreso para esta rutina
            const rutinasEnProgreso = await getRutinasEnProgreso(user.id);
            const rutinaExistente = rutinasEnProgreso.find(
                (r) => r.rutinaId === routineId
            );

            if (rutinaExistente) {
                // Si ya hay una rutina en progreso, continuar con esa
                tabNavigation.navigate("WorkoutTab", {
                    screen: "WorkoutDetail",
                    params: { rutinaEnProgresoId: rutinaExistente.id! },
                });
                return;
            }

            // Crear una nueva rutina en progreso
            const rutinaEnProgresoId = await crearRutinaEnProgreso(
                user.id,
                routineId,
                rutina.cantidadDias
            );

            // Navegar a la pantalla de workout
            tabNavigation.navigate("WorkoutTab", {
                screen: "WorkoutDetail",
                params: { rutinaEnProgresoId },
            });
        } catch (e) {
            console.error("Error al iniciar workout:", e);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <LinearGradient
                    colors={["#0e0f13", "#10131b", "#151820"]}
                    style={styles.gradient}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!rutina) {
        return (
            <SafeAreaView style={styles.safe}>
                <LinearGradient
                    colors={["#0e0f13", "#10131b", "#151820"]}
                    style={styles.gradient}
                />
                <View style={styles.navbar}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={styles.brand}>FITxTEC</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Rutina no encontrada.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const totalExercises = rutina.dias?.reduce(
        (total, dia) => total + (dia.ejercicios?.length || 0),
        0
    ) || 0;

    return (
        <SafeAreaView style={styles.safe}>
            <LinearGradient
                colors={["#0e0f13", "#10131b", "#151820"]}
                style={styles.gradient}
            />

            {/* Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.brand}>FITxTEC</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Info */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 400 }}
                    style={styles.headerCard}
                >
                    <View style={styles.headerIconContainer}>
                        <Ionicons
                            name="barbell"
                            size={32}
                            color={colors.primary}
                        />
                    </View>
                    <Text style={styles.routineTitle}>{rutina.nombre}</Text>
                    <Text style={styles.routineDescription}>
                        {rutina.descripcion}
                    </Text>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons
                                name="calendar-outline"
                                size={18}
                                color={colors.textMuted}
                            />
                            <Text style={styles.statText}>
                                {rutina.cantidadDias} días
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons
                                name="time-outline"
                                size={18}
                                color={colors.textMuted}
                            />
                            <Text style={styles.statText}>
                                {rutina.tiempoAproximado}
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons
                                name="barbell-outline"
                                size={18}
                                color={colors.textMuted}
                            />
                            <Text style={styles.statText}>
                                {totalExercises} ejercicios
                            </Text>
                        </View>
                    </View>

                    {/* Difficulty Badge */}
                    <View style={styles.difficultyContainer}>
                        <View
                            style={[
                                styles.difficultyBadge,
                                {
                                    backgroundColor:
                                        rutina.nivelDificultad === "Beginner"
                                            ? "#22D3EE"
                                            : rutina.nivelDificultad ===
                                              "Intermediate"
                                            ? "#F59E0B"
                                            : "#EF4444",
                                },
                            ]}
                        >
                            <Text style={styles.difficultyText}>
                                {rutina.nivelDificultad}
                            </Text>
                        </View>
                    </View>
                </MotiView>

                {/* Notas */}
                {rutina.notas && (
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: "timing", duration: 400, delay: 100 }}
                        style={styles.notesCard}
                    >
                        <View style={styles.notesHeader}>
                            <Ionicons
                                name="information-circle-outline"
                                size={20}
                                color={colors.primary}
                            />
                            <Text style={styles.notesTitle}>Notas</Text>
                        </View>
                        <Text style={styles.notesText}>{rutina.notas}</Text>
                    </MotiView>
                )}

                {/* Days Section */}
                <View style={styles.daysSection}>
                    <Text style={styles.sectionTitle}>Plan de Entrenamiento</Text>
                    {rutina.dias?.map((dia, index) => (
                        <MotiView
                            key={dia.id}
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{
                                type: "timing",
                                duration: 400,
                                delay: 150 + index * 100,
                            }}
                            style={styles.dayCard}
                        >
                            <View style={styles.dayHeader}>
                                <Text style={styles.dayTitle}>
                                    {dia.nombre || `Día ${dia.id}`}
                                </Text>
                                <Text style={styles.dayExercisesCount}>
                                    {dia.ejercicios?.length || 0} ejercicios
                                </Text>
                            </View>

                            {dia.ejercicios && dia.ejercicios.length > 0 && (
                                <View style={styles.exercisesList}>
                                    {dia.ejercicios.map((ejercicio, ejIndex) => (
                                        <View
                                            key={ejercicio.id || ejIndex}
                                            style={styles.exerciseItem}
                                        >
                                            <View style={styles.exerciseBullet} />
                                            <View style={styles.exerciseInfo}>
                                                <Text style={styles.exerciseName}>
                                                    {ejercicio.nombre}
                                                </Text>
                                                <Text style={styles.exerciseSets}>
                                                    {ejercicio.series} series
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </MotiView>
                    ))}
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <SafeAreaView edges={["bottom"]} style={styles.actionButtonsContainer}>
                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            isSaved && styles.saveButtonActive,
                        ]}
                        onPress={handleSaveRoutine}
                        disabled={saving || checkingSaved}
                    >
                        {checkingSaved || saving ? (
                            <ActivityIndicator
                                size="small"
                                color={isSaved ? colors.primaryText : colors.primary}
                            />
                        ) : (
                            <>
                                <Ionicons
                                    name={isSaved ? "bookmark" : "bookmark-outline"}
                                    size={20}
                                    color={isSaved ? colors.primaryText : colors.primary}
                                />
                                <Text
                                    style={[
                                        styles.saveButtonText,
                                        isSaved && styles.saveButtonTextActive,
                                    ]}
                                >
                                    {isSaved ? "Guardada" : "Guardar"}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={handleStartWorkout}
                    >
                        <Ionicons name="play" size={20} color={colors.primaryText} />
                        <Text style={styles.startButtonText}>Iniciar Rutina</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.bg,
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
        borderBottomWidth: 1,
        borderBottomColor: "#1f1f1f",
    },
    backButton: {
        padding: 4,
        width: 40,
    },
    brand: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "800",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    errorText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    headerCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: `${colors.primary}20`,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    routineTitle: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
    },
    routineDescription: {
        color: colors.textMuted,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statText: {
        color: colors.text,
        fontSize: 13,
        fontWeight: "500",
    },
    difficultyContainer: {
        alignItems: "flex-start",
    },
    difficultyBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    difficultyText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    notesCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    notesHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    notesTitle: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: "700",
    },
    notesText: {
        color: colors.text,
        fontSize: 14,
        lineHeight: 20,
    },
    daysSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
    },
    dayCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dayHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    dayTitle: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: "700",
    },
    dayExercisesCount: {
        color: colors.textMuted,
        fontSize: 13,
    },
    exercisesList: {
        gap: 10,
    },
    exerciseItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    exerciseBullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    exerciseInfo: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    exerciseName: {
        color: colors.text,
        fontSize: 15,
        fontWeight: "500",
        flex: 1,
    },
    exerciseSets: {
        color: colors.textMuted,
        fontSize: 13,
    },
    actionButtonsContainer: {
        backgroundColor: colors.bg,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    actionButtonsRow: {
        flexDirection: "row",
        gap: 12,
    },
    saveButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: "transparent",
        gap: 8,
        minWidth: 120,
    },
    saveButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    saveButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: "700",
    },
    saveButtonTextActive: {
        color: colors.primaryText,
    },
    startButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: colors.primary,
        gap: 8,
    },
    startButtonText: {
        color: colors.primaryText,
        fontSize: 16,
        fontWeight: "700",
    },
});

