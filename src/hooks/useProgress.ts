import { EnrollmentProgress, getCertificate, getEnrollmentProgress, getProgressSummary, getSingleProgress, markTopicComplete, resetProgress, upsertProgress } from "@/lib/api/progress";
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
  enrollment: (id: string) =>
    [...progressKeys.all, "enrollment", id] as const,
  topic: (enrollmentId: string, topicId: string) =>
    [...progressKeys.all, "topic", enrollmentId, topicId] as const,
  summary: () => [...progressKeys.all, "summary"] as const,
  certificate: (enrollmentId: string) =>
    ["certificate", enrollmentId] as const,
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
export const useSingleProgress = (
  enrollmentId: string,
  topicId: string
) =>
  useQuery({
    queryKey: progressKeys.topic(enrollmentId, topicId),
    queryFn: () =>
      getSingleProgress(enrollmentId, topicId),
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

  return useMutation({
    mutationFn: ({
      enrollmentId,
      topicId,
    }: {
      enrollmentId: string;
      topicId: string;
    }) => markTopicComplete(enrollmentId, topicId),

    onMutate: async ({ enrollmentId, topicId }) => {
      await qc.cancelQueries({
        queryKey: progressKeys.enrollment(enrollmentId),
      });

      const prev = qc.getQueryData<EnrollmentProgress>(
        progressKeys.enrollment(enrollmentId)
      );

      // optimistic update
      qc.setQueryData<EnrollmentProgress>(
        progressKeys.enrollment(enrollmentId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            topics: old.topics.map((t) =>
              t.topicId === topicId
                ? {
                    ...t,
                    completed: true,
                    completedAt: new Date().toISOString(),
                  }
                : t
            ),
          };
        }
      );

      return { prev };
    },

    onError: (_err, { enrollmentId }, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(
          progressKeys.enrollment(enrollmentId),
          ctx.prev
        );
      }
    },

    onSettled: (_d, _e, { enrollmentId }) => {
      qc.invalidateQueries({
        queryKey: progressKeys.enrollment(enrollmentId),
      });
    },
  });
};

// 🔥 Upsert Progress
export const useUpsertProgress = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: upsertProgress,
    onSuccess: (data) => {
      qc.invalidateQueries({
        queryKey: progressKeys.enrollment(
          data.enrollmentId
        ),
      });
    },
  });
};

// 🔥 Reset
export const useResetProgress = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: resetProgress,
    onSuccess: (_data, enrollmentId) => {
      qc.invalidateQueries({
        queryKey: progressKeys.enrollment(
          enrollmentId
        ),
      });
    },
  });
};

// 🔥 Certificate Hook (IMPORTANT)
export const useCertificate = (enrollmentId: string) =>
  useQuery({
    queryKey: progressKeys.certificate(enrollmentId),
    queryFn: () => getCertificate(enrollmentId),
    enabled: !!enrollmentId,
    staleTime: Infinity, // certificates don't change
  });