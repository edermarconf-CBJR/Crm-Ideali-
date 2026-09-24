CREATE TABLE controle_equipe(id integer PRIMARY KEY CHECK(id=1));
INSERT INTO controle_equipe VALUES(1);
CREATE TABLE membros(id text PRIMARY KEY REFERENCES "user"(id),perfil text NOT NULL CHECK(perfil IN ('gestor','corretor')),estado text NOT NULL CHECK(estado IN ('convidado','ativo','inativo')),versao integer NOT NULL DEFAULT 1 CHECK(versao>0),criado_em timestamptz NOT NULL DEFAULT now());
CREATE TABLE historico(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),autor_id text REFERENCES membros(id),entidade_id text NOT NULL,acao text NOT NULL,campos text[] NOT NULL DEFAULT '{}',anterior_id text,novo_id text,data timestamptz NOT NULL DEFAULT now());
CREATE INDEX historico_entidade_data ON historico(entidade_id,data,id);
CREATE TABLE operacoes(ator_id text NOT NULL REFERENCES membros(id),operacao_id uuid NOT NULL,tipo text NOT NULL,alvo text,hash text NOT NULL,resultado_id text NOT NULL,versao integer NOT NULL,PRIMARY KEY(ator_id,operacao_id));
