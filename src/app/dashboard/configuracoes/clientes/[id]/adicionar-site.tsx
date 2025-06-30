"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import instance from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Coordinator {
  id: string;
  name: string;
}
interface SimpleSupervisor {
  code: string;
  name: string;
}

interface FormData {
  name: string;
  address: string;
  costCenter: string;
  numberOfWorkers: string;
  supervisorCode: string;
  zone: string;
}

const initialFormData: FormData = {
  name: "",
  address: "",
  costCenter: "",
  numberOfWorkers: "",
  supervisorCode: "",
  zone: "",
};

export default function AdicionarSitePage() {
  const t = useTranslations("companySites");
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientCode = searchParams.get("clientCode");
  const companyName = searchParams.get("companyName");

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentCoordinator, setCurrentCoordinator] = useState<Coordinator | null>(null);
  const [supervisorsByCoordinator, setSupervisorsByCoordinator] = useState<SimpleSupervisor[]>([]);
  const [siteCoordinates, setSiteCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar coordenador e supervisores ao mudar zona
  useEffect(() => {
    const fetchCoordinatorAndSupervisors = async () => {
      if (formData.zone) {
        try {
          const coordRes = await instance.get(`/coordinator?zone=${formData.zone}`);
          const coordinator = coordRes.data.data;
          setCurrentCoordinator(coordinator);
          if (coordinator && coordinator.id) {
            const supRes = await instance.get(
              `/supervisors?coordinatorId=${coordinator.id}&zone=${formData.zone}`
            );
            setSupervisorsByCoordinator(supRes.data.data || []);
          } else {
            setSupervisorsByCoordinator([]);
          }
        } catch (e) {
          setCurrentCoordinator(null);
          setSupervisorsByCoordinator([]);
        }
      } else {
        setCurrentCoordinator(null);
        setSupervisorsByCoordinator([]);
      }
    };
    fetchCoordinatorAndSupervisors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.zone]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSite = async () => {
    if (!clientCode) {
      toast.error(t("errors.clientCodeNotFound"));
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await instance.post(
        `/companySite/create/${clientCode}/1162`,
        {
          name: formData.name,
          address: formData.address,
          location: siteCoordinates || {},
          costCenter: formData.costCenter,
          numberOfWorkers: parseInt(formData.numberOfWorkers),
          supervisorCode: formData.supervisorCode,
          zone: formData.zone,
        }
      );
      if (response.status === 201) {
        toast.success(t("success.siteAdded"));
        router.push(`/dashboard/configuracoes/clientes/[id]?clientCode=${clientCode}&companyName=${companyName}`);
      }
    } catch (error) {
      toast.error(t("errors.failedToAddSite"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.back()}>&larr; Voltar</Button>
        <h1 className="text-2xl font-bold">{t("modals.addSite.title")} {companyName ? `- ${companyName}` : ""}</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-2">
            <label htmlFor="costCenter">{t("fields.costCenter")}:</label>
            <Input
              id="costCenter"
              name="costCenter"
              value={formData.costCenter}
              onChange={handleInputChange}
              placeholder={t("placeholders.costCenter")}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="name">{t("fields.name")}:</label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t("placeholders.name")}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="address">{t("fields.address")}:</label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder={t("placeholders.address")}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="numberOfWorkers">Tl:</label>
            <Input
              id="numberOfWorkers"
              name="numberOfWorkers"
              type="text"
              value={formData.numberOfWorkers}
              onChange={handleInputChange}
              placeholder="Tl"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="zone">{t("fields.zone")}:</label>
            <Select
              value={formData.zone}
              onValueChange={(value) => setFormData((f) => ({ ...f, zone: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("placeholders.zone")} />
              </SelectTrigger>
              <SelectContent>
                {["1", "2", "3", "4", "5"].map((zona) => (
                  <SelectItem key={zona} value={zona}>
                    {zona}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formData.zone && currentCoordinator && (
            <div className="space-y-2 flex flex-col justify-end">
              <label className="font-semibold text-gray-700">Coordenador:</label>
              <span className="text-gray-900 font-medium">{currentCoordinator.name}</span>
            </div>
          )}
          {formData.zone && currentCoordinator && supervisorsByCoordinator.length > 0 && (
            <div className="space-y-2">
              <label className="font-semibold text-gray-700">Supervisor:</label>
              <Select
                value={formData.supervisorCode}
                onValueChange={(value) => setFormData((f) => ({ ...f, supervisorCode: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisorsByCoordinator.map((sup) => (
                    <SelectItem key={sup.code} value={sup.code}>
                      {sup.code} - {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {formData.zone && (
            <div className="space-y-2">
              <label className="font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Coordenadas do Site
              </label>
              {siteCoordinates ? (
                <div className="space-y-1">
                  <span className="block text-xs text-gray-700">
                    Latitude: <span className="text-gray-900 font-medium">{siteCoordinates.latitude}</span>
                  </span>
                  <span className="block text-xs text-gray-700">
                    Longitude: <span className="text-gray-900 font-medium">{siteCoordinates.longitude}</span>
                  </span>
                </div>
              ) : (
                <span className="text-xs text-gray-500">Coordenadas não disponíveis</span>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6 gap-2">
          <Button variant="outline" onClick={() => router.back()}>{t("buttons.cancel")}</Button>
          <Button onClick={handleAddSite} disabled={isSubmitting} className="bg-black text-white">
            {isSubmitting ? t("buttons.adding") : t("buttons.add")}
          </Button>
        </div>
      </div>
    </div>
  );
} 