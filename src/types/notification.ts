export type WorkerInfo = {
  name: string;
  employeeNumber: string;
  state: string;
  obs?: string;
};

export type Equipment = {
  name: string;
  serialNumber: string;
  state: string;
  costCenter: string;
  obs?: string;
};

export type Supervisor = {
  code: string;
  name: string;
};

export type Notification = {
  _id: string;
  createdAt: string;
  createdAtTime: string;
  createdAtDate: Date;
  siteName: string;
  costCenter: string;
  supervisorCode: string;
  supervisorName: string;
  details: string;
  numberOfWorkers?: number;
  workerInformation?: WorkerInfo[];
  equipment?: Equipment[];
  time?: string;
  coordinates?: string;
  tlAbsent?: string;
  report?: string;
  type: "supervision" | "occurrence";
  priority?: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  latitude?: number;
  longitude?: number;
  aria?: string;
  referencia?: string;
  ocorrencia?: string;
  duration?: string;
  title?: string;
  description?: string;
};