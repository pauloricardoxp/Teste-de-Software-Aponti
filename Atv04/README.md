# Atividade CRUD com API

**Dupla: Paulo**

A API usada foi a JSONPlaceholder: https://jsonplaceholder.typicode.com/posts

> A JSONPlaceholder é uma API de testes. Por isso, ela simula as alterações, mas não salva os dados de verdade.

## 1. O que o `await` faz?

O `await` espera uma `Promise` terminar antes de continuar a execução da função. Ele deixa o código assíncrono mais fácil de acompanhar.

## 2. Qual método HTTP corresponde a cada letra do CRUD?

Create usa `POST`, Read usa `GET`, Update usa `PUT` (ou `PATCH`) e Delete usa `DELETE`.

## 3. Por que o `fetch` não dá erro quando a API responde 404?

Porque uma resposta 404 ainda é uma resposta HTTP recebida, e não uma falha de conexão. Por isso, é preciso conferir `resposta.ok` ou `resposta.status` manualmente.

## 4. Por que o post criado não apareceu na lista?

A JSONPlaceholder é apenas uma API de testes e não grava as alterações de verdade. Ela devolve uma resposta simulando a criação, mas a lista original continua igual.

