FROM python:3.11-slim

WORKDIR /app

# Copia o requirements.txt (agora sem o "backend/" porque já estamos em /app)
COPY requirements.txt .

# Instala as dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o código
COPY . .

# Comando para rodar a aplicação
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]