#!/bin/sh
# Rebuilds the Thiago Herrera avatar from Business_Male_02 + the reference photo (build/thiago/foto.png).
# usage (from the office3d folder): sh tools/thiago/build.sh [FULL=1.0] [BUILD=1.18]
set -e
python3 tools/thiago/step1.py     # landmarks on the avatar render and on the photo
python3 tools/thiago/step2.py     # skin tone + first projection (also writes the per-texel maps the next step needs)
python3 tools/thiago/step3.py     # final head texture: projection, beard continuation, seams
python3 tools/thiago/step4.py "${1:-1.0}" "${2:-1.18}"   # head proportions, neck, build
python3 tools/thiago/step5.py     # body texture and the pack entry av/Thiago_Herrera
