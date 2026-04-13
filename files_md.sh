#!/bin/bash

OUTPUT_FILE="code.txt"

# Clean previous output
> "$OUTPUT_FILE"

# Directories to include ONLY
INCLUDE_DIRS=("backend" "frontend")

# Directories/files to exclude
EXCLUDES=(
    "__pycache__"
    "node_modules"
    ".git"
    ".venv"
    "venv"
    "dist"
    "build"
    ".DS_Store"
)

# Check if file is text
is_text_file() {
    file "$1" | grep -q "text"
}

# Check if path should be excluded
should_exclude() {
    local path="$1"
    for excl in "${EXCLUDES[@]}"; do
        if [[ "$path" == *"$excl"* ]]; then
            return 0
        fi
    done
    return 1
}

# Normalize path to Windows-style (backslashes)
normalize_path() {
    echo "$1" | sed 's|^\./||' | sed 's|/|\\|g'
}

# Print file content in required format
print_file() {
    local file="$1"

    if should_exclude "$file"; then
        return
    fi

    if is_text_file "$file"; then
        local formatted_path
        formatted_path=$(normalize_path "$file")

        {
            echo "================="
            echo "$formatted_path"
            echo "================="
            echo ""
            cat "$file"
            echo ""
            echo ""
        } >> "$OUTPUT_FILE"
    fi
}

# Traverse only backend and frontend
for dir in "${INCLUDE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        find "$dir" -type f | while read file; do
            print_file "$file"
        done
    fi
done

echo "✅ code.txt generated with backend + frontend only"