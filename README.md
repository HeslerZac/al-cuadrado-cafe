# al cuadrado cafe

Sistema web para al cuadrado cafe donde los clientes hacen pedidos por WhatsApp y los montos se muestran en quetzales (Q).

## Stack
- Backend: NestJS + TypeORM + PostgreSQL
- Frontend: React + Vite + Tailwind CSS
- Infra: Docker Compose

## Puertos
- Frontend: [http://localhost:3007](http://localhost:3007)
- Backend: [http://localhost:8007](http://localhost:8007)
- Adminer: [http://localhost:8087](http://localhost:8087)
- DB: localhost:5437

## IA local para WhatsApp

El backend puede responder mensajes usando Ollama local. Instala Ollama en tu maquina y descarga el modelo configurado:

```bash
ollama pull llama3.1
```

Con Docker Compose, el backend llama a Ollama en:

```text
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.1:latest
```

En Linux, si el backend corre en Docker, Ollama debe escuchar fuera de `localhost`.
Configuralo con systemd:

```bash
sudo systemctl edit ollama
```

Agrega:

```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
```

Reinicia Ollama:

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

Para probar el webhook sin WhatsApp Cloud:

```bash
curl -s -X POST http://localhost:8007/whatsapp/webhook \
  -H 'Content-Type: application/json' \
  -d '{"telefono":"50255551234","nombre":"Cliente","mensaje":"Hola, que hamburguesas tienen?"}'
```

Para envio automatico por WhatsApp Cloud API, configura tambien:

```text
WHATSAPP_VERIFY_TOKEN=al_cuadrado_cafe_verify
WHATSAPP_ACCESS_TOKEN=token_de_meta
WHATSAPP_PHONE_NUMBER_ID=id_del_numero
```
