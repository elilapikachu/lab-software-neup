# FrontendNeup

Frontend para Neup desarrollado con [Angular CLI](https://github.com/angular/angular-cli) versión 21.2.1.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- **Node.js** (versión 18 o superior) - [Descargar](https://nodejs.org/)
- **npm** (incluido con Node.js) o **yarn** como gestor de paquetes

Verifica que están instalados correctamente:

```bash
node --version
npm --version
```

## Instalación desde Cero

### 1. Clonar el Repositorio

```bash
git clone https://github.com/elilapikachu/lab-software-neup.git
cd lab-software-neup
```

### 2. Instalar Dependencias

Instala todas las dependencias del proyecto:

```bash
npm install
```

O si prefieres usar yarn:

```bash
yarn install
```

## Ejecutar el Proyecto

### Servidor de Desarrollo

Para iniciar el servidor de desarrollo local:

```bash
npm start
```

O con Angular CLI:

```bash
ng serve
```

Una vez que el servidor esté corriendo, abre tu navegador y ve a:

```
http://localhost:4200/
```

La aplicación se recargará automáticamente cada vez que modifiques los archivos de código fuente.

## Construir para Producción

Para compilar el proyecto para producción:

```bash
npm run build
```

O con Angular CLI:

```bash
ng build
```

Los artefactos compilados se almacenarán en el directorio `dist/`. Por defecto, el build de producción optimiza la aplicación para rendimiento y velocidad.

## Generación de Componentes

Angular CLI incluye potentes herramientas de generación de código. Para generar un nuevo componente:

```bash
ng generate component nombre-componente
```

Para ver la lista completa de esquemas disponibles (componentes, directivas, pipes, etc.), ejecuta:

```bash
ng generate --help
```

## Ejecutar Pruebas Unitarias

Para ejecutar las pruebas unitarias con [Vitest](https://vitest.dev/):

```bash
npm test
```

O con Angular CLI:

```bash
ng test
```

## Ramas del Proyecto

- **main** - Rama principal de producción
- **development** - Rama de desarrollo

## Recursos Adicionales

Para más información sobre Angular CLI, visita:
- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Documentación Angular](https://angular.io/docs)
- [Angular CLI GitHub](https://github.com/angular/angular-cli)

---

**¿Problemas?** Asegúrate de que tienes Node.js instalado correctamente y que estás en la rama correcta (`development` para desarrollo, `main` para producción).
