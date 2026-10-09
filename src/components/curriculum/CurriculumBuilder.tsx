"use client";

import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { useCurriculum, useCreateModule, useUpdateModule, useDeleteModule } from "@/hooks/useCurriculum";
import { ModuleForm } from "./ModuleForm";
import { ModuleListItem } from "./ModuleListItem";
import { ConfirmDialog } from "./ConfirmDialog";
import { CurriculumEmptyState } from "./CurriculumEmptyState";
import { CurriculumSkeleton } from "./CurriculumSkeleton";
import type { CreateModuleInput } from "@/schemas/curriculum.schema";
import type { Module } from "@/types/curriculum";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function CurriculumBuilder({ courseId }: { courseId: string }) {
  const { data: modules, isLoading, error } = useCurriculum(courseId);
  const createModule = useCreateModule(courseId);
  const updateModule = useUpdateModule(courseId);
  const deleteModule = useDeleteModule(courseId);

  const [addingModule, setAddingModule] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Module | null>(null);

  if (isLoading) return <CurriculumSkeleton />;

  if (error) {
    return (
      <div
        className="flex items-start gap-3 px-4 py-3.5 border-l-2 border-[var(--danger)] bg-[var(--danger-soft)]"
        role="alert"
      >
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--danger)]" />
        <p className="font-[family-name:var(--font-body)] text-[13px] leading-relaxed text-[var(--danger)]">
          Failed to load curriculum. Refresh to try again.
        </p>
      </div>
    );
  }

  const list = (modules ?? []).slice().sort((a, b) => a.position! - b.position!);

  console.log("List :", list)

  const handleCreate = async (values: CreateModuleInput) => {
    setFormError(null);
    try {
      await createModule.mutateAsync(values);
      setAddingModule(false);
    } catch (err) {
      setFormError(getErrorMessage(err, "Couldn't create the module. Please try again."));
    }
  };

  const handleUpdate = async (moduleId: string, values: CreateModuleInput) => {
    setFormError(null);
    try {
      await updateModule.mutateAsync({ id: moduleId, data: values });
    } catch (err) {
      setFormError(getErrorMessage(err, "Couldn't save changes. Please try again."));
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setFormError(null);
    try {
      await deleteModule.mutateAsync({ id: pendingDelete.id });
      setPendingDelete(null);
    } catch (err) {
      setFormError(getErrorMessage(err, "Couldn't delete the module. Please try again."));
    }
  };

  return (
    <div className="bg-[var(--paper)] font-[family-name:var(--font-body)]">
      {/* Masthead */}
      <header className="flex items-end justify-between gap-4 px-1 pb-5 mb-1 border-b border-[var(--line-strong)]">
        <div>
          <p className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[var(--ink-faint)] mb-1">
            Course contents
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-[26px] sm:text-[30px] leading-none tracking-tight text-[var(--ink)]">
            Curriculum
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {list.length > 0 && (
            <span className="hidden sm:inline font-[family-name:var(--font-display)] italic text-[13px] text-[var(--ink-faint)] tabular-nums">
              {list.length} {list.length === 1 ? "chapter" : "chapters"}
            </span>
          )}
          {list.length > 0 && !addingModule && (
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setAddingModule(true);
              }}
              className="group inline-flex items-center gap-2 min-h-11 px-4 sm:px-1 sm:min-h-0 sm:py-1 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink)] transition-colors duration-150 hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]"
            >
              <Plus className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:rotate-90" strokeWidth={2} />
              <span>New module</span>
            </button>
          )}
        </div>
      </header>

      {formError && (
        <div
          className="flex items-start gap-3 px-4 py-3.5 mb-4 border-l-2 border-[var(--danger)] bg-[var(--danger-soft)]"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--danger)]" />
          <p className="text-[12.5px] leading-relaxed text-[var(--danger)]">{formError}</p>
        </div>
      )}

      {addingModule && (
        <div className="curriculum-stagger mb-2 px-1 py-6 border-b border-[var(--line)]">
          <p className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[var(--accent-strong)] mb-4">
            New chapter
          </p>
          <ModuleForm
            isSubmitting={createModule.isPending}
            submitLabel="Add module"
            onSubmit={handleCreate}
            onCancel={() => {
              setAddingModule(false);
              setFormError(null);
            }}
          />
        </div>
      )}

      {list.length === 0 && !addingModule ? (
        <CurriculumEmptyState onAddModule={() => setAddingModule(true)} />
      ) : (
        <div>
          {list.map((module, i) => (
            <div key={module.id} className="curriculum-stagger" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
              <ModuleListItem
                index={modules!.findIndex((m) => m.id === module.id)}
                module={
                  {
                    ...module,
                    description: module.description ?? undefined,
                    topics: module.topics as unknown as Module["topics"],
                  } as Module
                }
                isUpdating={updateModule.isPending}
                onUpdate={(values) => handleUpdate(module.id, values)}
                onDelete={() => {
                  setFormError(null);
                  setPendingDelete({
                    ...module,
                    description: module.description ?? undefined,
                    topics: module.topics as unknown as Module["topics"],
                  } as Module);
                }}
              />
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete module?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" and all ${pendingDelete.topics.length} of its ${
                pendingDelete.topics.length === 1 ? "topic" : "topics"
              } will be permanently deleted. This cannot be undone.`
            : ""
        }
        confirmLabel="Yes, delete"
        isConfirming={deleteModule.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}