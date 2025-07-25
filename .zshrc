fpath=($HOME/.docker/completions $fpath)
autoload -Uz compinit
compinit
zstyle ':completion:*' menu yes select
zstyle ':completion:*' matcher-list 'm:{a-zA-Z}={A-Za-z}' # Case-insensitive completion
[[ -n ${terminfo[kcbt]} ]] && bindkey "${terminfo[kcbt]}" reverse-menu-complete  # ⇧Tab ←

# prompt 
setopt PROMPT_SUBST
local user_prompt_symbol="❯" 
local root_prompt_symbol="#"
PROMPT='%F{blue}%~ ${vcs_info_msg_0_}%(?.%F{083}.%F{197})%(!.${root_prompt_symbol}.${user_prompt_symbol})%f '

export PATH="/opt/homebrew/bin:$PATH"
export PATH="$HOME/.bun/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"

# Python configuration - use uv managed Python
eval "$(uv generate-shell-completion zsh)"
export LLM_ROOT_DIR="$HOME/aichat/functions"

if [[ -f "$HOME/.claude/local/claude" ]]; then
  alias claude="$HOME/.claude/local/claude"
fi

export AICHAT_DIR="$HOME/Library/Application Support/aichat"
export FAMILIAR_DIR="$AICHAT_DIR/functions"

source "$HOME/.aliases"
