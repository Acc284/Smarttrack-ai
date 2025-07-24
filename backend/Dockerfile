FROM continuumio/miniconda3

WORKDIR /app

COPY . .

# Create env with all deps including dlib
RUN conda create -n smarttrack python=3.10 -y \
    && conda run -n smarttrack pip install --upgrade pip \
    && conda run -n smarttrack pip install -r requirements.txt

# Activate env and run app
CMD ["conda", "run", "-n", "smarttrack", "python", "app.py"]
