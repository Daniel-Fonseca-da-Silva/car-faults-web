export const EUROPEAN_VEHICLE_MAKES: readonly string[] = [
  "Aiways",
  "Aixam",
  "Alpine",
  "Aston Martin",
  "Audi",
  "Bentley",
  "BMW",
  "BYD",
  "Changan",
  "Citroën",
  "Dodge",
  "Dongfeng",
  "Ferrari",
  "Fiat",
  "Ford",
  "GMC",
  "Honda",
  "Hyundai",
  "Jeep",
  "Kia",
  "Lada",
  "Lamborghini",
  "Ligier",
  "Maserati",
  "Mercedes-Benz",
  "MG",
  "Microcar",
  "Mitsubishi",
  "Nissan",
  "Opel",
  "Peugeot",
  "Porsche",
  "Renault",
  "Rolls-Royce",
  "SEAT",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

export function filterVehicleMakes(query: string): string[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [...EUROPEAN_VEHICLE_MAKES];

  return EUROPEAN_VEHICLE_MAKES.filter((make) =>
    make.toLowerCase().includes(normalizedQuery)
  );
}
