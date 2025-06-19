export interface WorkerInfo {
  name: string;
  employeeNumber: string;
  state: string;
  obs?: string;
}

export interface Equipment {
  name: string;
  serialNumber: string;
  state: string;
  costCenter: string;
  obs?: string;
}

export interface Occurrence {
  _id: string;
  idNotification?: string;
  createdAt: string;
  createdAtTime: string;
  createdAtDate: Date;
  siteName: string;
  costCenter: string;
  supervisorName: string;
  priority: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  details: string;
  numberOfWorkers?: number;
  workerInformation?: WorkerInfo[];
  equipment?: Equipment[];
  latitude?: string;
  longitude?: string;
  aria?: string;
  referencia?: string;
  ocorrencia?: string;
} 