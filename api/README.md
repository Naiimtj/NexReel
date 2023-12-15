## Filtrado de Datos en la API

En esta API, el filtrado de datos se realiza principalmente en el controlador asociado con la obtención de información desde el servicio de Plex. A continuación, se describe cómo se implementa este proceso:

### Ubicación en el Código

El filtrado de datos ocurre en el archivo `plex.controller.js`, específicamente en la función `createPlexData()`. Esta función se encarga de recibir los datos del servicio de Plex y filtrarlos para mantener solo la información relevante antes de crear o actualizar los datos en la base de datos.

### Flujo de Filtrado de Datos

Al recibir los datos de Plex, se ejecuta un proceso de filtrado para reducir los datos innecesarios y mantener solo la información relevante:

1. **Obtención de Datos:** Se recibe un conjunto de datos de películas (`moviesResult`) y de programas de televisión (`tvShowsResults`).

2. **Filtrado de Películas (`moviesResult`):** Se mapea cada objeto en `moviesResult` para retener solo las siguientes propiedades: `ratingKey`, `type`, `year`, `originalTitle`, `title`.

3. **Filtrado de Programas de Televisión (`tvShowsResults`):** Se realiza un proceso similar al de películas para mantener las mismas propiedades esenciales.

4. **Uso de Datos Filtrados:** Los datos filtrados (`filteredMoviesResult` y `filteredTvShowsResult`) se utilizan para crear o actualizar los datos relevantes en la base de datos de Plex.

### Ventajas del Filtrado en la API

El filtrado de datos en la API ofrece las siguientes ventajas:

- **Reducción de Ancho de Banda:** Al enviar solo la información esencial al cliente, se reduce el tamaño de las respuestas, mejorando la eficiencia del intercambio de datos.
- **Mejora del Rendimiento:** Al minimizar la cantidad de datos, se optimiza el rendimiento general de la aplicación, especialmente en entornos con restricciones de ancho de banda.
- **Seguridad:** Filtrar datos innecesarios en la API reduce la exposición de información confidencial al enviar solo lo necesario al cliente.

Este proceso de filtrado permite optimizar el intercambio de información entre el servidor y el cliente, mejorando la eficiencia y rendimiento de la aplicación.

