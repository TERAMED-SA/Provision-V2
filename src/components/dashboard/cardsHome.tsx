"use client";

import { Hammer, UserIcon, Building2Icon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import instance from "@/lib/api";

export function SectionCards() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [companyCount, setCompanyCount] = useState<number | null>(null);
  const [equipmentCount, setEquipmentCount] = useState<number | null>(null);

  const t = useTranslations("SectionCards");

  useEffect(() => {
    async function fetchData() {
      try {
        const userResponse = await instance.get(`user?size=1000`);
        setUserCount(userResponse.data.data.data.length);

        const companyResponse = await instance.get(`/company?size=500`);
        setCompanyCount(companyResponse.data.data.data.length);

        const equipmentResponse = await instance.get(`/equipment?size=8000`);
        setEquipmentCount(equipmentResponse.data.data.data.length);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }

    fetchData();
  }, []);

  const cardsData = [
    {
      title: t("supervisores"),
      value: userCount,
      link: "/dashboard/supervisores",
      description: t("totalSupervisores"),
      icon: <UserIcon className="size-5" />,
      color: "bg-blue-100 text-blue-500",
    },
    {
      title: t("clientes"),
      value: companyCount,
      link: "/dashboard",
      description: t("totalClientes"),
      icon: <Building2Icon className="size-5" />,
      color: "bg-amber-100 text-amber-500",
    },
    {
      title: t("equipamentos"),
      value: equipmentCount,
      link: "/dashboard",
      description: t("totalEquipamentos"),
      icon: <Hammer className="size-5" />,
      color: "bg-rose-100 text-rose-500",
    },
  ];

  return (
    <div className=" gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {cardsData.map((card, index) => (
        <Link key={index} href={card.link} className="block">
          <div className="bg-white dark:bg-gray-800 rounded-sm p-5  border border-gray-200 dark:border-gray-700">
            <div className="flex items-start">
              <div className={`${card.color} p-3 rounded-full mr-4`}>
                {card.icon}
              </div>
              <div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-gray-800 dark:text-white">
                    {card.value !== null ? (
                      `${card.value}`
                    ) : (
                    <div className="flex  w-full items-center justify-center">
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-500"></div>
    </div>
                    )}
                  </span>

                  <span className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">
                    {card.description}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
