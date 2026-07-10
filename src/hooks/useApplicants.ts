import { appliationApi, CreateApplicantInput } from "@/lib/api/application";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const applicantKeys = {
  all: ["applicants"] as const,
  lists: () => [...applicantKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...applicantKeys.lists(), JSON.stringify(filters)] as const,
  details: () => [...applicantKeys.all, "detail"] as const,
  detail: (id: string) => [...applicantKeys.details(), id] as const,
  stats: () => [...applicantKeys.all, "stats"] as const,
};

// Create Applicant
export const useCreateApplicant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicantInput) => appliationApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicantKeys.lists() });
    },
  });
};

// Fetch Applicants List
export const useApplicantsList = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: applicantKeys.list(params),
    queryFn: () => appliationApi.getApplicants(params),
    staleTime: 30000,
  });
};

// Fetch Single Applicant
export const useApplicant = (id: string) => {
  return useQuery({
    queryKey: applicantKeys.detail(id),
    queryFn: () => appliationApi.getApplicant(id),
    enabled: !!id,
    staleTime: 60000,
  });
};

// Update Applicant
export const useUpdateApplicant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateApplicantInput> }) =>
      appliationApi.updateApplication(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: applicantKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: applicantKeys.lists() });
    },
  });
};

// Update Applicant Status
export const useUpdateApplicantStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      appliationApi.updateApplicantionStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: applicantKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: applicantKeys.lists() });
    },
  });
};

// Delete Applicant
export const useDeleteApplicant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appliationApi.deleteApplicant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicantKeys.lists() });
    },
  });
};

// Fetch Stats
export const useApplicationStats = () => {
  return useQuery({
    queryKey: applicantKeys.stats(),
    queryFn: () => appliationApi.getApplicationStats(),
    staleTime: 60000,
  });
};