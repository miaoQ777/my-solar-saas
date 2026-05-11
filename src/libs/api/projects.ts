'use server';

// 此处将来替换为 Frappe ERP 的 API，只需改这一个文件。

import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { projectSchema } from '@/models/Schema';

export type ProjectStatus = 'survey' | 'design' | 'proposal' | 'install' | 'complete';

export type Project = {
  id: string;
  userId: string;
  name: string;
  status: ProjectStatus;
  address: string;
  capacity: string;
};

export async function getProjects(): Promise<Project[]> {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }

  return db.select().from(projectSchema).where(eq(projectSchema.userId, userId)) as unknown as Project[];
}

export type CreateProjectInput = Omit<Project, 'id' | 'userId'>;

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const project = {
    id: crypto.randomUUID(),
    userId,
    ...input,
  };
  await db.insert(projectSchema).values(project);
  return project as Project;
}

export type UpdateProjectInput = Partial<Omit<Project, 'id' | 'userId'>> & { id: string };

export async function updateProject(input: UpdateProjectInput): Promise<Project | undefined> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const { id, ...data } = input;
  const result = await db
    .update(projectSchema)
    .set(data)
    .where(and(eq(projectSchema.id, id), eq(projectSchema.userId, userId)))
    .returning();
  return result.at(0) as Project | undefined;
}

export async function deleteProject(id: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const result = await db
    .delete(projectSchema)
    .where(and(eq(projectSchema.id, id), eq(projectSchema.userId, userId)))
    .returning();
  return result.length > 0;
}
