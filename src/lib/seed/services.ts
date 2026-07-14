export interface SeedService {
  name: string;
  category: string;
  durationMin: number;
  price: number;
}

export const SEED_SERVICES: SeedService[] = [
  { name: "Corte de cabello", category: "Peluquería", durationMin: 45, price: 30 },
  { name: "Peinado", category: "Peluquería", durationMin: 40, price: 35 },
  { name: "Cepillado", category: "Peluquería", durationMin: 40, price: 30 },
  { name: "Botox Capilar", category: "Tratamiento Capilar", durationMin: 90, price: 120 },
  { name: "Células Madres", category: "Tratamiento Capilar", durationMin: 90, price: 150 },
  { name: "Hidratación Capilar", category: "Tratamiento Capilar", durationMin: 60, price: 60 },
  { name: "Tinte", category: "Color", durationMin: 90, price: 80 },
  { name: "Mechas localizadas", category: "Color", durationMin: 120, price: 120 },
  { name: "High light", category: "Color", durationMin: 150, price: 180 },
  { name: "Reordenamiento de ondas", category: "Color", durationMin: 120, price: 130 },
  { name: "Ondulación Permanente", category: "Color", durationMin: 150, price: 160 },
  { name: "Morena iluminada", category: "Color", durationMin: 150, price: 170 },
  { name: "Balayage", category: "Color", durationMin: 180, price: 220 },
  { name: "Armonía de Color", category: "Color", durationMin: 120, price: 140 },
  { name: "Laceado Comercial", category: "Laceado", durationMin: 240, price: 250 },
  { name: "Laceado Con Queratina", category: "Laceado", durationMin: 240, price: 320 },
  { name: "Laceado con Chocolate", category: "Laceado", durationMin: 240, price: 350 },
  { name: "Laceado Marroquí", category: "Laceado", durationMin: 240, price: 380 },
  { name: "Tratamiento Facial", category: "Estética Facial", durationMin: 60, price: 70 },
  { name: "Exfoliación Facial", category: "Estética Facial", durationMin: 45, price: 50 },
  { name: "Make up", category: "Estética Facial", durationMin: 60, price: 90 },
  { name: "Depilación Hindú", category: "Depilación", durationMin: 45, price: 40 },
  { name: "Cejas con Henna", category: "Depilación", durationMin: 30, price: 25 },
  { name: "Paquetes de Novias", category: "Paquetes", durationMin: 240, price: 450 },
  { name: "Paquete de Quinceañeras", category: "Paquetes", durationMin: 240, price: 400 },
  { name: "Paquete de Graduadas", category: "Paquetes", durationMin: 240, price: 380 },
];

export const SEED_COLABORADORAS = [
  { fullName: "Elizabeth Roa Prado", phone: "989187417", specialty: "Peluquería y Color" },
  { fullName: "Lourdes Roa Prado", phone: "989284171", specialty: "Laceados y Tratamientos" },
  { fullName: "Yvette Roa de Burga", phone: "991697726", specialty: "Dirección y Estética Facial" },
];
