#!/bin/bash

pip install --upgrade pip
pip install -r requirements.txt

# Install face-recognition using normal pip (which includes dlib)
pip install face-recognition==1.3.0

python app.py
