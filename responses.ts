export interface PagedResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results: T[];
}
export type FITNESS_LEVEL = 'BEGINNER' | 'INTERMEDIATE' | 'PRO';
export const FITNESS_LEVELS: FITNESS_LEVEL[] = [
  'BEGINNER',
  'INTERMEDIATE',
  'PRO',
];
export type GENDER = 'MALE' | 'FEMALE';
export const GENDERS = ['MALE', 'FEMALE'];
export type GOAL =
  | 'LOSE_WEIGHT'
  | 'BUILD_MUSCLE'
  | 'FLEXIBILITY'
  | 'WELLNESS'
  | 'CARDIO';
export const GOALS = [
  'LOSE_WEIGHT',
  'BUILD_MUSCLE',
  'FLEXIBILITY',
  'WELLNESS',
  'CARDIO',
];
export type WEIGHT_UNIT = 'kg' | 'lb' | 'st';
export type INGREDIENT_UNIT = 'METRIC' | 'IMPERIAL';
export type HEIGHT_UNIT = 'm' | 'ft';
export const HEIGHT_UNITS = ['m', 'ft'];
export const HEIGHT_UNITS_DISPLAY = ['m / cm', 'ft / in'];
export const WEIGHT_UNITS = ['kg', 'lb', 'st'];
export const WEIGHT_UNITS_DISPLAY = ['kg / g', 'lbs', 'st / lbs'];

export const INGREDIENT_UNITS = ['METRIC', 'IMPERIAL'];
export const INGREDIENT_UNITS_DISPLAY = [
  'Metric (g / kg) ',
  'Imperial (lbs / oz)',
];

export type NOTIFICATION_TYPE =
  | 'WORKOUT_UPCOMING'
  | 'WORKOUT_COMPLETE'
  | 'WORKOUT_MISSED'
  | 'PERIOD_DUE'
  | 'COMMENT'
  | 'REPLY'
  | 'NEW_CHALLENGE'
  | 'CHALLENGE_STARTED'
  | 'CHALLENGE_ENDED';

export const NOTIFICATION_TYPES = [
  'CHALLENGE_ENDED',
  'CHALLENGE_STARTED',
  'COMMENT',
  'NEW_CHALLENGE',
  'PERIOD_DUE',
  'REPLY',
  'WORKOUT_COMPLETE',
  'WORKOUT_MISSED',
  'WORKOUT_UPCOMING',
];

export type Profile = {
  avatar: string | null;
  date_of_birth: string | null;
  days_a_week_workout: number | null;
  first_name: string | null;
  fitness_level: FITNESS_LEVEL | null;
  gender: GENDER | null;
  goal: GOAL | null;
  height: number | null; // cm
  height_units: HEIGHT_UNIT | null;
  ingredient_units: INGREDIENT_UNIT | null;
  id?: string;
  last_name: string | null;
  weight: number | null; // kg
  weight_units: WEIGHT_UNIT | null;
};
export type ProfileSummary = {
  id: string;
  avatar: string | null;
  first_name: string | null;
  last_name: string | null;
};
export type WorkoutCategory = {
  id: string;
  colour: string;
  name: string;
};
export type ProgramCategory = {
  id: string;
  colour: string;
  name: string;
};
export type ProgramSummary = {
  category: ProgramCategory;
  featured: boolean;
  id: string;
  image: string;
  is_test: boolean;
  name: string;
  published_date: string;
};
export type WorkoutSummary = {
  id: string;
  category: WorkoutCategory;
  exercise_count: number;
  estimated_duration: number;
  image: string;
  name: string;
};
export type Equipment = {
  id: string;
  image: string;
  name: string;
};
export type Program = {
  category: ProgramCategory;
  description: string;
  equipment: Equipment[];
  featured: boolean;
  id: string;
  image: string;
  is_test: boolean;
  length: number;
  name: string;
  published_date: string;
  workouts: (WorkoutSummary & {day: number})[];
};
export type Exercise = {
  id: string;
  name: string;
  image: string;
  sets: number | null;
  reps: number | null;
  duration: number | null;
  video: string;
};
export type PurchaseType = 'PROGRAM';

export type Purchase = {
  id: string;
  qonversion_id: string;
  product_id: string;
  product_type: PurchaseType;
};

export type MuscleGroup = 'ABS' | 'CHEST' | 'QUADS'; //todo

export type Workout = {
  id: string;
  featured: boolean;
  name: string;
  category: WorkoutCategory;
  exercises: Exercise[];
  muscle_groups: MuscleGroup[];
  equipment: Equipment[];
};
export type AchievementCategory = {
  id: string;
  colour: string;
  name: string;
};
export type RecipeTag = {
  id: string;
  colour: string;
  name: string;
};
export type AchievementDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type Achievement = {
  id: string;
  name: string;
  description: string;
  difficulty: AchievementDifficulty;
  category: AchievementCategory;
};
export type WorkoutCount = {
  completed: number;
  total: number;
  streak: number;
};
export type UserExercise = {
  id: string;
  /** * whether the user has completed that exercise */
  completed: boolean;
  skipped: boolean; // whether the user has completed that exercise
  excercise: Exercise;
  reps: number | null; // reps tracked (if applicable)
  weight: number | null; // weight tracked (if applicable)
};
export type UserWorkout = {
  id: string;
  workout: Workout;
  completed: boolean;
  user_exercises: UserExercise[];
  achievements: Achievement[];
};
export type Currency = 'CAD' | 'USD' | 'EUR' | 'GBP';
export type ChargbeePlan = {
  id: string;
  price_id: string;
  price: number;
  currency: Currency;
};

