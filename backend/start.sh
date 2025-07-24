#!/bin/bash

# Upgrade pip
pip install --upgrade pip

# Install base dependencies
pip install -r requirements.txt

# Install dlib and face-recognition using prebuilt wheel URLs
pip install https://github.com/ageitgey/face_recognition/releases/download/v1.3.0/face_recognition-1.3.0-py2.py3-none-any.whl
pip install https://github.com/RPi-Distro/dlib/releases/download/v19.22.99/dlib-19.22.99-cp310-cp310-manylinux2014_x86_64.whl

# Start the app
python app.py
