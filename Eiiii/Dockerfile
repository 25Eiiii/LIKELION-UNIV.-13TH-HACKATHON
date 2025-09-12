FROM python:3.11-slim

# Java 런타임 설치 (KoNLPy/Okt용) - Debian trixie에서는 21 사용
RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-21-jre-headless && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# JPype가 JVM 경로를 못 찾는 환경을 대비해 JAVA_HOME 지정
ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

# 작업 디렉토리
WORKDIR /app

# 시스템 패키지 (예: psycopg2 빌드용)
RUN apt-get update && apt-get install -y \
    build-essential libpq-dev curl \
 && rm -rf /var/lib/apt/lists/*

# requirements 복사 & 설치
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# 소스 복사
COPY . /app

# 헬스체크용 
EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "Eiiii.wsgi:application"]
