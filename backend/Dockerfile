FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    wget \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6

# Install official CMake (adjust version as needed)
RUN wget https://github.com/Kitware/CMake/releases/download/v3.27.4/cmake-3.27.4-linux-x86_64.sh \
    && chmod +x cmake-3.27.4-linux-x86_64.sh \
    && ./cmake-3.27.4-linux-x86_64.sh --skip-license --prefix=/usr/local \
    && rm cmake-3.27.4-linux-x86_64.sh

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

RUN pip install face-recognition==1.3.0

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
