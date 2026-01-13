-- Seed data for Transporte Escolar module
-- Insert example schools from Cotia, SP

INSERT INTO schools (nome_oficial, rede, bairro, endereco, status)
VALUES 
  ('EMEF Jornalista Cláudio Abramo', 'municipal', 'Granja Viana', 'Rua das Hortênsias, 245', 'ativo'),
  ('EE Professor Maria José de Aguiar Moura', 'estadual', 'Centro', 'Avenida Professor Manoel José Pedroso, 1500', 'ativo'),
  ('Colégio Objetivo Cotia', 'particular', 'Granja Viana', 'Rua Camargo, 312', 'ativo'),
  ('EMEF Ary de Oliveira Seabra', 'municipal', 'Jardim das Flores', 'Rua dos Jasmins, 100', 'ativo'),
  ('EE Padre Anchieta', 'estadual', 'Caucaia do Alto', 'Estrada Municipal de Caucaia do Alto, 2500', 'ativo'),
  ('CEMEB Professora Antonieta Borges Alves', 'municipal', 'Parque São George', 'Rua Agenor Ribeiro, 50', 'ativo'),
  ('Colégio Pentágono Cotia', 'particular', 'Granja Viana', 'Av. João Paulo Ablas, 301', 'ativo'),
  ('EMEI Monteiro Lobato', 'municipal', 'Jardim Nomura', 'Rua Saitama, 200', 'ativo'),
  ('EE Professor José Barreto', 'estadual', 'Portão', 'Rua Principal, 456', 'ativo'),
  ('Escola Maple Bear Cotia', 'particular', 'Granja Viana', 'Rua dos Coqueiros, 789', 'ativo')
ON CONFLICT DO NOTHING;

-- Insert example transporters with correct enum values
INSERT INTO transporters (nome, whatsapp, telefone, descricao_curta, nivel_verificacao, atende_acessibilidade, tipo_servico, veiculo_tipo, capacidade_aprox, ar_condicionado, cinto_individual, vagas_status, status)
VALUES 
  ('João Silva Transportes', '5511999998888', '(11) 99999-8888', 'Transporte escolar na Granja Viana há mais de 10 anos', 2, false, 'porta_a_porta', 'van', 15, true, true, 'tenho_vagas', 'ativo'),
  ('Maria Oliveira Van Escolar', '5511988887777', '(11) 98888-7777', 'Especializado em crianças com necessidades especiais', 3, true, 'ambos', 'micro_onibus', 12, true, true, 'tenho_vagas', 'ativo'),
  ('Carlos Souza Transporte Escolar', '5511977776666', '(11) 97777-6666', 'Atendimento personalizado em Caucaia do Alto', 1, false, 'ponto_encontro', 'van', 20, false, true, 'tenho_vagas', 'ativo'),
  ('Ana Santos Transportes', '5511966665555', '(11) 96666-5555', 'Transporte adaptado com elevador para cadeirantes', 2, true, 'porta_a_porta', 'van', 10, true, true, 'lista_espera', 'ativo'),
  ('Pedro Costa Van Escolar', '5511955554444', '(11) 95555-4444', 'Novo na região, veículo 0km', 1, false, 'ambos', 'van', 18, true, true, 'tenho_vagas', 'pendente')
ON CONFLICT DO NOTHING;