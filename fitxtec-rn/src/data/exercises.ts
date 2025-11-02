// Banco mínimo y extensible de ejercicios por grupo
export type ExerciseItem = {
  id: string;                 // slug único, lo usarás como docId en /ejercicios
  name: string;               // cómo se muestra
  level?: "Beginner" | "Intermediate" | "Advanced";
  equipment?: ("machine" | "barbell" | "dumbbell" | "cable" | "bodyweight")[];
  aliases?: string[];         // sinónimos para mapear desde prompts
  contraindications?: string[]; // p.ej. "shoulder_pain", "lower_back_pain"
};

export type ExerciseBank = {
  upper_compounds: ExerciseItem[];
  upper_accessories: {
    chest: ExerciseItem[];
    back: ExerciseItem[];
    shoulders: ExerciseItem[];
    biceps: ExerciseItem[];
    triceps: ExerciseItem[];
    forearms: ExerciseItem[];
  };
  lower_compounds: ExerciseItem[];
  lower_accessories: {
    quads: ExerciseItem[];
    hamstrings: ExerciseItem[];
    glutes: ExerciseItem[];
    calves: ExerciseItem[];
    core: ExerciseItem[];
  };
};

export const EXERCISES: ExerciseBank = {
  upper_compounds: [
    { id:"barbell_bench_press", name:"Barbell Bench Press", equipment:["barbell"] },
    { id:"incline_db_press", name:"Incline Dumbbell Press", equipment:["dumbbell"] },
    { id:"seated_cable_row", name:"Seated Cable Row", equipment:["cable"] },
    { id:"lat_pulldown", name:"Lat Pulldown", equipment:["machine","cable"] },
    { id:"db_shoulder_press", name:"Dumbbell Shoulder Press", equipment:["dumbbell"] },
    { id:"pushups", name:"Push-ups", equipment:["bodyweight"], level:"Beginner" },
  ],
  upper_accessories: {
    chest: [
      { id:"pec_fly_machine", name:"Pec Fly Machine", equipment:["machine"] },
      { id:"cable_crossover", name:"Cable Crossover", equipment:["cable"] },
    ],
    back: [
      { id:"one_arm_db_row", name:"One-arm Dumbbell Row", equipment:["dumbbell"] },
      { id:"t_bar_row_machine", name:"T-Bar Row Machine", equipment:["machine"] },
    ],
    shoulders: [
      { id:"db_lateral_raise", name:"Dumbbell Lateral Raise", equipment:["dumbbell"] },
      { id:"rear_delt_fly_machine", name:"Rear Delt Fly Machine", equipment:["machine"] },
      { id:"face_pull", name:"Face Pull", equipment:["cable"] },
    ],
    biceps: [
      { id:"cable_curl", name:"Cable Curl", equipment:["cable"] },
      { id:"preacher_curl", name:"Preacher Curl", equipment:["machine","barbell","dumbbell"] },
      { id:"hammer_curl", name:"Hammer Curl", equipment:["dumbbell"] },
    ],
    triceps: [
      { id:"triceps_rope_pushdown", name:"Triceps Rope Pushdown", equipment:["cable"] },
      { id:"overhead_triceps_extension", name:"Overhead Triceps Extension", equipment:["dumbbell","cable"] },
      { id:"dips_machine", name:"Dips Machine", equipment:["machine"] },
    ],
    forearms: [
      { id:"wrist_curl", name:"Wrist Curl", equipment:["dumbbell","barbell"] },
    ],
  },
  lower_compounds: [
    { id:"leg_press", name:"Leg Press", equipment:["machine"] },
    { id:"barbell_back_squat", name:"Barbell Back Squat", equipment:["barbell"], contraindications:["lower_back_pain"] },
    { id:"romanian_deadlift", name:"Romanian Deadlift", equipment:["barbell","dumbbell"], contraindications:["lower_back_pain"] },
    { id:"hip_thrust", name:"Hip Thrust", equipment:["barbell","machine"] },
  ],
  lower_accessories: {
    quads: [
      { id:"leg_extension", name:"Leg Extension", equipment:["machine"] },
      { id:"split_squat", name:"DB Split Squat", equipment:["dumbbell"] },
    ],
    hamstrings: [
      { id:"seated_leg_curl", name:"Seated Leg Curl", equipment:["machine"] },
      { id:"lying_leg_curl", name:"Lying Leg Curl", equipment:["machine"] },
    ],
    glutes: [
      { id:"glute_bridge", name:"Glute Bridge (Machine/BB)", equipment:["machine","barbell"] },
    ],
    calves: [
      { id:"standing_calf_raise", name:"Standing Calf Raise", equipment:["machine","barbell"] },
    ],
    core: [
      { id:"cable_crunch", name:"Cable Crunch", equipment:["cable"] },
      { id:"plank", name:"Plank", equipment:["bodyweight"] },
    ],
  },
};
