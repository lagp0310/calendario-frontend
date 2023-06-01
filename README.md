# Frontend Calendario.

## Sin usar Docker.

En la raíz del proyecto, ejecutamos:

`npm install`

Una vez instaladas las dependencias, ejecutamos el proyecto en development con:

`npm run dev`

## Usando Docker.

En la raíz del proyecto, ejecutamos:

`docker-compose up --build -d`

Luego, nos conectamos al contenedor con:

`docker exec -it calendario_frontend /bin/sh`

Dentro de la terminal del contenedor de Docker, ejecutamos:

`npm i && npm run dev`

Luego de instalar las dependencias, aparecerá el enlace a la app en [http://localhost:8000](http://localhost:8000).
