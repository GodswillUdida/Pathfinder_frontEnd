// hooks/useProgress.ts
import {
  EnrollmentProgress,
  ProgressRecord,
  getCertificate,
  getEnrollmentProgress,
  getProgressSummary,
  getSingleProgress,
  markTopicComplete,
  resetProgress,
  upsertProgress,
} from "@/lib/api/progress";
import { Certificate } from "@/types/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface MarkTopicCompleteParams {
  enrollmentId: string;
  topicId: string;
}

interface OnMutateContext {
  prev: EnrollmentProgress | undefined;
}

export const progressKeys = {
  all: ["progress"] as const,
  enrollment: (id: string) => [...progressKeys.all, "enrollment", id] as const,
  topic: (enrollmentId: string, topicId: string) =>
    [...progressKeys.all, "topic", enrollmentId, topicId] as const,
  summary: () => [...progressKeys.all, "summary"] as const,
  certificate: (enrollmentId: string) => ["certificate", enrollmentId] as const,
};

// 🔥 Enrollment Progress
export const useEnrollmentProgress = (enrollmentId: string) =>
  useQuery({
    queryKey: progressKeys.enrollment(enrollmentId),
    queryFn: () => getEnrollmentProgress(enrollmentId),
    enabled: !!enrollmentId,
    staleTime: 1000 * 60 * 2,
  });

// 🔥 Single Topic
export const useSingleProgress = (enrollmentId: string, topicId: string) =>
  useQuery({
    queryKey: progressKeys.topic(enrollmentId, topicId),
    queryFn: () => getSingleProgress(enrollmentId, topicId),
    enabled: !!enrollmentId && !!topicId,
  });

// 🔥 Summary
export const useProgressSummary = () =>
  useQuery({
    queryKey: progressKeys.summary(),
    queryFn: getProgressSummary,
    staleTime: 1000 * 60 * 5,
  });

// 🔥 Mark Complete (Optimistic ⚡)
export const useMarkTopicComplete = () => {
  const qc = useQueryClient();

  return useMutation<ProgressRecord, unknown, MarkTopicCompleteParams, OnMutateContext>({
    mutationFn: async ({ enrollmentId, topicId }) => {
      const response = await markTopicComplete(enrollmentId, topicId);
      return response.data!;
    },

    onMutate: async ({ enrollmentId, topicId }) => {
      await qc.cancelQueries({ queryKey: progressKeys.enrollment(enrollmentId) });
      const prev = qc.getQueryData<EnrollmentProgress>(progressKeys.enrollment(enrollmentId));

      qc.setQueryData<EnrollmentProgress>(progressKeys.enrollment(enrollmentId), (old) => {
        if (!old) return old;

        const alreadyDone = old.records.some((r) => r.topicId === topicId && r.completed);
        const records = old.records.map((r) =>
          r.topicId === topicId
            ? { ...r, completed: true, lastWatchedAt: new Date().toISOString() }
            : r,
        );
        const completedCount = old.completedCount + (alreadyDone ? 0 : 1);

        return {
          ...old,
          records,
          completedCount,
          percentage: old.totalTopics > 0 ? Math.round((completedCount / old.totalTopics) * 100) : 0,
        };
      });

      return { prev };
    },

    onError: (_err, { enrollmentId }, ctx) => {
      if (ctx?.prev) qc.setQueryData(progressKeys.enrollment(enrollmentId), ctx.prev);
    },

    onSettled: (_d, _e, { enrollmentId }) => {
      qc.invalidateQueries({ queryKey: progressKeys.enrollment(enrollmentId) });
    },
  });
};

// 🔥 Upsert Progress (watch-time heartbeat)
export const useUpsertProgress = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: upsertProgress,
    onSuccess: (record) => {
      qc.invalidateQueries({ queryKey: progressKeys.enrollment(record.data!.enrollmentId) });
    },
  });
};

// 🔥 Reset
export const useResetProgress = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: resetProgress,
    onSuccess: (_data, enrollmentId) => {
      qc.invalidateQueries({ queryKey: progressKeys.enrollment(enrollmentId) });
    },
  });
};

// 🔥 Certificate
export const useCertificate = (enrollmentId: string) =>
  useQuery<Certificate>({
    queryKey: progressKeys.certificate(enrollmentId),
    queryFn: async () => {
      const response = await getCertificate(enrollmentId);
      return response.data!;
    },
    enabled: !!enrollmentId,
    staleTime: Infinity,
  });