export type RecipeSummary = {
  id: string;
  name: string;
  category: RecipeCategory;
  tags: RecipeTag[];
  image: string;
};
export type RecipeMethod = {title: string; description: string};
export type RecipeIngredient = {
  name: string;
  value: number;
  unit: WEIGHT_UNIT | null;
  custom_unit: string | null;
};
export type Recipe = {
  id: string;
  name: string;
  category: RecipeCategory;
  tags: RecipeTag[];
  image: string;
  method: RecipeMethod[];
  ingredients: RecipeIngredient[];
  calories: number;
  proteins: number;
  sugar: number;
  fats: number;
};

export type RecipeCategory = {
  name: string;
  colour?: string;
  id: string;
};

export type DiscussionSummary = {
  title: string;
  images: string[] | null;
  content: string;
  created_at: string;
  id: string;
  like_count: number;
  comment_count: number;
  author: ProfileSummary;
  category: DiscussionCategory;
};

export type Comment = {
  author: ProfileSummary;
  tagged_user?: ProfileSummary;
  images: string[] | null;
  message: string;
  like_count: number;
};

export type DiscussionCategory = {
  name: string;
  icon: string;
  id: string;
};

export enum Mood {
  'VERY_UNHAPPY',
  'UNHAPPY',
  'NEUTRAL',
  'HAPPY',
  'VERY_HAPPY',
}

export type Progress = {
  id?: string;
  image: string | null;
  mood: Mood;
  weight: number | null;
  arms: number | null;
  legs: number | null;
  waist: number | null;
  hips: number | null;
};

export type EndProgress = Progress & {start_id: string | null};

export type Notification = {
  read: boolean;
  url: string | null;
  notification_type: NOTIFICATION_TYPE;
  created_date: string;
  title: string;
  text: string;
};

export type ScheduleStatus = 'COMPLETED' | 'SKIPPED' | 'UPCOMING';

export type ScheduleSummary = {
  date: string;
  status: ScheduleStatus;
  menstrual: boolean | null;
  workout_id: string | null;
};

export type ScheduleDay = {
  date: string;
  status: ScheduleStatus;
  menstrual: boolean | null;
  workout: WorkoutSummary;
};

export type ID = {
  id: string;
};
export type PaymentData = {
  //ignore for now, needed for stripe
  clientSecret: string;
  customerId: string;
  customerEphemeralKey: string;
};

export type Url = {
  url: string;
};
export type DailyInspiration = {
  image: string;
  content: string;
};
export type MenstrualHealth = {
  cycle_length: number;
  start_date: string;
};

export type MenstrualHealthConflicts = {
  days: string[];
};

export type WaterTracker = {
  id: string;
  date: string;
  value: number;
};

export type NotificationDateTime = {
  date_display?: string;
  time?: string;
};

export type NotificationsResponse = Notification & NotificationDateTime;

export type NotificationCount = {
  count: number;
};

export type Res = {
  confirmEmail: ID;
  forgotPassword: ID;
  program: Program;
  programs: PagedResponse<ProgramSummary>;
  resendConfirmationEmail: {};
  resetPassword: {};
  setPassword: {};
  user: Profile | null;
  userPrograms: ProgramSummary[]; // Programs the user has enrolled to
  workoutCategories: WorkoutCategory[];
  workouts: PagedResponse<WorkoutSummary>;
  workout: Workout;
  paymentData: PaymentData;
  userWorkout: UserWorkout; // The workout which the
  workoutCount: WorkoutCount; // The user's number of workouts achievement data
  purchases: Purchase[];
  chargebeeHostedPages: Url;
  chargebeePlans: ChargbeePlan[];
  favouriteRecipes: string[];
  recipes: PagedResponse<RecipeSummary>;
  recipe: Recipe;
  recipeCategories: RecipeCategory[];
  discussions: PagedResponse<DiscussionSummary>;
  discussionCategories: DiscussionCategory[];
  discussion: DiscussionSummary;
  discussionComments: PagedResponse<Comment>;
  discussionReport: {};
  commentReport: {};
  discussionComment: ID;
  dailyInspiration: DailyInspiration;
  menstrualHealth: MenstrualHealth;
  menstrualHealthConflicts: MenstrualHealthConflicts;
  waterTracker: WaterTracker;
  achievements: Achievement[];
  userAchievements: Achievement[];
  userProgressStart: Progress;
  userProgressEnd: EndProgress;
  notifications: PagedResponse<NotificationsResponse>;
  notificationsCounts: NotificationCount;
  notificationsRead: {};
  schedule: ScheduleSummary[];
  scheduleDay: ScheduleDay;
  // draftProfile: Partial<Profile>   //Partial type not supported by intermock
  onboardingProgress: number | null;
  redirect: Url;
  notificationDevice: {};
  testNotification: {};
  // END OF TYPES
};
