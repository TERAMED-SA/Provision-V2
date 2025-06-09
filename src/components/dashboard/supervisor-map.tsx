"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, isToday, isYesterday, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import {
  CalendarIcon,
  Filter,
  Loader2,
  MapPin,
  RefreshCw,
  Route,
  Search,
  User,
  UserCheck,
  UserMinus,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import toast from "react-hot-toast";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import instance from "@/lib/api";

interface Supervisor {
  employeeId: string;
  userId: string;
  name: string;
  lat?: number;
  lng?: number;
  time?: string;
  route?: Record<string, { lat: number; lng: number }>;
}

interface MarkerWithInfo {
  marker: google.maps.Marker;
  employeeId: string;
}

const LUANDA_COORDS = { lat: -8.8368, lng: 13.2343 };
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const ONLINE_THRESHOLD_MINUTES = .1;

const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-40">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const MapDirectionsRenderer = ({
  origin,
  destination,
  waypoints,
}: {
  origin: google.maps.LatLng;
  destination: google.maps.LatLng;
  waypoints: google.maps.DirectionsWaypoint[];
}) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLibrary || !map) return;

    const renderer = new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#3b82f6",
        strokeWeight: 5,
        strokeOpacity: 0.7,
      },
    });

    setDirectionsRenderer(renderer);

    return () => {
      if (renderer) renderer.setMap(null);
    };
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!routesLibrary || !directionsRenderer || !origin || !destination)
      return;

    const directionsService = new routesLibrary.DirectionsService();

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
        }
      }
    );

    return () => {
      if (directionsRenderer) directionsRenderer.setMap(null);
    };
  }, [routesLibrary, directionsRenderer, origin, destination, waypoints]);

  return null;
};

