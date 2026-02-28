export const BUSINESS_CATEGORIES = [
  'Restaurante', 'Lanchonete', 'Padaria', 'Cafeteria', 'Bar', 'Pizzaria',
  'Supermercado', 'Minimercado', 'Mercearia', 'Açougue', 'Hortifruti',
  'Farmácia', 'Drogaria', 'Clínica Médica', 'Clínica Odontológica', 'Laboratório',
  'Hospital', 'Psicólogo', 'Nutricionista', 'Fisioterapeuta', 'Veterinária',
  'Advogado', 'Contabilidade', 'Escritório de Advocacia',
  'Academia', 'Estúdio de Pilates', 'Crossfit', 'Personal Trainer',
  'Salão de Beleza', 'Barbearia', 'Estética', 'Manicure', 'Spa',
  'Oficina Mecânica', 'Auto Elétrica', 'Lava Rápido', 'Borracharia', 'Autopeças',
  'Pet Shop', 'Clínica Veterinária', 'Banho e Tosa',
  'Escola', 'Creche', 'Curso de Idiomas', 'Escola de Música', 'Escola de Dança',
  'Imobiliária', 'Corretor de Imóveis', 'Construtora',
  'Loja de Roupas', 'Loja de Calçados', 'Ótica', 'Joalheria', 'Papelaria',
  'Assistência Técnica', 'Informática', 'Gráfica', 'Copiadora',
  'Floricultura', 'Funerária', 'Lavanderia', 'Costureira',
  'Hotel', 'Pousada', 'Motel',
  'Posto de Combustível', 'Estacionamento',
  'Igreja', 'Associação', 'ONG',
  'Outro',
] as const;

export const AMENITIES_LIST = [
  { key: 'wheelchair', label: 'Acessibilidade para cadeirantes', icon: '♿' },
  { key: 'parking', label: 'Estacionamento próprio', icon: '🅿️' },
  { key: 'card', label: 'Aceita cartão', icon: '💳' },
  { key: 'pix', label: 'Aceita PIX', icon: '📱' },
  { key: 'delivery', label: 'Delivery', icon: '🛵' },
  { key: 'takeout', label: 'Retirada no local', icon: '🛍️' },
  { key: 'wifi', label: 'Wi-Fi gratuito', icon: '📶' },
  { key: 'reservation', label: 'Reservas necessárias', icon: '📋' },
  { key: 'english', label: 'Atendimento em inglês', icon: '🇺🇸' },
] as const;

export const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

export interface DaySchedule {
  open: boolean;
  start: string;
  end: string;
}

export interface BusinessFormData {
  // Step 1
  name: string;
  cnpj: string;
  category_main: string;
  categories_secondary: string[];
  website: string;
  year_founded: string;
  // Step 2
  business_type: 'physical' | 'delivery' | 'both';
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  service_areas: string[];
  phone: string;
  whatsapp: string;
  whatsapp_same: boolean;
  email: string;
  // Step 3
  opening_hours: Record<string, DaySchedule>;
  holiday_hours: 'closed' | 'open' | 'special';
  amenities: string[];
  // Step 4
  description_full: string;
  services: string[];
  google_maps_url: string;
  instagram: string;
  facebook: string;
  // Step 5 — review only
}

export const DEFAULT_OPENING_HOURS: Record<string, DaySchedule> = {
  monday: { open: true, start: '08:00', end: '18:00' },
  tuesday: { open: true, start: '08:00', end: '18:00' },
  wednesday: { open: true, start: '08:00', end: '18:00' },
  thursday: { open: true, start: '08:00', end: '18:00' },
  friday: { open: true, start: '08:00', end: '18:00' },
  saturday: { open: true, start: '08:00', end: '13:00' },
  sunday: { open: false, start: '08:00', end: '13:00' },
};

export const INITIAL_FORM_DATA: BusinessFormData = {
  name: '',
  cnpj: '',
  category_main: '',
  categories_secondary: [],
  website: '',
  year_founded: '',
  business_type: 'physical',
  cep: '',
  address: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  service_areas: [],
  phone: '',
  whatsapp: '',
  whatsapp_same: true,
  email: '',
  opening_hours: DEFAULT_OPENING_HOURS,
  holiday_hours: 'closed',
  amenities: [],
  description_full: '',
  services: [],
  google_maps_url: '',
  instagram: '',
  facebook: '',
};
