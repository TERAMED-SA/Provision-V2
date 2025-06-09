import { useAuthStore } from "@/features/auth/authStore";

export const useLogin = () => {
  const login = useAuthStore((state) => state.login);
  return login;
};