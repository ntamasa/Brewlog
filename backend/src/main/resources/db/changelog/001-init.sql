--liquibase formatted sql

--changeset brewlog:001-init
CREATE TABLE brew_method (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon_key VARCHAR(20) NOT NULL,
    predefined BOOLEAN NOT NULL,
    is_protected BOOLEAN NOT NULL DEFAULT false,
    position INT NULL
);

CREATE UNIQUE INDEX ux_brew_method_name ON brew_method (lower(name));

CREATE TABLE brew (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bean_name VARCHAR(100) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    method_id BIGINT NOT NULL REFERENCES brew_method (id),
    roast VARCHAR(6) NOT NULL CHECK (roast IN ('LIGHT', 'MEDIUM', 'DARK')),
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    brew_date DATE NOT NULL,
    notes VARCHAR(2000) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_brew_name ON brew (lower(name));

CREATE INDEX ON brew (method_id);

CREATE INDEX ON brew (brew_date, created_at);
