import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface UseApiRequestOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  autoResetDelay?: number; // Auto reset states after success (in ms)
}

export interface UseApiRequestReturn<TData, TResponse> {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  data: TResponse | null;
  execute: (endpoint: string, data: TData) => Promise<void>;
  reset: () => void;
}


export function useApiRequest<TData = unknown, TResponse = unknown>(
  options: UseApiRequestOptions = {}
): UseApiRequestReturn<TData, TResponse> {
  const { onSuccess, onError, autoResetDelay } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TResponse | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsSuccess(false);
    setError(null);
    setData(null);
  }, []);

  const execute = useCallback(
    async (endpoint: string, requestData: TData) => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        const response = await axios.post<ApiResponse<TResponse>>(endpoint, requestData);

        if (!response.data.success) {
          throw new Error(response.data.message || 'Request failed');
        }

        setData(response.data.data || null);
        setIsSuccess(true);
        setIsLoading(false);

        // Call success callback
        onSuccess?.();

        // Auto reset after delay if specified
        if (autoResetDelay && autoResetDelay > 0) {
          setTimeout(() => {
            reset();
          }, autoResetDelay);
        }
      } catch (err) {
        setIsLoading(false);
        setIsSuccess(false);

        let errorMessage = 'Something went wrong. Please try again.';

        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError<ApiResponse>;

          if (axiosError.response?.data) {
            const responseData = axiosError.response.data;

            // Check for specific validation errors
            if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
              // Show the first validation error or join all
              errorMessage = responseData.errors[0].message;
            } else if (responseData.message && responseData.message !== 'Validation failed') {
              // Show the error message if it's not generic
              errorMessage = responseData.message;
            } else if (responseData.message === 'Validation failed') {
              // Provide helpful fallback for generic validation error
              errorMessage = 'Please check all fields and try again.';
            }
          } else if (axiosError.message) {
            errorMessage = axiosError.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);

        // Call error callback
        onError?.(errorMessage);
      }
    },
    [onSuccess, onError, autoResetDelay, reset]
  );

  return {
    isLoading,
    isSuccess,
    error,
    data,
    execute,
    reset,
  };
}