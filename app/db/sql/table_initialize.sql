CREATE TABLE IF NOT EXISTS user_info (
    user_id UUID PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL,
    user_surname VARCHAR(50) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_email VARCHAR(100) UNIQUE,
    user_type VARCHAR(20),
    is_active BOOLEAN DEFAULT FALSE,
    user_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS domain_info (
    user_id UUID NOT NULL,
    domain_id UUID PRIMARY KEY,
    domain_name VARCHAR(30) NOT NULL,
    domain_number INTEGER,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id)
);

CREATE TABLE IF NOT EXISTS file_info (
    user_id UUID NOT NULL,
    domain_id UUID NOT NULL,
    file_id UUID PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_modified_date DATE,
    file_upload_date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id),
    FOREIGN KEY (domain_id) REFERENCES domain_info(domain_id)
);

CREATE TABLE IF NOT EXISTS file_content (
    content_id SERIAL PRIMARY KEY,
    file_id UUID NOT NULL,
    page_number INTEGER,
    sentence TEXT NOT NULL,
    sentence_order INTEGER,
    embedding BYTEA,
    FOREIGN KEY (file_id) REFERENCES file_info(file_id)
);

CREATE TABLE IF NOT EXISTS session_info (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    session_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id)
);
