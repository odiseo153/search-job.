# Prompt Para Integrar Ever Jobs En TailorCV

## Rol

Actua como un senior full-stack engineer especializado en Next.js, integraciones seguras entre frontend y APIs externas, y experiencia de producto para apps de carrera profesional.

Tu tarea es integrar una API de busqueda de empleo llamada **Ever Jobs** dentro de una app existente llamada **TailorCV**, hecha en **Next.js**.

El objetivo de producto es agregar una nueva seccion llamada **"Buscar trabajo"** dentro de TailorCV, conectada a una API desplegada externamente. La URL base de esa API debe vivir en una **variable de entorno** para que si en el futuro cambia el hosting, no haya que tocar el codigo.

No quiero una integracion improvisada. Quiero una implementacion robusta, segura, mantenible y alineada con buenas practicas modernas de Next.js.

Si detectas ambiguedades en el codebase de TailorCV, primero inspecciona la estructura real del proyecto y adapta la implementacion al estilo ya existente.

---

## Contexto Del Backend A Integrar

La API a integrar pertenece al proyecto **Ever Jobs**, un agregador de empleos hecho con NestJS.

### Endpoints HTTP reales disponibles

- `GET /health`
- `GET /ping`
- `GET /metrics`
- `POST /api/jobs/search`
- `POST /api/jobs/analyze`
- `POST /graphql`

### Endpoint principal para la funcionalidad de TailorCV

Para la primera version de la seccion "Buscar trabajo", usa principalmente:

- `POST /api/jobs/search`

Opcionalmente, mas adelante se podria usar:

- `POST /api/jobs/analyze`

No es necesario usar GraphQL para la primera integracion si REST cubre el caso.

---

## Objetivo De Producto

Dentro de TailorCV, agrega una seccion **Buscar trabajo** que permita al usuario:

1. escribir un termino de busqueda, por ejemplo:
   - `frontend developer`
   - `software engineer`
   - `designer`
2. indicar una ubicacion opcional, por ejemplo:
   - `Remote`
   - `Madrid`
   - `Santo Domingo`
3. activar o desactivar un filtro de trabajo remoto
4. elegir algunas fuentes seguras y utiles
5. definir cantidad de resultados
6. ver los resultados en una UI limpia y rapida
7. abrir la oferta original en una nueva pestaña
8. ver estados de carga, error y sin resultados correctamente

La experiencia debe sentirse integrada con una app de CV profesional, no como un dashboard tecnico.

---

## Restricciones De Seguridad Y Arquitectura

Estas restricciones son obligatorias.

### 1. No llames la API de Ever Jobs directamente desde el navegador

Debes crear una **capa de servidor en Next.js** para actuar como proxy o backend-for-frontend.

Usa:

- `Route Handlers` en `app/api/...` si TailorCV usa App Router
- o `pages/api/...` si el proyecto aun usa Pages Router

La UI del navegador debe llamar solo a endpoints internos de TailorCV.

### 2. La URL del backend debe estar en variable de entorno

Usa una variable de entorno del lado servidor, por ejemplo:

```env
EVER_JOBS_API_URL=https://tu-hosting-del-api.com
```

Si el backend tiene autenticacion por API key habilitada, usa tambien:

```env
EVER_JOBS_API_KEY=tu_api_key
```

No expongas estos valores al navegador.

### 3. No expongas campos peligrosos del backend al frontend

La API de Ever Jobs soporta muchos campos, pero varios **no deben** estar controlados por el usuario final desde TailorCV.

No permitas que el frontend envie ni configure:

- `auth`
- `proxies`
- `caCert`
- `userAgent`
- `clientIp`
- `rateDelayMin`
- `rateDelayMax`
- `retries`
- `retryDelay`
- `retryBackoff`
- `retryMaxDelay`
- `linkedinCompanyIds`

Si alguno de esos campos es necesario alguna vez, debe ser controlado del lado servidor por developers, no por usuarios.

### 4. Usa una allowlist de fuentes

No dejes que el usuario consulte "todas las fuentes" libremente.

El backend de Ever Jobs, por defecto, puede terminar consultando muchas fuentes externas. Para TailorCV debes usar una allowlist controlada de fuentes seguras, estables y utiles para una UX inicial.

