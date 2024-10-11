#!/bin/bash
# npm installs
chmod +x install-webos-npm.sh
./install-webos-npm.sh

# Make webos-ip-setup.sh executable and run it
chmod +x webos-ip-setup.sh
./webos-ip-setup.sh

# Make setup-webos.sh executable and run it
chmod +x setup-webos.sh
./setup-webos.sh

# Make webos.sh executable and run it
chmod +x webos.sh
./webos.sh

echo "IF not started yet run webos-start!"
