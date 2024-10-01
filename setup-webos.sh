#!/bin/bash

# Start a new bash session
bash <<EOF

# Setup script for webos start command

# Get the path of the script to be run by 'webos start'
SCRIPT_PATH="./webos.sh"

# Check if .bashrc exists, if not create it
if [ ! -f ~/.bashrc ]; then
    touch ~/.bashrc
fi

# Check if the alias already exists to avoid duplicates
if ! grep -q "alias webos-start=" ~/.bashrc; then
    # Add the alias to .bashrc
    echo "alias webos-start='bash $SCRIPT_PATH'" >> ~/.bashrc
    echo "Alias 'webos-start' has been added to .bashrc."
else
    echo "Alias 'webos-start' already exists in .bashrc."
fi

# Reload .bashrc to apply changes (if the script is sourced)
if [ -n "$BASH_SOURCE" ]; then
    source ~/.bashrc
    echo ".bashrc has been reloaded."
else
    echo "Please reload your terminal or run 'source ~/.bashrc' manually."
fi

echo "You can now use 'webos-start' to execute your script."

EOF

bash