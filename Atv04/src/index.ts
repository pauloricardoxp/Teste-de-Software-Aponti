type Post = {
  id?: number;
  userId: number;
  title: string;
  body: string;
};


async function listarPrimeirosPosts(): Promise<void> {
  
  const resposta = await fetch("https://jsonplaceholder.typicode.com/posts");
  if (!resposta.ok) {
    console.log(`Não foi possível mostrar os posts.`);
    return;
  }

  const posts = (await resposta.json()) as Post[];
  posts.slice(0, 3).forEach((post, indice) => {
    console.log(`${indice + 1}. ${post.title}`);
  });
}

async function buscarPostPorId(id: number): Promise<Post | null> {
  const resposta = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);

  if (!resposta.ok) {
    console.log(`Erro ao buscar o post ${id}`);
    return null;
  }

  return (await resposta.json()) as Post;
}

async function mostrarPostDeId1(): Promise<void> {
  const post = await buscarPostPorId(1);
  if (post) {
    console.log(`Título: ${post.title}`);
  }
}

async function criarPost(): Promise<void> {
  const novoPost: Post = {
    userId: 1,
    title: "Meu post de teste",
    body: "Este post foi criado durante a atividade de CRUD."
  };

  const resposta = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novoPost)
  });

  if (!resposta.ok) {
    console.log(`Não foi possível criar o post.`);
    return;
  }

  const postCriado = (await resposta.json()) as Post;
  console.log("Post criado com sucesso:");
  console.log(postCriado);
}

async function atualizarPost(): Promise<void> {

  const resposta = await fetch(`https://jsonplaceholder.typicode.com/posts/1`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: 1,
      userId: 1,
      title: "Título atualizado",
      body: "Conteúdo atualizado para testar o PUT."
    })
  });

  if (!resposta.ok) {
    console.log(`Não foi possível atualizar o post.`);
    return;
  }

  const postAtualizado = (await resposta.json()) as Post;
  console.log("Post atualizado:");
  console.log(postAtualizado);
}

async function apagarPost(): Promise<void> {

  const resposta = await fetch(`https://jsonplaceholder.typicode.com/posts/1`, {
    method: "DELETE"
  });

  if (!resposta.ok) {
    console.log(`Não foi possível apagar o post.`);
    return;
  }

  console.log("Post 1 apagado com sucesso.");
}

async function testarPostInexistente(): Promise<void> {
  console.log("Teste de erro - buscando o post 99999");
  await buscarPostPorId(99999);
  console.log("O programa continuou funcionando mesmo com o post inexistente.");
}

async function executarAtividade(): Promise<void> {
  try {
    await listarPrimeirosPosts();
    await mostrarPostDeId1();
    await criarPost();
    await atualizarPost();
    await apagarPost();
    await testarPostInexistente();
  } catch (erro) {
    console.log("Ocorreu um erro de conexão com a API.");
    console.log(erro);
  }
}

executarAtividade();
