import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { useLogin } from '@/features/auth/authApi';
import Cookies from 'js-cookie';
import Login from '@/app/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));
jest.mock('@/features/auth/authApi', () => ({
  useLogin: jest.fn(),
}));
jest.mock('js-cookie', () => ({
  set: jest.fn(),
  remove: jest.fn(),
}));

describe('Integração do Componente de Login', () => {
  const mockPush = jest.fn();

  it('realiza login com sucesso e redireciona para o dashboard', async () => {

    const phoneInput = screen.getByLabelText('form.phoneNumber');
    const passwordInput = screen.getByLabelText('form.password');
    const submitButton = screen.getByRole('button', { name: 'form.loginButton' });

    fireEvent.change(phoneInput, { target: { value: '123456789' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(useLogin).toHaveBeenCalledWith('123456789', 'password123');
      expect(Cookies.set).toHaveBeenCalledWith('token', 'mock-token');
      expect(toast.success).toHaveBeenCalledWith('messages.loginSuccess');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('exibe erro de credenciais inválidas ao falhar o login (401)', async () => {

    
    const phoneInput = screen.getByLabelText('form.phoneNumber');
    const passwordInput = screen.getByLabelText('form.password');
    const submitButton = screen.getByRole('button', { name: 'form.loginButton' });

    fireEvent.change(phoneInput, { target: { value: '123456789' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('messages.invalidCredentials');
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('navega para a página inicial ao clicar no logo', async () => {

    
    const logoLink = screen.getByRole('link', { name: /Logo/ });
    fireEvent.click(logoLink);

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});