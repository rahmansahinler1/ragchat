from configparser import ConfigParser

def config(filename="app/database/database.ini",section="postgresql"):
    # Create a parser 
    parser = ConfigParser()
    # Read config file 'database.ini'
    parser.read(filename)
    db_config= {}
    # Extract info to dict.
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            db_config[param[0]] = param[1]
    else:
        raise Exception(f"Section {section} is not found in {filename} file.")
    return db_config