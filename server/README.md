# Community Board Server

#### ER Diagram  
![ER Diagram](/server/docs/images/ERDiagram.png)

### Required
1. Create the database for this project. For this there's two files in `/server/docs/` that you will have to run as scripts in MySQL Workbench. First, the one for creating the tables, and second, the one for creating the views.
2. With the database credentials, create a `.env` file in `/server/` with the following:
```
DB_HOST="server_name"
DB_PORT=server_port
DB_USER="user_name"
DB_PASS="user_password"
DB_NAME="database_name"
```