const SupervisorMarker = ({
  user,
  isSelected,
  onClick,
}: {
  user: Supervisor;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const isOnline = useMemo(() => isUserOnline(user), [user]);

  if (!user.lat || !user.lng) return null;

  return (
    <AdvancedMarker
      position={{ lat: user.lat, lng: user.lng }}
      onClick={() => {
        setShowInfo(true);
        onClick();
      }}
      zIndex={isSelected ? 999 : isOnline ? 100 : 10}
    >
      <div
        className={cn(
          "relative flex items-center justify-center transition-all duration-200 hover:scale-110",
          isSelected && "scale-125 z-50"
        )}
      >
        <div
          className={cn(
            "rounded-full p-3 shadow-lg border-2 border-white transition-colors duration-200",
            isOnline
              ? "bg-gradient-to-r from-green-400 to-green-600 shadow-green-200"
              : "bg-gradient-to-r from-red-400 to-red-600 shadow-red-200"
          )}
        >
          <MapPin className="h-6 w-6 text-white drop-shadow-sm" />
        </div>
        {isOnline && (
          <div className="absolute -top-1 -right-1">
            <div className="relative flex h-4 w-4">
              <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></div>
              <div className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></div>
            </div>
          </div>
        )}
      </div>

      {showInfo && (
        <InfoWindow
          position={{ lat: user.lat, lng: user.lng }}
          onCloseClick={() => setShowInfo(false)}
          className="min-w-[150px] p-0"
        >
          <div className="p-4 pr-8">
            <h3 className="font-semibold text-base text-gray-900 mb-3">
              {user.name}
            </h3>

            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                    <Wifi className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-700">
                    Online
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100">
                    <WifiOff className="h-3 w-3 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-red-700">
                    Offline
                  </span>
                </>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </AdvancedMarker>
  );
};

const isUserOnline = (user: Supervisor): boolean => {
  if (!user?.time) return false;

  const userTime = new Date(user.time);
  const currentTime = new Date();
  const diffInMinutes =
    (currentTime.getTime() - userTime.getTime()) / (1000 * 60);

  return diffInMinutes <= ONLINE_THRESHOLD_MINUTES;
};

const formatLastSeen = (timeString?: string): string => {
  if (!timeString) return "Desconhecido";

  const date = new Date(timeString);

  if (isToday(date)) {
    return `Hoje às ${format(date, "HH:mm")}`;
  } else if (isYesterday(date)) {
    return `Ontem às ${format(date, "HH:mm")}`;
  } else {
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  }
};

const wasUserOnlineOnDate = (user: Supervisor, date: Date): boolean => {
  if (!user?.time) return false;

  const userTime = new Date(user.time);
  return (
    userTime.getDate() === date.getDate() &&
    userTime.getMonth() === date.getMonth() &&
    userTime.getFullYear() === date.getFullYear()
  );
};

export default function SupervisorMap() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"routes" | "online">("routes");
  const [users, setUsers] = useState<Supervisor[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Supervisor[]>([]);
  const [selectedUser, setSelectedUser] = useState<Supervisor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRouteButton, setShowRouteButton] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showOfflineOnly, setShowOfflineOnly] = useState(false);
  const [showInfoCards, setShowInfoCards] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await instance.get(`/user?size=100`);

      if (response.data && Array.isArray(response.data.data.data)) {
        setUsers(response.data.data.data);
        setFilteredUsers(response.data.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar supervisores");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchGeoLocation = useCallback(
    async (users: Supervisor) => {
      if (!users) return;

      try {
        setIsLoading(true);
        const response = await instance.get(
          `/geoLocation/findUserGeo/${
            users.employeeId
          }?day=${selectedDate.getDate()}&month=${
            selectedDate.getMonth() + 1
          }&year=${selectedDate.getFullYear()}`
        );

        if (response.data.data.length === 0) {
          toast.error("Nenhuma localização encontrada para esta data");
          return;
        }

        const routePoints: { lat: number; lng: number }[] = [];

        response.data.data.forEach((markerData: any) => {
          if (markerData.route && typeof markerData.route === "object") {
            Object.values(markerData.route).forEach((location: any) => {
              if (location.lat && location.lng) {
                routePoints.push({ lat: location.lat, lng: location.lng });
              }
            });
          }
        });

        if (routePoints.length > 0) {
          setMarkers(routePoints);
          setShowRouteButton(true);
          toast.success("Rota carregada com sucesso");
        } else {
          toast.error("Nenhuma rota encontrada para esta data");
        }
      } catch (error) {
        console.error("Error fetching geolocation:", error);
        toast.error("Erro ao carregar localização");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDate]
  );

  const fetchAllUsersPositions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await instance.get(
        `/geolocation/findAllUserLastPosition`
      );

      if (response.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
        applyFilters(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching all users positions:", error);
      toast.error("Não foi possível carregar as posições dos supervisores");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFilters = useCallback(
    (usersToFilter: Supervisor[]) => {
      if (!usersToFilter || !Array.isArray(usersToFilter)) return;

      let result = [...usersToFilter];

      if (searchTerm && searchTerm.trim().length >= 2) {
        result = result.filter(
          (user) =>
            user.name &&
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (showOnlineOnly) {
        result = result.filter((user) => isUserOnline(user));
      } else if (showOfflineOnly) {
        result = result.filter((user) => !isUserOnline(user));
      }

      if (activeTab === "online" && selectedDate) {
        result = result.filter((user) =>
          wasUserOnlineOnDate(user, selectedDate)
        );
      }

      setFilteredUsers(result);
    },
    [searchTerm, showOnlineOnly, showOfflineOnly, activeTab, selectedDate]
  );

  useEffect(() => {
    if (activeTab === "routes") {
      fetchUsers();
    } else {
      fetchAllUsersPositions();
    }
  }, [activeTab, fetchUsers, fetchAllUsersPositions]);

  useEffect(() => {
    applyFilters(users);
  }, [users, applyFilters]);

  useEffect(() => {
    if (selectedUser && activeTab === "routes") {
      fetchGeoLocation(selectedUser);
    }
  }, [selectedUser, selectedDate, activeTab, fetchGeoLocation]);
  const handleTabChange = (value: string) => {
    setActiveTab(value as "routes" | "online");
    setSelectedUser(null);
    setShowRoute(false);
    setMarkers([]);
    setShowRouteButton(false);
    setSearchTerm("");
  };

  const handleUserSelection = (user: Supervisor) => {
    setSelectedUser(user);
    setShowRoute(false);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      if (selectedUser && activeTab === "routes") {
        setShowRoute(false);
        fetchGeoLocation(selectedUser);
      } else if (activeTab === "online") {
        applyFilters(users);
      }
    }
  };

  const toggleRoute = () => {
    setShowRoute(!showRoute);
  };

  const refreshData = () => {
    if (activeTab === "routes") {
      if (selectedUser) {
        fetchGeoLocation(selectedUser);
      } else {
        fetchUsers();
      }
    } else {
      fetchAllUsersPositions();
    }
  };

  const toggleOnlineFilter = () => {
    setShowOnlineOnly(true);
    setShowOfflineOnly(false);
  };

  const toggleOfflineFilter = () => {
    setShowOfflineOnly(true);
    setShowOnlineOnly(false);
  };

  const showAllUsers = () => {
    setShowOnlineOnly(false);
    setShowOfflineOnly(false);
  };

  const toggleInfoCards = () => {
    setShowInfoCards(!showInfoCards);
  };

  const setToday = () => {
    setSelectedDate(new Date());
  };

  const setYesterday = () => {
    setSelectedDate(subDays(new Date(), 1));
  };

  const onlineUsersCount = useMemo(
    () => filteredUsers.filter((user) => isUserOnline(user)).length,
    [filteredUsers]
  );

  const offlineUsersCount = useMemo(
    () => filteredUsers.filter((user) => !isUserOnline(user)).length,
    [filteredUsers]
  );

  const routeWaypoints = useMemo(() => {
    if (!markers.length || markers.length < 2) return null;

    const origin = new google.maps.LatLng(markers[0].lat, markers[0].lng);
    const destination = new google.maps.LatLng(
      markers[markers.length - 1].lat,
      markers[markers.length - 1].lng
    );

    const waypoints = markers.slice(1, -1).map((point) => ({
      location: new google.maps.LatLng(point.lat, point.lng),
      stopover: true,
    }));

    return { origin, destination, waypoints };
  }, [markers]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm z-10">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                <SheetHeader className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <SheetTitle className="text-gray-800">
                    Filtros e Opções
                  </SheetTitle>
                  <SheetDescription className="text-gray-600">
                    Selecione supervisores e visualize suas rotas
                  </SheetDescription>
                </SheetHeader>
                <div className="p-4">{renderSidebar()}</div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <h1 className="text-lg font-semibold text-gray-800">
                {activeTab === "routes"
                  ? "Rotas dos Supervisores"
                  : "Supervisores Online"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              className="gap-2 cursor-pointer hover:bg-blue-50 border-blue-200"
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex md:w-[320px] lg:w-[380px] flex-col border-r bg-white shadow-sm">
          {renderSidebar()}
        </div>

        <div className="flex-1 relative">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={LUANDA_COORDS}
              defaultZoom={13}
              gestureHandling="greedy"
              mapId="supervisor-map"
              className="w-full h-full"
              options={{
                styles: [
                  {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }],
                  },
                ],
              }}
            >
              {activeTab === "online" &&
                filteredUsers.map((user) => (
                  <SupervisorMarker
                    key={user.userId}
                    user={user}
                    isSelected={selectedUser?.userId === user.userId}
                    onClick={() => handleUserSelection(user)}
                  />
                ))}

              {activeTab === "routes" &&
                markers.map((marker, index) => (
                  <AdvancedMarker
                    key={`route-${index}`}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    zIndex={
                      index === 0
                        ? 999
                        : index === markers.length - 1
                        ? 998
                        : 10
                    }
                  >
                    <div
                      className={cn(
                        "rounded-full p-2 shadow-lg border-2 border-white transition-all duration-200 hover:scale-110",
                        index === 0
                          ? "bg-gradient-to-r from-green-400 to-green-600"
                          : index === markers.length - 1
                          ? "bg-gradient-to-r from-red-400 to-red-600"
                          : "bg-gradient-to-r from-blue-400 to-blue-600"
                      )}
                    >
                      <MapPin className="h-5 w-5 text-white drop-shadow-sm" />
                    </div>
                  </AdvancedMarker>
                ))}

              {showRoute && routeWaypoints && (
                <MapDirectionsRenderer
                  origin={routeWaypoints.origin}
                  destination={routeWaypoints.destination}
                  waypoints={routeWaypoints.waypoints}
                />
              )}
            </Map>
          </APIProvider>
        </div>
      </div>
    </div>
  );

  function renderSidebar() {
    return (
      <div className="flex flex-col h-full">
        <Tabs
          defaultValue="routes"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="px-4 pt-4">
            <TabsList className="w-full bg-gray-100">
              <TabsTrigger
                value="routes"
                className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Route className="h-4 w-4 mr-2" />
                Rotas
              </TabsTrigger>
              <TabsTrigger
                value="online"
                className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Online
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="routes" className="flex-1 flex flex-col p-0">
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <Label
                  htmlFor="search-supervisor"
                  className="text-sm font-medium text-gray-700"
                >
                  Buscar supervisor
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search-supervisor"
                    placeholder="Digite o nome do supervisor..."
                    className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">
                    Selecionar data
                  </Label>
                  <div className="flex gap-1">
                    <Button
                      variant={
                        selectedDate.toDateString() ===
                        new Date().toDateString()
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={setToday}
                      className={cn(
                        "h-8 text-xs cursor-pointer",
                        selectedDate.toDateString() ===
                          new Date().toDateString()
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-50 border-blue-200"
                      )}
                    >
                      Hoje
                    </Button>
                    <Button
                      variant={
                        selectedDate.toDateString() ===
                        subDays(new Date(), 1).toDateString()
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={setYesterday}
                      className={cn(
                        "h-8 text-xs cursor-pointer",
                        selectedDate.toDateString() ===
                          subDays(new Date(), 1).toDateString()
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-50 border-blue-200"
                      )}
                    >
                      Ontem
                    </Button>
                  </div>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-gray-200 hover:bg-gray-50"
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 text-gray-500" />
                      {format(selectedDate, "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateChange}
                      initialFocus
                      className="rounded-md border-0"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Separator className="bg-gray-200" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">
                    Supervisores
                  </Label>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 border-blue-200"
                  >
                    {filteredUsers.length}
                  </Badge>
                </div>
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <ScrollArea className="h-[280px] rounded-lg border border-gray-200 bg-gray-50">
                    <div className="p-3 space-y-2">
                      {filteredUsers.length === 0 ? (
                        <div className="text-center py-8">
                          <User className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-sm text-gray-500">
                            Nenhum supervisor encontrado
                          </p>
                        </div>
                      ) : (
                        filteredUsers.map((user) => (
                          <div
                            key={user.employeeId}
                            className={cn(
                              "flex items-center space-x-3 rounded-lg p-3 cursor-pointer transition-all duration-200",
                              "hover:bg-white hover:shadow-sm border border-transparent",
                              selectedUser?.employeeId === user.employeeId &&
                                "bg-blue-50 border-blue-200 shadow-sm"
                            )}
                            onClick={() => handleUserSelection(user)}
                          >
                            <div
                              className={cn(
                                "rounded-full p-2 transition-colors duration-200",
                                selectedUser?.employeeId === user.employeeId
                                  ? "bg-blue-500"
                                  : "bg-gray-200"
                              )}
                            >
                              <User
                                className={cn(
                                  "h-4 w-4",
                                  selectedUser?.employeeId === user.employeeId
                                    ? "text-white"
                                    : "text-gray-600"
                                )}
                              />
                            </div>
                            <span
                              className={cn(
                                "text-sm font-medium",
                                selectedUser?.employeeId === user.employeeId
                                  ? "text-blue-700"
                                  : "text-gray-700"
                              )}
                            >
                              {user.name}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {showRouteButton && (
                <Button
                  onClick={toggleRoute}
                  className={cn(
                    "w-full gap-2 transition-all cursor-pointer duration-200",
                    showRoute
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  )}
                  variant={showRoute ? "default" : "outline"}
                >
                  <Route className="h-4 w-4" />
                  {showRoute ? "Ocultar Rota" : "Mostrar Rota"}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="online" className="flex-1 flex flex-col p-0">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-online">Buscar supervisor</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-online"
                    placeholder="Nome do supervisor..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Filtros</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={showOnlineOnly ? "default" : "outline"}
                    onClick={toggleOnlineFilter}
                    className={cn(
                      "gap-1 cursor-pointer",
                      showOnlineOnly &&
                        "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Online
                  </Button>
                  <Button
                    size="sm"
                    variant={showOfflineOnly ? "default" : "outline"}
                    onClick={toggleOfflineFilter}
                    className={cn(
                      "gap-1 cursor-pointer",
                      showOfflineOnly &&
                        "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    Offline
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      !showOnlineOnly && !showOfflineOnly
                        ? "default"
                        : "outline"
                    }
                    onClick={showAllUsers}
                    className={cn(
                      "gap-1 cursor-pointer",
                      !showOnlineOnly &&
                        !showOfflineOnly &&
                        "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Todos
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Filtrar por data</Label>
                  <div className="flex gap-1">
                    <Button
                      variant={
                        selectedDate.toDateString() ===
                        new Date().toDateString()
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={setToday}
                      className={cn(
                        "h-7 text-xs cursor-pointer",
                        selectedDate.toDateString() ===
                          new Date().toDateString()
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-50 border-blue-200"
                      )}
                    >
                      Hoje
                    </Button>
                    <Button
                      variant={
                        selectedDate.toDateString() ===
                        subDays(new Date(), 1).toDateString()
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={setYesterday}
                      className={cn(
                        "h-7 text-xs cursor-pointer",
                        selectedDate.toDateString() ===
                          subDays(new Date(), 1).toDateString()
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-50 border-blue-200"
                      )}
                    >
                      Ontem
                    </Button>
                  </div>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Card>
                <CardHeader className="py-2 flex justify-between">
                  <CardTitle className="text-sm font-medium">
                    Estatísticas
                  </CardTitle>
                  <CardTitle className="text-sm font-medium">
                    Total {filteredUsers.length}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Online:</span>
                    <Badge variant="default" className="bg-green-500">
                      {onlineUsersCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Offline:</span>
                    <Badge variant="destructive">{offlineUsersCount}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
}
