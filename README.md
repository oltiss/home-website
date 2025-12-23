# Wdrażanie w kontenerze LXC (za Proxy)

Ten przewodnik opisuje, jak uruchomić aplikację w kontenerze LXC (np. Proxmox, LXD), który znajduje się za zewnętrznym proxy (np. Nginx Proxy Manager, HAProxy, Traefik).

## Struktura

- **Host (Proxy)**: Obsługuje SSL (HTTPS) i przekierowuje ruch na port 80 kontenera.
- **Kontener LXC**:
  - **Nginx (Port 80)**: Serwuje pliki statyczne frontendu i przekazuje zapytania `/api` do backendu.
  - **Node.js (Port 3000)**: Backend API.

## Instrukcja krok po kroku

### 1. Przygotowanie kontenera

Utwórz nowy kontener LXC (zalecany Debian 11/12 lub Ubuntu 20.04/22.04).

### 2. Kopiowanie plików

Skopiuj pliki projektu z twojego komputera do kontenera.
Z poziomu hosta (lub twojego komputera):

```bash
# Przykład użycia rsync (zamień IP_KONTENERA na właściwy adres)
rsync -avz --exclude 'node_modules' --exclude '.git' ./ root@IP_KONTENERA:/var/www/home-website
```

### 3. Uruchomienie instalacji

Zaloguj się do kontenera i uruchom skrypt instalacyjny:

```bash
ssh root@IP_KONTENERA
cd /var/www/home-website
chmod +x deployment/lxc/setup.sh
./deployment/lxc/setup.sh
```

### 4. Konfiguracja .env

Edytuj plik `.env` w katalogu `backend`, aby ustawić poprawne dane SMTP:

```bash
nano /var/www/home-website/backend/.env
```

Po edycji zrestartuj backend:

```bash
pm2 restart home-website-backend
```

### 5. Konfiguracja Proxy na Hoście

Na serwerze, który działa jako Proxy (przed kontenerem), skonfiguruj przekierowanie domeny (np. `design-web.pl`) na adres IP kontenera LXC, port 80.

Przykładowa konfiguracja Nginx na Hoście (Proxy):

```nginx
server {
    listen 443 ssl;
    server_name design-web.pl;

    # ... certyfikaty SSL ...

    location / {
        proxy_pass http://IP_KONTENERA:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
