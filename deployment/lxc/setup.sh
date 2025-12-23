#!/bin/bash

# Skrypt instalacyjny dla kontenera LXC (Debian/Ubuntu)
# Uruchom ten skrypt WEWNĄTRZ kontenera jako root

set -e

APP_DIR="/var/www/home-website"

echo "🚀 Rozpoczynanie instalacji..."

# 1. Aktualizacja systemu i instalacja zależności
echo "📦 Instalowanie zależności systemowych..."
apt-get update
apt-get install -y curl git nginx gnupg

# 2. Instalacja Node.js (wersja LTS)
if ! command -v node &> /dev/null; then
    echo "🟢 Instalowanie Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "✅ Node.js jest już zainstalowany."
fi

# 3. Instalacja PM2 (do zarządzania procesem Node.js)
if ! command -v pm2 &> /dev/null; then
    echo "Process Manager instalowanie..."
    npm install -g pm2
else
    echo "✅ PM2 jest już zainstalowany."
fi

# 4. Przygotowanie katalogu aplikacji
if [ ! -d "$APP_DIR" ]; then
    echo "📂 Tworzenie katalogu aplikacji: $APP_DIR"
    mkdir -p $APP_DIR
    # Tutaj zakładamy, że pliki zostaną skopiowane ręcznie lub przez git clone
    # Jeśli to repozytorium git, można odkomentować:
    # git clone <URL_REPOZYTORIUM> $APP_DIR
else
    echo "📂 Katalog aplikacji już istnieje."
fi

# UWAGA: W tym momencie użytkownik musi skopiować pliki aplikacji do $APP_DIR
# Można to zrobić np. przez scp lub rsync z hosta

echo "⚠️  Upewnij się, że pliki aplikacji znajdują się w $APP_DIR"
echo "   (frontend w $APP_DIR/frontend, backend w $APP_DIR/backend)"

# 5. Konfiguracja Backend
echo "⚙️  Konfiguracja Backendu..."
cd $APP_DIR/backend
if [ ! -f .env ]; then
    echo "📝 Tworzenie przykładowego pliku .env..."
    cat > .env << EOL
PORT=3000
NODE_ENV=production
SMTP_HOST=mail.twojadomena.pl
SMTP_PORT=587
SMTP_USER=kontakt@twojadomena.pl
SMTP_PASS=zmien_mnie
EMAIL_TO=kontakt@twojadomena.pl
EOL
    echo "⚠️  Pamiętaj o edycji pliku .env!"
fi

echo "📦 Instalowanie zależności npm..."
npm install --production

# 6. Uruchomienie Backendu przez PM2
echo "🚀 Uruchamianie backendu..."
pm2 start server.js --name "home-website-backend" || pm2 restart "home-website-backend"
pm2 save
pm2 startup | tail -n 1 | bash || true # Automatyczny start po restarcie

# 7. Konfiguracja Nginx
echo "🌐 Konfiguracja Nginx..."
cp ../deployment/lxc/nginx.conf /etc/nginx/sites-available/home-website
ln -sf /etc/nginx/sites-available/home-website /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test konfiguracji i restart Nginx
nginx -t
systemctl restart nginx

echo "✅ Instalacja zakończona!"
echo "👉 Aplikacja powinna być dostępna pod adresem IP tego kontenera."
echo "👉 Pamiętaj o skonfigurowaniu zewnętrznego Proxy (np. na hoście), aby kierowało ruch do tego kontenera."
