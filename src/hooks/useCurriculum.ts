"use client";

import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type {
  Module,
  Topic,
  CreateModuleInput,
  UpdateModuleInput,
  CreateTopicInput,
  UpdateTopicInput,
} from "@/types/curriculum";
import type { ModuleWithTopics } from "@/types/domain";
import type { ApiResponse } from "@/types";

const MODULES_BASE = "/modules";
const TOPICS_BASE = "/topics";

export const modulesKey = (courseId: string): QueryKey => [
  "modules",
  courseId,
];
export const topicsKey = (moduleId: string): QueryKey => ["topics", moduleId];

// ── FormData ─────────────────────────────────────────────────

/**
 * Backend: uploadTopicVideo = multer().single("video")
 * Field name MUST be exactly "video".
 */
export function buildTopicFormData(input: CreateTopicInput): FormData {
  const fd = new FormData();
  fd.append("title", input.title.trim());

  if (input.description?.trim()) {
    fd.append("description", input.description.trim());
  }

  // Each resource is its own file part on the repeated "resources" field —
  // this is what lets multer collect them into req.files.resources as an
  // array server-side. Do NOT JSON.stringify File objects: they carry no
  // meaningful own-enumerable properties, so the server receives a useless
  // string instead of the files it expects.
  if (input.resources?.length) {
    for (const file of input.resources) {
      fd.append("resources", file);
    }
  }

  // video is optional on the client type, so only append it when present —
  // appending `undefined` as a Blob throws before the request is even sent.
  if (input.video) {
    fd.append("video", input.video, input.video.name);
  }

  return fd;
}

// ── Reads ────────────────────────────────────────────────────

function useModulesList(courseId: string) {
  return useQuery({
    queryKey: modulesKey(courseId),
    queryFn: () =>
      apiClient.get<Omit<ModuleWithTopics, "topics">[]>(
        `${MODULES_BASE}/${courseId}`,
      ),
    enabled: !!courseId,
  });
}

function useTopicsForModules(moduleIds: string[]) {
  return useQueries({
    queries: moduleIds.map((moduleId) => ({
      queryKey: topicsKey(moduleId),
      queryFn: () =>
        apiClient.get<Topic[]>(`${TOPICS_BASE}/${moduleId}`),
      enabled: !!moduleId,
    })),
  });
}

/**
 * Combines GET /modules/:courseId with GET /topics/:moduleId per module.
 * There is no single nested-tree endpoint on the backend.
 */
export function useCurriculum(courseId: string) {
  const qc = useQueryClient();
  const modulesQuery = useModulesList(courseId);
  const modules = modulesQuery.data?.data ?? [];
  const moduleIds = modules.map((m) => m.id);
  const topicsQueries = useTopicsForModules(moduleIds);

  const isLoading =
    modulesQuery.isLoading ||
    (moduleIds.length > 0 && topicsQueries.some((q) => q.isLoading));

  const isFetching =
    modulesQuery.isFetching || topicsQueries.some((q) => q.isFetching);

  const error =
    modulesQuery.error ??
    topicsQueries.find((q) => q.error)?.error ??
    null;

  const data: ModuleWithTopics[] | undefined =
    modulesQuery.data?.data != null
      ? modulesQuery.data.data.map((m, i) => {
          const topicRows = topicsQueries[i]?.data?.data ?? [];
          return {
            ...m,
            topics: topicRows.map((topic) => ({
              ...topic,
              // Defaults only when API omits relation-heavy fields
              createdAt: (topic as { createdAt?: string }).createdAt ?? "",
              updatedAt: (topic as { updatedAt?: string }).updatedAt ?? "",
              deletedAt: (topic as { deletedAt?: string | null }).deletedAt ?? null,
              videoAsset:
                (topic as { videoAsset?: ModuleWithTopics["topics"][number]["videoAsset"] })
                  .videoAsset ?? null,
              slug: topic.slug ?? "",
              position: topic.position ?? 0,
              durationSeconds: topic.durationSeconds ?? 0,
              resources:
                (topic as { resources?: ModuleWithTopics["topics"][number]["resources"] })
                  .resources ?? [],
              prerequisites:
                (topic as { prerequisites?: unknown[] }).prerequisites ?? [],
              _count:
                (topic as { _count?: { resources: number; prerequisites: number } })
                  ._count ?? { resources: 0, prerequisites: 0 },
            })),
          } as ModuleWithTopics;
        })
      : undefined;

  const refetch = async () => {
    await modulesQuery.refetch();
    await Promise.all(topicsQueries.map((q) => q.refetch()));
  };

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    courseId,
    qc,
  };
}

// ── Module mutations ─────────────────────────────────────────

type ModulesCache = ApiResponse<Omit<Module, "topics">[]>;

export function useCreateModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateModuleInput) =>
      apiClient.post<Omit<Module, "topics">>(
        `${MODULES_BASE}/${courseId}`,
        input as unknown as Record<string, unknown>,
      ),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: modulesKey(courseId) });
      const previous = qc.getQueryData<ModulesCache>(modulesKey(courseId));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(modulesKey(courseId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: modulesKey(courseId) });
    },
  });
}

export function useUpdateModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; data: UpdateModuleInput }) =>
      apiClient.patch(`${MODULES_BASE}/${vars.id}`, vars.data),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: modulesKey(courseId) });
      const previous = qc.getQueryData<ModulesCache>(modulesKey(courseId));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(modulesKey(courseId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: modulesKey(courseId) });
    },
  });
}

export function useDeleteModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string }) =>
      apiClient.delete(`${MODULES_BASE}/${vars.id}`),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: modulesKey(courseId) });
      const previous = qc.getQueryData<ModulesCache>(modulesKey(courseId));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(modulesKey(courseId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: modulesKey(courseId) });
    },
  });
}

// ── Topic mutations ──────────────────────────────────────────

type TopicsCache = ApiResponse<Topic[]>;

export function useCreateTopic(moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTopicInput) => {
      if (!(input.video instanceof File)) {
        return Promise.reject(new Error("Video file is required"));
      }
      // Multipart — do not JSON.stringify; apiClient must leave Content-Type unset
      return apiClient.post<Topic>(
        `${TOPICS_BASE}/${moduleId}`,
        buildTopicFormData(input),
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: topicsKey(moduleId) });
    },
  });
}

export function useUpdateTopic(moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; data: UpdateTopicInput }) =>
      apiClient.patch(`${TOPICS_BASE}/${vars.id}`, { ...vars.data }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: topicsKey(moduleId) });
      const previous = qc.getQueryData<TopicsCache>(topicsKey(moduleId));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(topicsKey(moduleId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: topicsKey(moduleId) });
    },
  });
}

/** Replace lecture video (multipart). Only if PATCH supports uploadTopicVideo. */
export function useReplaceTopicVideo(moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, video }: { id: string; video: File }) => {
      const fd = new FormData();
      fd.append("video", video, video.name);
      return apiClient.patch(`${TOPICS_BASE}/${id}`, fd);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: topicsKey(moduleId) });
    },
  });
}

export function useDeleteTopic(moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string }) =>
      apiClient.delete(`${TOPICS_BASE}/${vars.id}`),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: topicsKey(moduleId) });
      const previous = qc.getQueryData<TopicsCache>(topicsKey(moduleId));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(topicsKey(moduleId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: topicsKey(moduleId) });
    },
  });
}