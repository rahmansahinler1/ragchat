CREATE TABLE IF NOT EXISTS file_info(
    file_uuid  UUID PRIMARY KEY,
    domain_uuid UUID,
    domain_name VARCHAR,
    file_name VARCHAR,
    file_date VARCHAR
);
CREATE TABLE IF NOT EXISTS domain_content(
    file_uuid UUID NOT NULL,
    domain_uuid VARCHAR NOT NULL,
    sentences VARCHAR,
    sentence_order_number INT,
    embeddings float []
);