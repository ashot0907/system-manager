#!/bin/bash

# Перейти сначала в каталог 'src'
cd src || { echo "Каталог 'src' не найден"; exit 1; }

# Получить IP-адрес системы (скорректируй интерфейс, если нужно)
IP_ADDRESS=$(ifconfig en0 | grep 'inet ' | awk '{print $2}')

# Задать каталог, где находятся файлы (можешь изменить это на конкретный каталог)
DIRECTORY="."

# Найти и заменить 'localhost' на IP-адрес системы во всех файлах
find "$DIRECTORY" -type f -exec bash -c 'IP_ADDRESS="$1"; sed -i.bak "s/localhost/$IP_ADDRESS/g" "$2"' _ "$IP_ADDRESS" {} \;

# Удалить файлы с расширением .bak, созданные командой sed (резервные копии)
find "$DIRECTORY" -name "*.bak" -type f -delete

echo "Все экземпляры 'localhost' были заменены на $IP_ADDRESS в каталоге $DIRECTORY и его подкаталогах."
