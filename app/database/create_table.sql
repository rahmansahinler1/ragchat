CREATE TABLE IF NOT EXISTS domain_info(
    domian_uuid UUID PRIMARY KEY,
    domain_name VARCHAR NOT NULL,
    pdf_name VARCHAR,
    pdf_date VARCHAR,
    page_sentences int []
);
CREATE TABLE IF NOT EXISTS domain_content(
    domain_uuid UUID NOT NULL,
    domain_name VARCHAR NOT NULL,
    sentences VARCHAR,
    embeddings float []
);