import axios from "axios";

const service = axios.create({
  baseURL: import.meta.env.VITE_URL_PLEX,
});

const apiKeyPLEX = import.meta.env.VITE_APIKEY_PLEX || "";

service.interceptors.request.use(
  (response) => response,
  (err) => Promise.reject(err.response.data)
);

function paramsKey() {
  return {
    "X-Plex-Token": apiKeyPLEX,
  };
}

function mediaID(media) {
  switch (media) {
    case "movie":
      return 18;
    case "tv":
      return 10; // 11 Anime, 12 Animación Infantil y 15 Documentales
    default:
      break;
  }
  return {
    "X-Plex-Token": apiKeyPLEX,
  };
}

// . GET ALL MOVIES
export async function getPlexAllMovies() {
  try {
    const response = await service.get("/plex", {
      params: paramsKey(),
    });
    return response.data.MediaContainer.Metadata;
  } catch (err) {
    console.error("Error Plex All Movies:", err);
    return {};
  }
}

// . GET MOVIE DETAILS
export async function getPlexMovie(media, OriginalTitle, imdb_id, id) {
  try {
    const response = await service.get(
      `sections/${mediaID(
        media
      )}/all?X-Plex-Token=${apiKeyPLEX}&title=${OriginalTitle}`
    );
    const results =
      response.data.MediaContainer && response.data.MediaContainer.Metadata
        ? response.data.MediaContainer.Metadata
        : null;
    if (results) {
      const verifySameMedia = results.map((i) => i.ratingKey);
      const resultFinal = await Promise.all(
        verifySameMedia.map((i) => {
          return service.get(`metadata/${i}?X-Plex-Token=${apiKeyPLEX}`);
        })
      );
      if (resultFinal) {
        const isSameMedia =
          resultFinal &&
          resultFinal[0] &&
          resultFinal[0].data &&
          resultFinal[0].data.MediaContainer &&
          resultFinal[0].data.MediaContainer.Metadata[0] &&
          resultFinal[0].data.MediaContainer.Metadata[0].Guid.map((mediaId) => {
            const partsString = mediaId.id.split("://");
            if (imdb_id) {
              return partsString[0] === "imdb" && partsString[1] === imdb_id;
            } else {
              return partsString[0] === "tmdb" && partsString[1] === `${id}`;
            }
          }).filter((f) => f === true).length > 0;
        return isSameMedia;
      }
    } else {
      return false;
    }
  } catch (err) {
    console.error("Error Plex Details Movie:", err);
    return {};
  }
}

// < FUTURO
/*
 -AÑADIR API DE UN CANAL DE TELEGRAM
1 - Crear un bot de Telegram: Ve a Telegram y busca el bot llamado "@BotFather". Sigue las instrucciones para crear un nuevo bot. Obtendrás un token que usarás más adelante.
2 - Agregar el bot al canal: Agrega el bot que creaste como administrador del canal. Esto le dará acceso al contenido del canal.
3 - Obtener el ID del canal: Para que el bot pueda acceder al contenido del canal, necesitas obtener el ID del canal. Puedes hacerlo utilizando herramientas en línea como "get_id_bot".
4 - Desarrollar la página web: Puedes usar tecnologías como HTML, CSS y JavaScript para desarrollar tu página web. Para interactuar con el bot de Telegram y obtener el contenido del canal, puedes usar el Bot API de Telegram.
5 - Usar el Bot API de Telegram en tu página web: Utiliza el token del bot y el ID del canal para enviar solicitudes al Bot API de Telegram y obtener el contenido del canal. Puedes usar bibliotecas como node-telegram-bot-api si estás utilizando Node.js, o simplemente hacer solicitudes HTTP directas si estás utilizando JavaScript en el navegador.
6 - Mostrar el contenido en tu página web: Una vez que obtengas el contenido del canal a través del Bot API de Telegram, puedes mostrarlo en tu página web como desees.
Recuerda tener en cuenta la política de privacidad de Telegram y obtener el consentimiento adecuado de los usuarios antes de mostrar su contenido en tu página web.
*/
