# Node-auth

## Host with nextJS / React on a node Server

> In nextJS you can use the api routes for UI -> index.js
> In react you need to host another node server for the UI -> index.js

UI -> index.js : API routes for server in the front-end framework (nextJS)

UI -> public : static files for the front-end framework (nextJS)

---

## Host on a node Server

API -> src : API routes for server in the back-end framework (nodeJS - fastify)

---

## Local https dev server

- Install Caddy server (<https://caddyserver.com/docs/install>)
- `brew install caddy` (for macOS)
- Make `Caddyfile` and set local domain (see code below)
- Go to /etc and open hosts file, set custom domain to 127.0.0.1
- Start caddy server, `caddy run`

> ( nodeauth.dev can be changed in you’re custom local domain )

```js
{
  local_certs
}

nodeauth.dev {
  reverse_proxy 127.0.0.1:3001
}

api.nodeauth.dev {
  reverse_proxy 127.0.0.1:3000
}
```
