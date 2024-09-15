CREATE TABLE IF NOT EXISTS file_info(
    domain_name VARCHAR NOT NULL,
    file_name VARCHAR,
    file_date VARCHAR
);

CREATE TABLE IF NOT EXISTS domain_content(
    domain_uuid UUID NOT NULL,
    domain_name VARCHAR NOT NULL,
    sentences VARCHAR,
    embeddings float []
);