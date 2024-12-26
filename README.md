# Community Board Monorepo

- [Server README](/server/README.md)
- [Client README](/client/README.md)
- [Some screenshots](/docs/screenshots.md)

## To run it locally

- Start backend server on prod mode and database processes with:
```bash
    $ cd server && docker compose -f docker-compose.yml up
```
- Start frontend server on dev mode with:
```bash
    $ yarn run dev:client
```

---

## This was before using docker
### Need this installed
- MySQL: a version equal or compatible with [8.0.33](https://dev.mysql.com/doc/relnotes/mysql/8.0/en/news-8-0-33.html).

### Then follow this steps
0. Once MySQL is installed and configured you might need to start its service. To achieve that there's multiple methods depending on what operating system are you on.
    - On Windows you can do:
    ```bash
        $ net.exe start <MySQL Service Name>
    ```
    - On Linux maybe you could use `systemctl` or `service`.
1. Clone this repository.
```bash
    $ git clone https://github.com/CrgioYalux/community-board
```
2. Install its dependencies with some package manager. I use [Yarn](https://yarnpkg.com/).
```bash
    $ yarn install
```
3. Set the database following the [server requirements](/server/README.md).
4. That should be it. You can now start the project by running:
```bash
    $ yarn run dev:client           # inits the client in development mode
    $ yarn run dev:server:logs      # inits the server in development (+ all logs) mode
```
There's more commands for starting and building the project in the monorepo's `package.json` file.
