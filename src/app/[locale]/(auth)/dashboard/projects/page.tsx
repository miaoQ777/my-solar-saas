'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Project, ProjectStatus } from '@/libs/api/projects';
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from '@/libs/api/projects';

const statusVariant: Record<ProjectStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  survey: 'secondary',
  design: 'outline',
  proposal: 'secondary',
  install: 'default',
  complete: 'destructive',
};

const formSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  capacity: z.string().min(1),
  status: z.enum(['survey', 'design', 'proposal', 'install', 'complete']),
});

type FormValues = z.infer<typeof formSchema>;

const ProjectsPage = () => {
  const t = useTranslations('Projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter(
      p => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q),
    );
  }, [projects, search]);

  const loadProjects = useCallback(async () => {
    const data = await getProjects();
    setProjects(data);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const createForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      capacity: '',
      status: 'survey' as ProjectStatus,
    },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (editTarget) {
      editForm.reset({
        name: editTarget.name,
        address: editTarget.address,
        capacity: editTarget.capacity,
        status: editTarget.status,
      });
    }
  }, [editTarget, editForm]);

  const handleCreate = async (values: FormValues) => {
    await createProject(values);
    createForm.reset();
    setCreateOpen(false);
    await loadProjects();
  };

  const handleEdit = async (values: FormValues) => {
    if (!editTarget) {
      return;
    }
    await updateProject({ ...values, id: editTarget.id });
    setEditTarget(null);
    await loadProjects();
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    await deleteProject(deleteTarget.id);
    setDeleteTarget(null);
    await loadProjects();
  };

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: 'name',
      header: t('project_name'),
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => {
        const status = row.getValue<ProjectStatus>('status');
        return <Badge variant={statusVariant[status]}>{t(`status_${status}`)}</Badge>;
      },
    },
    {
      accessorKey: 'address',
      header: t('address'),
    },
    {
      accessorKey: 'capacity',
      header: t('capacity'),
      cell: ({ row }) => {
        const capacity = row.getValue<string>('capacity');
        return `${capacity} kW`;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditTarget(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="text-2xl font-semibold">{t('title_bar')}</div>
          <div className="text-sm font-medium text-muted-foreground">
            {t('title_bar_description')}
          </div>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              {t('new_project')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('create_project')}</DialogTitle>
              <DialogDescription>{t('title_bar_description')}</DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('project_name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('project_name_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('address')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('address_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('capacity')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t('capacity_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('status')}</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          {...field}
                        >
                          {(['survey', 'design', 'proposal', 'install', 'complete'] as const).map(s => (
                            <option key={s} value={s}>{t(`status_${s}`)}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{t('submit')}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder={t('search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredProjects} />

      <Dialog open={!!editTarget} onOpenChange={open => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('edit_project')}</DialogTitle>
            <DialogDescription>{t('title_bar_description')}</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('project_name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('project_name_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('address')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('address_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('capacity')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t('capacity_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('status')}</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        {...field}
                      >
                        {(['survey', 'design', 'proposal', 'install', 'complete'] as const).map(s => (
                          <option key={s} value={s}>{t(`status_${s}`)}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{t('save')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete_confirm_title')}</DialogTitle>
            <DialogDescription>
              {t('delete_confirm_description', { name: deleteTarget?.name ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectsPage;
