-- EnviroGest MX — MySQL DDL
-- Compatible con MySQL 8.0+
-- Ejecutar en orden; todas las FKs están al final para evitar dependencias circulares.
--
-- HOSTING COMPARTIDO (InfinityFree, iFastNet, cPanel, etc.):
--   No ejecutes CREATE DATABASE ni USE — la DB ya existe y la selecciona tu panel.
--   Abre phpMyAdmin → selecciona tu base de datos → pestaña SQL → pega todo lo de abajo.
--
-- TU DATABASE_URL quedará así:
--   mysql://if0_41860454:TU_PASSWORD@sql.infinityfree.com:3306/if0_41860454_envirogest

-- ─────────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           VARCHAR(36)                            NOT NULL DEFAULT (UUID()),
  nombre       VARCHAR(100)                           NOT NULL,
  empresa      VARCHAR(150)                           NOT NULL DEFAULT '',
  email        VARCHAR(150)                           NOT NULL,
  pwd_hash     VARCHAR(100)                           NOT NULL,
  rol          ENUM('admin','consultor','cliente')    NOT NULL,
  giro         VARCHAR(100)                           NULL,
  proyecto_id  VARCHAR(36)                            NULL,
  created_at   DATETIME                               NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME                               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE  KEY uq_users_email (email),
  INDEX        idx_users_rol   (rol)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id           VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  cliente_id   VARCHAR(36)  NOT NULL,
  consultor_id VARCHAR(36)  NULL,
  notas        TEXT         NOT NULL DEFAULT (''),
  creado       DATE         NOT NULL DEFAULT (CURDATE()),
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_projects_cliente   (cliente_id),
  INDEX idx_projects_consultor (consultor_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────
-- QUESTIONNAIRES  (1:1 con projects)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questionnaires (
  id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  proyecto_id         VARCHAR(36)   NOT NULL,
  respondido          TINYINT(1)    NOT NULL DEFAULT 0,
  giro                VARCHAR(100)  NOT NULL DEFAULT '',
  emisiones           TINYINT(1)    NULL,
  agua                TINYINT(1)    NULL,
  residuos_peligrosos TINYINT(1)    NOT NULL DEFAULT 0,
  residuos_especiales TINYINT(1)    NOT NULL DEFAULT 0,
  obras               TINYINT(1)    NULL,
  fecha               DATE          NULL,
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_questionnaires_proyecto (proyecto_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────
-- TRAMITES
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tramites (
  id           VARCHAR(36)   NOT NULL DEFAULT (UUID()),
  proyecto_id  VARCHAR(36)   NOT NULL,
  catalog_id   VARCHAR(50)   NOT NULL,
  nombre       VARCHAR(200)  NOT NULL,
  autoridad    VARCHAR(100)  NOT NULL,
  nivel        ENUM('federal','estatal','municipal')                                              NOT NULL,
  base_legal   VARCHAR(300)  NOT NULL DEFAULT '',
  descripcion  TEXT          NOT NULL DEFAULT (''),
  estado       ENUM('no_iniciado','recopilando','ingresado','en_revision','cumplido','vencido')   NOT NULL DEFAULT 'no_iniciado',
  fecha_limite DATE          NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_tramites_proyecto    (proyecto_id),
  INDEX idx_tramites_estado      (estado),
  INDEX idx_tramites_fecha_limite (fecha_limite)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────
-- CRONOGRAMAS  (1:1 con tramites)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cronogramas (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  tramite_id VARCHAR(36)   NOT NULL,
  inicio     DATE          NULL,
  fin        DATE          NULL,
  notas      TEXT          NOT NULL DEFAULT (''),

  PRIMARY KEY (id),
  UNIQUE KEY uq_cronogramas_tramite (tramite_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────
-- HITOS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hitos (
  id            VARCHAR(36)   NOT NULL DEFAULT (UUID()),
  cronograma_id INT UNSIGNED  NOT NULL,
  nombre        VARCHAR(200)  NOT NULL,
  fecha         DATE          NOT NULL,
  completado    TINYINT(1)    NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  INDEX idx_hitos_cronograma (cronograma_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────
-- TRAMITE_DOCUMENTOS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tramite_documentos (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  tramite_id VARCHAR(36)   NOT NULL,
  texto      VARCHAR(300)  NOT NULL,
  orden      INT           NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  INDEX idx_tramite_docs (tramite_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────
-- NOTAS_TRAMITE
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notas_tramite (
  id         VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  tramite_id VARCHAR(36)  NOT NULL,
  texto      TEXT         NOT NULL,
  fecha      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_notas_tramite (tramite_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────
-- ALERTAS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alertas (
  id          VARCHAR(36)   NOT NULL DEFAULT (UUID()),
  proyecto_id VARCHAR(36)   NOT NULL,
  tramite_id  VARCHAR(36)   NULL,
  tipo        ENUM('vencimiento','solicitud','firma','visita','estado','info')  NOT NULL,
  mensaje     TEXT          NOT NULL,
  fecha       DATE          NOT NULL,
  leido       TINYINT(1)    NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_alertas_proyecto (proyecto_id),
  INDEX idx_alertas_leido    (leido)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────
-- INSTRUCCIONES
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS instrucciones (
  id          VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  proyecto_id VARCHAR(36)  NOT NULL,
  texto       TEXT         NOT NULL,
  urgente     TINYINT(1)   NOT NULL DEFAULT 0,
  fecha       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  leido       TINYINT(1)   NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  INDEX idx_instrucciones_proyecto (proyecto_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────
-- REUNIONES
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reuniones (
  id          VARCHAR(36)   NOT NULL DEFAULT (UUID()),
  proyecto_id VARCHAR(36)   NOT NULL,
  titulo      VARCHAR(200)  NOT NULL,
  fecha       DATE          NOT NULL,
  hora        VARCHAR(10)   NOT NULL,
  duracion    VARCHAR(20)   NOT NULL DEFAULT '60',
  agenda      TEXT          NOT NULL DEFAULT (''),
  gcal_link   TEXT          NOT NULL DEFAULT (''),
  creado      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_reuniones_proyecto (proyecto_id),
  INDEX idx_reuniones_fecha    (fecha)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────
-- ISO14001_CHECKS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS iso14001_checks (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  proyecto_id VARCHAR(36)   NOT NULL,
  seccion_key VARCHAR(50)   NOT NULL,
  item_key    VARCHAR(50)   NOT NULL,
  cumple      TINYINT(1)    NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY uq_iso14001_check (proyecto_id, seccion_key, item_key),
  INDEX idx_iso14001_proyecto (proyecto_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────
-- FOREIGN KEYS
-- Declaradas al final para facilitar el DROP/recreación en CI.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE projects
  ADD CONSTRAINT fk_projects_cliente
    FOREIGN KEY (cliente_id)   REFERENCES users(id)    ON DELETE CASCADE,
  ADD CONSTRAINT fk_projects_consultor
    FOREIGN KEY (consultor_id) REFERENCES users(id)    ON DELETE SET NULL;

ALTER TABLE questionnaires
  ADD CONSTRAINT fk_questionnaires_proyecto
    FOREIGN KEY (proyecto_id)  REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE tramites
  ADD CONSTRAINT fk_tramites_proyecto
    FOREIGN KEY (proyecto_id)  REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE cronogramas
  ADD CONSTRAINT fk_cronogramas_tramite
    FOREIGN KEY (tramite_id)   REFERENCES tramites(id) ON DELETE CASCADE;

ALTER TABLE hitos
  ADD CONSTRAINT fk_hitos_cronograma
    FOREIGN KEY (cronograma_id) REFERENCES cronogramas(id) ON DELETE CASCADE;

ALTER TABLE tramite_documentos
  ADD CONSTRAINT fk_tramite_docs_tramite
    FOREIGN KEY (tramite_id)   REFERENCES tramites(id) ON DELETE CASCADE;

ALTER TABLE notas_tramite
  ADD CONSTRAINT fk_notas_tramite_tramite
    FOREIGN KEY (tramite_id)   REFERENCES tramites(id) ON DELETE CASCADE;

ALTER TABLE alertas
  ADD CONSTRAINT fk_alertas_proyecto
    FOREIGN KEY (proyecto_id)  REFERENCES projects(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_alertas_tramite
    FOREIGN KEY (tramite_id)   REFERENCES tramites(id) ON DELETE SET NULL;

ALTER TABLE instrucciones
  ADD CONSTRAINT fk_instrucciones_proyecto
    FOREIGN KEY (proyecto_id)  REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE reuniones
  ADD CONSTRAINT fk_reuniones_proyecto
    FOREIGN KEY (proyecto_id)  REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE iso14001_checks
  ADD CONSTRAINT fk_iso14001_proyecto
    FOREIGN KEY (proyecto_id)  REFERENCES projects(id) ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────────
-- SEED — Admin por defecto
-- Actualiza pwd_hash con el hash bcrypt generado por el servidor.
-- ─────────────────────────────────────────────────────────────────
-- INSERT INTO users (id, nombre, empresa, email, pwd_hash, rol)
-- VALUES ('bioimpact_admin_v1', 'Raúl', 'BIOIMPACT', 'admin@bioimpact.com.mx',
--         '$2b$12$REEMPLAZA_CON_HASH_REAL', 'admin')
-- ON DUPLICATE KEY UPDATE updated_at = NOW();
