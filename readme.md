# Novum Zon Systeem

Dit project, samen met https://github.com/Wqrld/solarsysteem maken dat je je sunmaster omvormer kan uitlezen via een webpagina.

## Bestanden

index.js bevat de webserver zelf.
static bevat de javascript libraries en fotos.
views bevat de frontend van de pagina.

config.json bevat alle configuratie waardes.
ecosystem.config.js bevat de configuratie voor pm2, mocht je dit willen gebruiken

## Installatie
```
Benodigdheden:
RS484 > RS232 adapter
rj45 kabel
raspberry pi (3B is aangeraden, andere versies moeten ook werken)
VPS (overal te krijgen voor een paar euro per maand. Kijk bijvoorbeeld naar transip of hetzner)

Installatie instructies voor de VPS als root gebruiker (mogelijk moet je eerst sudo -i typen):
# Maak MariaDB klaar
apt -y install software-properties-common curl apt-transport-https ca-certificates gnupg
curl -sS https://downloads.mariadb.com/MariaDB/mariadb_repo_setup | sudo bash
# Update repositories list
apt update
# Add universe repository if you are on Ubuntu 18.04
apt-add-repository universe
# Install Dependencies
apt -y install mariadb-server git
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
apt -y install nodejs make gcc g++


login in je mysql database en maak een gebruiker aan:
mysql -e “create database zon;”
mysql -e “create user ‘zon’@’127.0.0.1’ IDENTIFIED BY ‘maak hier een lang wachtwoord van’;”
mysql -e “grant all privileges on zon.* to ‘zon’@’127.0.0.1’;”

Installeer het programma:
cd /srv
git clone https://github.com/Wqrld/solarWEB.git
cd /srv/solarWEB
npm install
npm install pm2 -g
cp config.example.json config.json

pas de config.json aan met de goede logins die je net in de mysql stap hebt aangemaakt (nano config.json):

en start als laatste je applicatie:
pm2 start ecosystem.config.js
pm2 startup
pm2 save
Je kan checken of hij werkt met:
pm2 logs solarsystem

Je kan nog kiezen om hier een apache of nginx reverse proxy voor te zetten zodat de pagina te bezoeken is met https. Vaak is dit ook nodig als je hem wil embedden in een https site. Een tutorial daarvoor vind je hier: https://www.scaleway.com/en/docs/how-to-configure-nginx-reverse-proxy/#:~:text=Nginx%20HTTPS%20Reverse%20Proxy%20Overview,response%20back%20to%20the%20client. 

Het nodejs programma gebruikt standaard poort 8608

Installatie op de Pi
Ik ga er hier vanuit dat je gebruikmaakt van de raspbian OS:
https://www.raspberrypi.org/software/ 
Andere operating systems gebaseerd op debian zouden ook moeten werken.
apt install -y git
cd /srv
git clone https://github.com/Wqrld/solarsysteem.git 
cd solarsysteem 
cp config.example.json config.json
pas de config.json aan met de juiste api key
Vervolgens kan je dit testen met:
python3 serplot.py

Als dit werkt kan je er een service van maken zodat deze on startup elke 30 seconden loopt:

cat > /etc/systemd/system/solar.service <<- 'EOF'
[Unit]
Description=Solar

[Service]
User=root
WorkingDirectory=/srv/solarsysteem
LimitNOFILE=4096
ExecStart=bash runscript.sh
Restart=on-failure
StartLimitInterval=600
[Install]

WantedBy=multi-user.target

EOF
systemctl enable --now solar


Als het goed is stuurt de Pi nu elke 30 seconden de data naar je webserver!

```

## Licence MIT, maak een github issue aan bij vragen.