#!/bin/bash

# Перейти в каталог 'src'
cd src || { echo "Каталог 'src' не найден"; exit 1; }

# Получить IP-адрес системы, используя ip вместо ifconfig, который есть на всех современных Linux-системах
IP_ADDRESS=$(ip addr show $(ip route | grep '^default' | awk '{print $5}') | grep 'inet ' | awk '{print $2}' | cut -d/ -f1)

# Задать каталог, где находятся файлы (можешь изменить на конкретный каталог)
DIRECTORY="."

# Найти и заменить 'localhost' на IP-адрес системы во всех файлах
find "$DIRECTORY" -type f -exec bash -c 'IP_ADDRESS="$1"; sed -i.bak "s/localhost/$IP_ADDRESS/g" "$2"' _ "$IP_ADDRESS" {} \;

# Удалить файлы с расширением .bak, созданные командой sed (резервные копии)
find "$DIRECTORY" -name "*.bak" -type f -delete

echo "Все экземпляры 'localhost' были заменены на $IP_ADDRESS в каталоге $DIRECTORY и его подкаталогах."
