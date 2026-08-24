import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDocument,
  uploadDocument,
  deleteDocument,
} from "../services/documentService";
import { useAuthStore } from "../store/useAuthStore";

export const DOCUMENT_QUERY_KEY = ["document"] as const;

export const useGetDocument = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: DOCUMENT_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await getDocument();
        return response;
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: isAuthenticated,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "pending" ? 2000 : false;
    },
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadDocument(file),
    onSuccess: (newDoc) => {
      queryClient.setQueryData(DOCUMENT_QUERY_KEY, newDoc);
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEY });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteDocument(),
    onSuccess: () => {
      queryClient.setQueryData(DOCUMENT_QUERY_KEY, null);
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEY });
    },
  });
};
