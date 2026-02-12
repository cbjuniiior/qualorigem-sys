# Expor a porta 5432 (PostgreSQL) só para o seu IP

Para o MCP self-hosted Supabase conectar ao banco a partir da sua máquina, o PostgreSQL precisa estar acessível na porta 5432. O ideal é liberar essa porta **apenas para o seu IP**, reduzindo risco de acesso indevido.

**Alternativa sem abrir a porta na internet:** use um [túnel SSH](TUNEL_SSH_POSTGRES_MCP.md) da sua máquina até a VPS e apontando o `db-url` do MCP para `localhost` no túnel.

---

## 1. Descobrir seu IP público

No seu PC (de onde o Cursor roda):

- Acesse [https://whatismyip.com](https://whatismyip.com) ou [https://ifconfig.me](https://ifconfig.me)
- Anote o **IPv4** (ex.: `189.40.xxx.xxx`)

**Se usar VPN:** conecte na VPN e acesse o site de novo; use o IP que aparecer (assim só quem estiver na mesma VPN acessa).

---

## 2. No servidor (VPS)

Você precisa fazer **duas** coisas: o PostgreSQL estar escutando/exposto na 5432 e o firewall permitir só o seu IP.

### 2.1 Garantir que o PostgreSQL está exposto

- **EasyPanel / Docker:** o serviço do banco (ex.: `db`) precisa publicar a porta `5432` no host ou em um proxy.
  - No EasyPanel: no app do Supabase, verifique o serviço do banco (Postgres) e se há “Published port” ou “Host port” 5432.
  - Se o banco só estiver na rede interna do Docker, crie um “publish” da porta 5432 para o host (ex.: 0.0.0.0:5432 → 5432 no container).
- **Supabase “oficial” self-hosted (docker-compose):** em `docker-compose.yml`, no serviço `db`, verifique se há algo como:
  ```yaml
  ports:
    - "5432:5432"
  ```
  Se não houver, adicione e suba de novo o stack.

Depois disso, no servidor (SSH), teste:

```bash
sudo ss -tlnp | grep 5432
# ou
sudo netstat -tlnp | grep 5432
```

Deve aparecer algo escutando em `0.0.0.0:5432` ou `:::5432`.

### 2.2 Firewall: liberar 5432 só para o seu IP

No **servidor** (acesso SSH), use um dos métodos abaixo.

#### Opção A – UFW (recomendado em Ubuntu/Debian)

```bash
# Ver estado atual
sudo ufw status

# Liberar SSH para não perder acesso (se ainda não estiver)
sudo ufw allow 22/tcp

# Liberar 5432 APENAS para o SEU IP (troque pelo seu IPv4)
sudo ufw allow from 189.40.XXX.XXX to any port 5432 proto tcp

# Ativar o firewall (se ainda estiver inactive)
sudo ufw enable

# Conferir regras
sudo ufw status numbered
```

Troque `189.40.XXX.XXX` pelo IP que você anotou. Para vários IPs (ex.: casa e escritório), repita o `ufw allow from ... port 5432` para cada um.

#### Opção B – iptables (qualquer Linux)

```bash
# Liberar 5432 só do seu IP (troque pelo seu IP)
sudo iptables -A INPUT -p tcp -s 189.40.XXX.XXX --dport 5432 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5432 -j DROP

# Salvar (Debian/Ubuntu)
sudo netfilter-persistent save
# ou (CentOS/RHEL)
sudo service iptables save
```

(Se já houver política padrão DROP, a segunda linha pode ser desnecessária; depende do restante das regras.)

#### Opção C – Firewall do provedor (AWS, GCP, Azure, etc.)

- Abra o painel do provedor (ex.: Security Groups, VPC firewall, NSG).
- No grupo/regra associado à VPS:
  - Adicione **entrada** (inbound):
    - Porta: **5432**
    - Protocolo: **TCP**
    - Origem: **seu IP** (ex.: 189.40.xxx.xxx/32) ou o range da sua VPN.
- Salve e aguarde alguns segundos.

---

## 3. Testar conexão do seu PC

No **seu computador** (PowerShell ou terminal):

```powershell
Test-NetConnection -ComputerName vivasolucoes-db-qualaorigem.rzejto.easypanel.host -Port 5432
```

Ou, se tiver `psql` ou outro cliente na máquina:

```bash
psql "postgresql://postgres:SUA_SENHA@vivasolucoes-db-qualaorigem.rzejto.easypanel.host:5432/postgres" -c "SELECT 1"
```

(No Windows pode ser preciso usar o host que resolve para o IP da VPS, por exemplo o mesmo que está no `mcp.json`.)

Se conectar, o MCP deve conseguir usar o `db-url` do `.cursor/mcp.json`.

---

## 4. Atualizar o MCP (se o host for diferente)

No `.cursor/mcp.json`, o `--db-url` hoje usa:

`db.vivasolucoes-db-qualaorigem.rzejto.easypanel.host`

Se a porta 5432 estiver exposta **no host principal** (e não no subdomínio `db.`), use o mesmo host da API na URL do banco, por exemplo:

```text
postgresql://postgres:SENHA@vivasolucoes-db-qualaorigem.rzejto.easypanel.host:5432/postgres
```

Se o EasyPanel expuser a 5432 em outro host/porta, use esse host/porta no `db-url`. O importante é que, do seu PC, `Test-NetConnection` (ou `psql`) consiga conectar nesse host e porta.

---

## 5. Segurança rápida

- Use **senha forte** no usuário `postgres` (já configurada no `.env` do Supabase).
- Mantenha **apenas seu IP** (ou da VPN) na regra da 5432.
- Se o seu IP residencial mudar (reinício do roteador), atualize a regra de firewall com o novo IP ou use VPN com IP fixo.
- Não exponha 5432 para `0.0.0.0/0` (internet inteira).

Com a porta 5432 acessível só do seu IP (ou VPN), o MCP consegue listar tabelas e usar as ferramentas que dependem de conexão direta ao banco.
