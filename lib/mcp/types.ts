export type Scope = "read" | "write";

/** Aligné sur Navpit : focus / pause / fini. */
export type ProjectStatus = "focus" | "waiting" | "done";
export type TaskStatus = "todo" | "doing" | "done";

export interface Project {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  dueDate?: string | null;
  notes?: string | null;
}

export interface Note {
  id: string;
  projectId: string;
  title: string;
  content: string;
  source?: string | null;
  createdAt: string;
}

export interface ApiKeyRecord {
  id: string;
  userId: string;
  name: string;
  prefix: string;
  hash: string;
  scopes: Scope[];
  lastUsedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
}
