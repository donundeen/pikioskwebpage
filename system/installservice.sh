#!/bin/bash

cp ~/pikioskwebpage/system/units/pikioskwebpage.service /lib/systemd/user/
systemctl daemon-reload
systemctl --user enable pikioskwebpage.service 