Recomendacion de allowlist inicial:

- `google`
- `indeed`
- `linkedin`
- `remoteok`
- `remotive`
- `arbeitnow`
- `weworkremotely`
- `jobicy`
- `himalayas`
- `themuse`
- `workingnomads`

Si alguna fuente da problemas en produccion, debe poder quitarse facilmente desde configuracion del servidor o desde una constante centralizada.

### 5. No dejes la API key del backend en el cliente

La API key de Ever Jobs, si existe, debe enviarse solo desde el servidor Next.js hacia Ever Jobs.

### 6. Maneja timeouts y errores de red

La seccion de busqueda debe degradar con gracia si el backend externo esta lento, caido o devuelve errores.

### 7. Minimiza datos sensibles

La seccion Buscar trabajo debe enviar solo:

- termino de busqueda
- ubicacion
- remoto si aplica
- resultados deseados
- fuentes permitidas

No mandes datos del CV del usuario al backend de empleos salvo que el producto lo requiera explicitamente.

---

## Contrato Del Endpoint A Usar

### `POST /api/jobs/search`

#### Query params soportados

- `format`: `json` o `csv`
- `paginate`: `true|false`
- `page`
- `page_size`

Para TailorCV usa por defecto:

- `format=json`
- `paginate=true`

#### Body permitido por TailorCV

Usa un subconjunto seguro de `ScraperInputDto`:

```json
{
  "searchTerm": "software engineer",
  "siteType": ["google", "indeed", "remoteok"],
  "location": "Remote",
  "isRemote": true,
  "resultsWanted": 20,
  "country": "USA",
  "descriptionFormat": "markdown"
}
```

#### Campos del backend que existen pero NO deben exponerse en TailorCV

Existen en el DTO del backend, pero no deben salir en la UI ni pasar desde el navegador:

- `googleSearchTerm`
- `easyApply`
- `offset`
- `hoursOld`
- `jobType` si no esta bien soportado en la UI
- `linkedinFetchDescription`
- `auth`
- `proxies`
- `caCert`
- `userAgent`
- `clientIp`
- `enforceAnnualSalary`
- `rateDelayMin`
- `rateDelayMax`
- `companySlug`
- `maxConcurrentCompanies`
- `retries`
- `retryDelay`
- `retryBackoff`
- `retryMaxDelay`

#### Respuesta normal sin paginacion

```json
{
  "count": 12,
  "jobs": [
    {
      "id": "abc",
      "site": "google",
      "title": "Frontend Engineer",
      "companyName": "Example Inc",
      "jobUrl": "https://...",
      "location": {
        "city": "Remote",
        "state": null,
        "country": "USA"
      },
      "description": "...",
      "jobType": ["fulltime"],
      "compensation": {
        "minAmount": 80000,
        "maxAmount": 110000,
        "currency": "USD",
        "interval": "yearly"
      },
      "datePosted": "2026-04-18",
      "emails": [],
      "isRemote": true,
      "companyUrl": "https://...",
      "logoUrl": "https://..."
    }
  ],
  "cached": false
}
```

#### Respuesta paginada

```json
{
  "count": 57,
  "total_pages": 6,
  "current_page": 1,
  "page_size": 10,
  "jobs": [],
  "cached": false,
  "next_page": 2,
  "previous_page": null
}
```

Para TailorCV, esta forma paginada es preferible.

---

## Endpoints De TailorCV Que Debes Crear

Implementa una capa interna en TailorCV.

### Endpoint interno recomendado

Si TailorCV usa App Router:

- `app/api/job-search/route.ts`

Si usa Pages Router:

- `pages/api/job-search.ts`

### Comportamiento del endpoint interno

El endpoint interno debe:

1. validar y sanear el input del cliente
2. aplicar una allowlist de `siteType`
3. establecer defaults seguros
4. construir la llamada a `POST {EVER_JOBS_API_URL}/api/jobs/search?paginate=true&page=1&page_size=...`
5. enviar `x-api-key` al backend solo desde el servidor si `EVER_JOBS_API_KEY` existe
6. transformar y reducir la respuesta si hace falta
7. devolver al frontend solo los datos necesarios

