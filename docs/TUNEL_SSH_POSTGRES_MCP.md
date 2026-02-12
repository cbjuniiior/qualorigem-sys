# Usar túnel SSH para o MCP acessar o Postgres

Com um túnel SSH, a sua máquina “enxerga” o PostgreSQL da VPS como se estivesse em **localhost**. Não é preciso abrir a porta 5432 na internet; só é necessário conseguir acessar a VPS por SSH.

---

## 1. Pré-requisitos

- **SSH na VPS:** você já consegue entrar com `ssh root@31.97.17.190`.
- **PostgreSQL rodando na VPS:** no host ou em um container com a porta 5432 mapeada no host (ex.: `127.0.0.1:5432` ou `0.0.0.0:5432` no servidor).

---

## 2. Onde o Postgres escuta na VPS

No **servidor** (após fazer SSH), confira se a 5432 está em uso:

```bash
sudo ss -tlnp | grep 5432
# ou
sudo netstat -tlnp | grep 5432
```

- Se aparecer algo como `0.0.0.0:5432` ou `127.0.0.1:5432`, use **localhost** no túnel (passo seguinte).
- Se a 5432 **não** aparecer no host, o Postgres pode estar só dentro da rede Docker. Aí é preciso encaminhar para o **container**. Exemplo (nome do container pode ser `db` ou outro):

  ```bash
  docker ps --format "{{.Names}}"
  # Se o container do Postgres for "db":
  docker port db 5432
  ```

  Se o container não publica a porta no host, use o IP do container na rede Docker:

  ```bash
  docker inspect db --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'
  ```

  Anote esse IP (ex.: `172.18.0.2`) para usar no lugar de `localhost` no túnel (veja passo 4).

---

## 3. Criar o túnel SSH (no seu PC – Windows)

Abra **PowerShell** ou **Windows Terminal** e deixe este comando rodando (não feche a janela):

```powershell
ssh -L 15432:localhost:5432 root@31.97.17.190
```

- **root@31.97.17.190** é o seu acesso SSH à VPS.
- **15432** é a porta **local** no seu PC; o Postgres da VPS continua na 5432 lá. Usar 15432 evita conflito com um Postgres instalado no Windows.

Faça login quando o SSH pedir (senha ou chave). Enquanto essa sessão estiver aberta, o túnel está ativo.

**Manter o túnel em segundo plano (opcional):**

```powershell
ssh -f -N -L 15432:localhost:5432 root@31.97.17.190
```

- `-f` = rodar em background  
- `-N` = não executar comando remoto (só túnel)

Para encerrar um túnel em background: no Gerenciador de Tarefas, finalize o processo `ssh` ou use outra janela e mate o processo pelo PID.

---

## 4. Se o Postgres estiver só no container (sem 5432 no host)

Use o **IP do container** no túnel (no seu PC):

```powershell
ssh -L 15432:172.18.0.2:5432 root@31.97.17.190
```

Substitua `172.18.0.2` pelo IP que você obteve com `docker inspect db ...`. O primeiro número é a porta **local** (15432), o segundo é **destino na VPS** (IP do container:5432).

---

## 5. Configurar o MCP para usar o túnel

Enquanto o túnel estiver ativo, o banco fica acessível no seu PC em:

- Host: **localhost**
- Porta: **15432** (a que você usou em `-L 15432:...`)

No **`.cursor/mcp.json`**, no `--db-url`, use:

```json
"postgresql://postgres:SUA_SENHA_AQUI@localhost:15432/postgres"
```

Substitua `SUA_SENHA_AQUI` pela senha real do usuário `postgres` (a mesma do `POSTGRES_PASSWORD` do Supabase na VPS).

Exemplo de bloco completo no `mcp.json`:

```json
{
  "mcpServers": {
    "selfhosted-supabase": {
      "command": "node",
      "args": [
        "C:/Users/Cassio/Documents/Projetos IA/qualorigem-sys/.mcp-servers/selfhosted-supabase-mcp/dist/index.js",
        "--url",
        "https://vivasolucoes-db-qualaorigem.rzejto.easypanel.host",
        "--anon-key",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "--service-key",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "--db-url",
        "postgresql://postgres:SUA_SENHA@localhost:15432/postgres",
        "--jwt-secret",
        "super-secret-jwt-token-with-at-least-32-characters-long"
      ]
    }
  }
}
```

Salve o arquivo e **reinicie o Cursor** (ou recarregue o MCP) para ele usar o novo `db-url`.

---

## 6. Ordem de uso no dia a dia

1. **Antes de usar o MCP:** abra o túnel (passo 3 ou 4).
2. Use o Cursor normalmente; o MCP falará com `localhost:15432`, que o SSH encaminha para o Postgres na VPS.
3. **Quando terminar:** feche a janela do SSH ou mate o processo para derrubar o túnel.

Assim você não expõe a 5432 na internet e ainda consegue listar tabelas e usar as ferramentas do MCP que precisam de acesso direto ao banco.
