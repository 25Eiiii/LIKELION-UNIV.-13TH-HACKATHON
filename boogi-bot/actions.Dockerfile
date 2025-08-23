FROM rasa/rasa-sdk:3.6.2

USER root

COPY requirements-actions.txt /tmp/req.txt
RUN [ -f /tmp/req.txt ] && python -m pip install --no-cache-dir -r /tmp/req.txt || true

USER 1001
WORKDIR /app

ENTRYPOINT ["python","-m","rasa_sdk.endpoint"]
CMD ["--actions","actions","--port","5055","--debug"]

