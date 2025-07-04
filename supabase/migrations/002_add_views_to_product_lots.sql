-- Adiciona o campo de contagem de acessos à tabela de lotes
ALTER TABLE product_lots ADD COLUMN views integer NOT NULL DEFAULT 0; 