---

## Variables De Entorno Recomendadas En TailorCV

Usa variables del lado servidor.

```env
EVER_JOBS_API_URL=https://jobs-api.example.com
EVER_JOBS_API_KEY=
EVER_JOBS_DEFAULT_COUNTRY=USA
EVER_JOBS_DEFAULT_PAGE_SIZE=10
EVER_JOBS_ALLOWED_SITES=google,indeed,linkedin,remoteok,remotive,arbeitnow,weworkremotely,jobicy,himalayas,themuse,workingnomads
```

Si quieres, puedes derivar la allowlist desde esta env var o mantenerla en una constante interna.

No uses `NEXT_PUBLIC_` para la API key.

---

## UX Esperada En TailorCV

La seccion **Buscar trabajo** debe verse como parte natural del producto TailorCV.

### Requisitos funcionales de UI

- input para `searchTerm`
- input para `location`
- switch o checkbox para `isRemote`
- multiselect o chips para fuentes permitidas
- selector de cantidad de resultados
- boton de buscar
- lista de resultados
- paginacion o boton “cargar mas”

### Tarjeta de resultado recomendada

Cada job card deberia mostrar:

- titulo
- empresa
- ubicacion
- si es remoto
- fuente
- salario si existe
- fecha si existe
- boton `Ver oferta`

Opcional:

- logo
- snippet corto de descripcion

### Estados de UI obligatorios

- idle
- loading
- success
- empty
- error

### Mensajes recomendados

- loading: `Buscando vacantes...`
- empty: `No encontramos vacantes con esos filtros.`
- error: `No fue posible consultar las vacantes en este momento.`

---

## Buenas Practicas De Implementacion En Next.js

### Arquitectura

- Usa componentes servidor o fetching del lado servidor cuando tenga sentido
- Mantén la logica de integracion con Ever Jobs en una capa separada, por ejemplo:

```text
src/lib/ever-jobs/
src/lib/ever-jobs/client.ts
src/lib/ever-jobs/schemas.ts
src/lib/ever-jobs/mappers.ts
```

### Validacion

Usa validacion fuerte del lado servidor con algo como:

- `zod`
- o el sistema de validacion ya existente en TailorCV

Ejemplo de schema interno recomendado:

```ts
import { z } from "zod";

export const JobSearchInputSchema = z.object({
  searchTerm: z.string().trim().min(2).max(120),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  isRemote: z.boolean().default(false),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(20).default(10),
  sites: z.array(z.string()).default(["google", "indeed", "remoteok"])
});
```

### Seguridad

- nunca reenvies al backend campos peligrosos enviados por el cliente
- nunca expongas secretos al browser
- aplica allowlist de fuentes
- usa timeout razonable
- captura errores de red y de parsing
- si TailorCV tiene observabilidad, registra errores sin incluir secrets

### Rendimiento

- debounce de busqueda si haces auto-submit
- paginacion
- no descargues descripciones gigantes si no son necesarias
- memoiza o cachea respuestas cortas si el producto lo tolera

### Accesibilidad

- formularios etiquetados
- focus states
- botones accesibles
- semantica correcta

---

## Recomendacion De Arquitectura Concreta

Implementa esta estructura conceptual:

### 1. Capa de integracion del servidor

Un modulo interno, por ejemplo:

```text
src/lib/ever-jobs/client.ts
```

Que exporte una funcion tipo:

```ts
searchJobs(input: TailorCVJobSearchInput): Promise<TailorCVJobSearchResult>
```

### 2. Route handler interno

Un endpoint interno tipo:

```text
/api/job-search
```

Que use la funcion anterior.

### 3. Seccion visual

Una pagina o seccion tipo:

```text
/dashboard/job-search
```

o la ruta equivalente al diseño de TailorCV.

### 4. Componentes recomendados

- `JobSearchForm`
- `JobResultsList`
- `JobResultCard`
- `JobSearchEmptyState`
- `JobSearchErrorState`

---

## Mapping Recomendado De Datos

No expongas al frontend el objeto bruto del backend si no hace falta.

Define un modelo frontend como:

