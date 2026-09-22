type Cep = {
    cep: string,
    logadouro: string,
    complemento: string,
    unidade: string,
    bairro: string
    localidade: string
    uf: string
    estado: string
    regiao: string
    ibge: string
    gia: string
    ddd: string
    siafi: string
}



async function buscarCep(): Promise<Cep> {
    const response = await fetch("https://viacep.com.br/ws/01001000/json/")
    const dados = await response.json() as Cep
    return dados
}


async function buscarCepExemplo () {
    const resultado = await buscarCep()
    console.log(resultado)
   
}


buscarCepExemplo()


async function criarCep(): Promise<Cep> {
    const response = await fetch("https://viacep.com.br/ws/01001000/json/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            cep: "01001-000",
            logadouro: "Praça da Sé",
            complemento: "lado ímpar",
            unidade: "",
            bairro: "Sé",
            localidade: "São Paulo",
            uf: "SP",
            estado: "São Paulo",
            regiao: "Sudeste",
            ibge: "3550308",
            gia: "1004",
            ddd: "11",
            siafi: "7107"
        })
    })
    const dados = await response.json() as Cep
    return dados
}

async function criarCepExemplo() {
    const resultado = await criarCep()
    console.log(resultado)
}

criarCepExemplo()


