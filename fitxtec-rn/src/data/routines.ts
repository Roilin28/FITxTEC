export type Routine = {
    id: string;
    name: string;
    description: string;
    level: "Beginner" | "Intermediate" | "Advanced";
    duration: string;
    days: number;
    exercises: Exercise[];
};

export type Exercise = {
    id: string;
    name: string;
    sets: number;
    reps: number;
    restSec: number;
};

export const routines: Routine[] = [
    {
        id: "r1",
        name: "Full Body Starter",
        description: "A complete routine for building strength evenly.",
        level: "Beginner",
        duration: "45 min",
        days: 3,
        exercises: [
            { id: "e1", name: "Squats", sets: 3, reps: 12, restSec: 90 },
            { id: "e2", name: "Bench Press", sets: 3, reps: 10, restSec: 90 },
            { id: "e3", name: "Deadlift", sets: 3, reps: 8, restSec: 120 },
        ],
    },
    {
        id: "r2",
        name: "Push Day - Upper Body",
        description: "Focus on chest, shoulders and triceps.",
        level: "Intermediate",
        duration: "60 min",
        days: 4,
        exercises: [
            { id: "e4", name: "Bench Press", sets: 4, reps: 8, restSec: 90 },
            { id: "e5", name: "Overhead Press", sets: 3, reps: 10, restSec: 90 },
            { id: "e6", name: "Triceps Dips", sets: 3, reps: 12, restSec: 60 },
        ],
    },
];
