import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDocument,
  uploadDocument,
  deleteDocument,
} from "../services/documentService";

export const DOCUMENT_QUERY_KEY = ["document"] as const;

export const useGetDocument = () => {
  return useQuery({
    queryKey: DOCUMENT_QUERY_KEY,
    queryFn: async () => {
      const response = await getDocument();
      return response;
    },
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadDocument(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEY });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteDocument(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEY });
    },
  });
};
