#!/bin/bash

cp ~/wecanmusic/server/units/pikioskwebpage.service /lib/systemd/user/
systemctl daemon-reload
systemctl --user enable pikioskwebpage.service 