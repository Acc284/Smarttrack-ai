#!/bin/bash
pip install --upgrade pip

# Install all normal packages
pip install -r requirements.txt

# Install face-recognition with binary-only, and models explicitly
pip install face-recognition-models==0.3.0
pip install face-recognition==1.3.0 --only-binary :all:

# Start the Flask app
python app.py
