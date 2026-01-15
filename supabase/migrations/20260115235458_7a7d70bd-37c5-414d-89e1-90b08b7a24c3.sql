-- Update existing news to replace "Agência Brasil" and similar editor names
UPDATE news 
SET editor_name = 'Redação Conexão na Cidade' 
WHERE editor_name ILIKE '%agência brasil%' 
   OR editor_name ILIKE '%agencia brasil%'
   OR editor_name ILIKE '%gov.br%'
   OR editor_name ILIKE 'agência%'
   OR editor_name ILIKE 'agencia%';