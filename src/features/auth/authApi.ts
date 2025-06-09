import instance from "@/lib/api";
import { AuthResponse } from "@/types/auth";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export const loginRequest = async (number: string, password: string) => {
  const response = await instance.post<AuthResponse>("/userAuth/signIn", { number, password });
  return response.data; 
};

export const useLogin = async (number: string, password: string) => {
  const data = await loginRequest(number, password);
  const token = data.token;
  const userData = data.data.data;
  console.log("Dados do usuário:", userData);
  if (!token) throw new Error("Token não encontrado na resposta");
  
  Cookies.set("token", token);
  return { token };
};

export const getUser = async () => {
  const token = Cookies.get("token");

  if (!token) throw new Error("Token não encontrado");

  try {
    const decoded: any = jwtDecode(token);
    const userId = decoded.value;
    const response = await instance.get(`/user/${userId}`);
    return response.data.data; 
  } catch (error) {
    throw new Error("Erro ao buscar usuário");
  }
};

export const logout = () => {
  Cookies.remove("token");
  window.location.href = "/";
};
