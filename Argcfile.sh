#!/usr/bin/env bash
set -e

# @meta dotenv
FAMILIAR_DIR="$HOME/.familiar"
OBLIVION_DIR="$FAMILIAR_DIR/oblivion"
OBLIVION_PATH="$OBLIVION_DIR/Argcfile.sh"

# @cmd feed for your thoughts
# @arg args~[?`_choice_oblivion_args`] The oblivion command and arguments
oblivion() {
    bash "$OBLIVION_PATH" "$@"
}

_choice_oblivion_args() {
    if [[ "$ARGC_COMPGEN" -eq 1 ]]; then
        args=( "${argc__positionals[@]}" )
        args[-1]="$ARGC_LAST_ARG"
        argc --argc-compgen generic "$OBLIVION_PATH" oblivion "${args[@]}"
    else
        :;
    fi
}

# See more details at https://github.com/sigoden/argc
eval "$(argc --argc-eval "$0" "$@")"
