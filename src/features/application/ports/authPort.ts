export interface AuthPort {
  login(number: string, password: string): Promise<void>;
}
