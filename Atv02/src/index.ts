type Jogador = {
    nome: string
    time: string
    numero: number
}

const jogadores: Jogador[] = [{
    nome: "Barletta", time: "Sport Club do Recife", numero: 30}]




for(let i=1; i <=jogadores.length; i++){
    console.log(jogadores[i])
}




async function time(): Promise<string> {
    return "Sport Club do Recife"
}


async function timeExemple() {
    const resultado = time()
    console.log(resultado)
    const resultadoAguardado= await time()
    console.log(resultadoAguardado)
}


timeExemple()


// Fluxo assíncrono: permite que uma operação seja iniciada
// sem bloquear a execução das outras operações.
// O await é usado quando precisamos esperar o resultado
// de uma Promise antes de continuar.