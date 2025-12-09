import { apiClient } from '~/lib/api-client'
import type { LoginDto, LoginResponse, RegisterDto, VerifyEmailDto, ResendVerificationEmailDto, User} from '~/types'

export const authService = {
  register: async (data: RegisterDto): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/register', data)
    return response.data
  },

  login: async (data: LoginDto): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },
  verifyEmail: async (data: VerifyEmailDto): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/verify-email', data)
    return response.data
  },
  resendVerificationEmail: async (data: ResendVerificationEmailDto): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/resend-verification', data)
    return response.data
  },
}
