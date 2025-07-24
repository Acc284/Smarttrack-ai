#!/bin/bash
pip install --upgrade pip
pip install -r requirements.txt
pip install face-recognition==1.3.0 --only-binary :all:
python app.py
