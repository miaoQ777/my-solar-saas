'use server';

// 此处将来替换为 Frappe ERP 的 API，只需改这一个文件。

import { eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { projectSchema } from '@/models/Schema';

export type ProjectStatus = 'survey' | 'design' | 'proposal' | 'install' | 'complete';

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  address: string;
  capacity: string;
};

const seedData: Project[] = [
  { id: '1', name: 'Rooftop Array A', status: 'install', address: 'Building 3, Shanghai', capacity: '50' },
  { id: '2', name: 'Ground Mount B', status: 'install', address: 'Industrial Park, Suzhou', capacity: '200' },
  { id: '3', name: 'Carport C', status: 'design', address: 'Office Complex, Beijing', capacity: '80' },
  { id: '4', name: 'Community Solar D', status: 'complete', address: 'Residential Zone, Hangzhou', capacity: '150' },
  { id: '5', name: 'Floating Array E', status: 'proposal', address: 'Reservoir Site, Nanjing', capacity: '500' },
];

async function ensureSeeded() {
  const existing = await db.select().from(projectSchema);
  if (existing.length === 0) {
    for (const p of seedData) {
      await db.insert(projectSchema).values(p);
    }
  }
}

export async function getProjects(): Promise<Project[]> {
  await ensureSeeded();
  return db.select().from(projectSchema) as unknown as Project[];
}

export type CreateProjectInput = Omit<Project, 'id'>;

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const project: Project = {
    id: String(Date.now()),
    ...input,
  };
  await db.insert(projectSchema).values(project);
  return project;
}

export type UpdateProjectInput = Partial<Omit<Project, 'id'>> & { id: string };

export async function updateProject(input: UpdateProjectInput): Promise<Project | undefined> {
  const { id, ...data } = input;
  const result = await db.update(projectSchema).set(data).where(eq(projectSchema.id, id)).returning();
  return result.at(0) as Project | undefined;
}

export async function deleteProject(id: string): Promise<boolean> {
  const result = await db.delete(projectSchema).where(eq(projectSchema.id, id)).returning();
  return result.length > 0;
}
