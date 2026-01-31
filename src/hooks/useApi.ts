import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/appStore'

interface NotificationHookOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const useNotification = () => {
  const setNotification = useAppStore((state) => state.setNotification)

  const showSuccess = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const showError = (message: string) => {
    setNotification(`Chyba: ${message}`)
    setTimeout(() => setNotification(null), 5000)
  }

  return { showSuccess, showError }
}

export const useApiMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: NotificationHookOptions
) => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useNotification()

  return useMutation({
    mutationFn,
    onSuccess: () => {
      showSuccess('Operace byla úspěšně dokončena')
      queryClient.invalidateQueries()
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      showError(error.message)
      options?.onError?.(error)
    },
  })
}