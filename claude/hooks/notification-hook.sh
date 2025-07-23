#!/bin/bash

json_input=$(cat)

message=$(echo "$json_input" | jq -r '.message')

afplay ~/.claude/sounds/menu2.wav &

osascript -e "display notification \"$message\" with title \"clod sez\""