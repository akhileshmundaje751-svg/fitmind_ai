import fs from 'fs';
import path from 'path';
import {
  CalculationResults,
  ChatMessage,
  DietPlan,
  ProgressEntry,
  UserProfile,
  WorkoutPlan,
} from '../src/types';
import { calculateFullBodyProfile } from '../src/lib/calculations';

interface DatabaseSchema {
  profile: UserProfile | null;
  calculations: CalculationResults | null;
  dietPlan: DietPlan | null;
  workoutPlan: WorkoutPlan | null;
  progressRecords: ProgressEntry[];
  chatHistory: ChatMessage[];
  version: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'fitmind_db.json');

const INITIAL_DB: DatabaseSchema = {
  profile: null,
  calculations: null,
  dietPlan: null,
  workoutPlan: null,
  progressRecords: [],
  chatHistory: [],
  version: 1,
};

class DatabaseService {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.db = this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[DB] Error reading database file, initializing fresh:', err);
    }
    this.persist(INITIAL_DB);
    return INITIAL_DB;
  }

  private persist(data: DatabaseSchema) {
    try {
      this.ensureDirectory();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
      this.db = data;
    } catch (err) {
      console.error('[DB] Failed to save database file:', err);
    }
  }

  public getProfile(): UserProfile | null {
    return this.db.profile;
  }

  public saveProfile(profile: UserProfile): { profile: UserProfile; calculations: CalculationResults } {
    const calculations = calculateFullBodyProfile(profile);
    const updated = {
      ...this.db,
      profile: {
        ...profile,
        updatedAt: new Date().toISOString(),
      },
      calculations,
    };
    this.persist(updated);
    return { profile: updated.profile, calculations };
  }

  public getCalculations(): CalculationResults | null {
    if (!this.db.calculations && this.db.profile) {
      this.db.calculations = calculateFullBodyProfile(this.db.profile);
      this.persist(this.db);
    }
    return this.db.calculations;
  }

  public getDietPlan(): DietPlan | null {
    return this.db.dietPlan;
  }

  public saveDietPlan(dietPlan: DietPlan): DietPlan {
    const updated = {
      ...this.db,
      dietPlan,
    };
    this.persist(updated);
    return dietPlan;
  }

  public getWorkoutPlan(): WorkoutPlan | null {
    return this.db.workoutPlan;
  }

  public saveWorkoutPlan(workoutPlan: WorkoutPlan): WorkoutPlan {
    const updated = {
      ...this.db,
      workoutPlan,
    };
    this.persist(updated);
    return workoutPlan;
  }

  public getProgress(): ProgressEntry[] {
    return this.db.progressRecords || [];
  }

  public addProgressEntry(entry: ProgressEntry): ProgressEntry[] {
    const existing = this.db.progressRecords || [];
    // If entry for same date exists, update it; otherwise append
    const idx = existing.findIndex((e) => e.date === entry.date);
    let updatedRecords: ProgressEntry[];
    if (idx >= 0) {
      updatedRecords = [...existing];
      updatedRecords[idx] = entry;
    } else {
      updatedRecords = [entry, ...existing].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
    this.persist({
      ...this.db,
      progressRecords: updatedRecords,
    });
    return updatedRecords;
  }

  public deleteProgressEntry(id: string): ProgressEntry[] {
    const filtered = (this.db.progressRecords || []).filter((e) => e.id !== id);
    this.persist({
      ...this.db,
      progressRecords: filtered,
    });
    return filtered;
  }

  public getChatHistory(): ChatMessage[] {
    return this.db.chatHistory || [];
  }

  public addChatMessage(msg: ChatMessage): ChatMessage[] {
    const history = [...(this.db.chatHistory || []), msg];
    // Keep last 50 messages
    const trimmed = history.slice(-50);
    this.persist({
      ...this.db,
      chatHistory: trimmed,
    });
    return trimmed;
  }

  public clearChatHistory(): void {
    this.persist({
      ...this.db,
      chatHistory: [],
    });
  }

  public resetAll(): void {
    this.persist(INITIAL_DB);
  }

  public exportAll(): DatabaseSchema {
    return this.db;
  }

  public importAll(imported: DatabaseSchema): boolean {
    if (!imported || typeof imported !== 'object') return false;
    this.persist({
      ...INITIAL_DB,
      ...imported,
      version: 1,
    });
    return true;
  }
}

export const dbService = new DatabaseService();