```ts
export type TailorCVJob = {
  id: string;
  title: string;
  companyName: string | null;
  locationLabel: string | null;
  isRemote: boolean;
  source: string | null;
  jobUrl: string;
  postedAt: string | null;
  salaryLabel: string | null;
  descriptionSnippet: string | null;
  logoUrl: string | null;
};
```

Y transforma la respuesta del backend a este formato.

### Reglas de mapping sugeridas

- `locationLabel`:
  - usa `city`, `state`, `country` si existen
  - si no, usa `null`
- `salaryLabel`:
  - si hay `compensation`, formatea moneda e intervalo
  - si no, `null`
- `descriptionSnippet`:
  - recorta descripcion a un largo razonable
- `source`:
  - usa `site`

---

## Ejemplo De Llamada Del Servidor De TailorCV A Ever Jobs

```ts
const response = await fetch(
  `${process.env.EVER_JOBS_API_URL}/api/jobs/search?paginate=true&page=${page}&page_size=${pageSize}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.EVER_JOBS_API_KEY
        ? { "x-api-key": process.env.EVER_JOBS_API_KEY }
        : {})
    },
    body: JSON.stringify({
      searchTerm,
      location,
      isRemote,
      resultsWanted: pageSize,
      country: process.env.EVER_JOBS_DEFAULT_COUNTRY || "USA",
      descriptionFormat: "markdown",
      siteType: allowedSites
    }),
    cache: "no-store"
  }
);
```

---

## Lista De Sitios Recomendados Para MVP

Usa por defecto solo fuentes de bajo riesgo y buena utilidad:

- `google`
- `indeed`
- `remoteok`
- `remotive`
- `weworkremotely`
- `arbeitnow`
- `jobicy`
- `himalayas`
- `themuse`

Puedes dejar `linkedin` fuera del MVP si da problemas operativos o de estabilidad.

No uses fuentes ATS con `companySlug` para esta version generalista de TailorCV.

---

## Requisitos De Calidad

Quiero una implementacion con estas propiedades:

- codigo tipado
- sin hardcodear URLs
- sin secretos en cliente
- con validacion de input
- con manejo claro de errores
- con estructura mantenible
- sin sobreingenieria
- consistente con el estilo del codebase existente

No quiero:

- llamadas directas desde componentes cliente a la API externa
- exponer `auth`, `proxies` o campos internos
- acoplar el UI a la respuesta cruda del backend
- meter toda la logica en un solo archivo

---

## Tareas Que Debes Ejecutar En TailorCV

1. inspecciona la estructura real del proyecto TailorCV
2. detecta si usa App Router o Pages Router
3. detecta librerias existentes de UI, forms, fetch, validacion y estado
4. crea la variable de entorno para la API externa
5. implementa el cliente servidor para Ever Jobs
6. implementa el endpoint interno de TailorCV
7. implementa la pagina o seccion `Buscar trabajo`
8. implementa formulario, resultados, estados y paginacion
9. aplica mapeo de datos a un modelo frontend estable
10. documenta las nuevas variables de entorno
11. valida que ningun secreto llegue al browser
12. deja el codigo listo para produccion

---

## Criterios De Aceptacion

La tarea se considera terminada cuando:

1. existe una seccion visible llamada **Buscar trabajo**
2. el usuario puede buscar empleos desde TailorCV
3. la URL del backend vive en env var
4. la API key del backend no se expone al cliente
5. la integracion pasa por un endpoint interno de Next.js
6. solo se usan campos seguros del backend
7. la UI muestra resultados de forma clara y usable
8. hay manejo correcto de carga, vacio y error
9. la implementacion sigue el estilo del codebase
10. la solucion queda preparada para cambiar de hosting sin tocar el codigo

---

## Instruccion Final

Implementa esta integracion directamente en TailorCV con criterio de produccion.

No te limites a describir el plan: realiza los cambios concretos.

Si el codebase ya tiene patrones establecidos para:

- fetchers
- endpoints internos
- componentes de formulario
- design system
- manejo de errores
- logging

debes reutilizarlos.

Si hay decisiones razonables no especificadas aqui, toma la opcion mas segura y mantenible.

