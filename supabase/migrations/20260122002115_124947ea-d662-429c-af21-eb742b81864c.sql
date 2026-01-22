-- Inserir programa de demonstração "Jornal da Manhã"
INSERT INTO broadcast_programs (
  channel_id,
  name,
  slug,
  description,
  host_name,
  category,
  default_day_of_week,
  default_start_time,
  default_duration_minutes,
  is_active
)
VALUES (
  'ba005b02-2043-4669-83ff-5efcc2a6e113',
  'Jornal da Manhã',
  'jornal-da-manha',
  'O principal telejornal matinal de Cotia com as notícias locais e regionais em tempo real.',
  'Equipe Conexão',
  'Jornalismo',
  1,
  '07:00:00',
  60,
  true
);

-- Inserir programa adicional "Conexão Esportes"
INSERT INTO broadcast_programs (
  channel_id,
  name,
  slug,
  description,
  host_name,
  category,
  default_day_of_week,
  default_start_time,
  default_duration_minutes,
  is_active
)
VALUES (
  'ba005b02-2043-4669-83ff-5efcc2a6e113',
  'Conexão Esportes',
  'conexao-esportes',
  'Cobertura completa do esporte local e nacional com análises e entrevistas exclusivas.',
  'Redação Esportes',
  'Esportes',
  3,
  '19:00:00',
  45,
  true
);