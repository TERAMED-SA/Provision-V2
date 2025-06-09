export interface AuthResponse {
  token: string;
  data: {
    status: number;
    message: string;
    data: {
      _id: string;
      name: string;
      email: string;
      address: string;
      phoneNumber: string;
      password: string;
      employeeId: string;
      type: string;
      mecCoordinator: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    };
  };
}