let nome: String = "Paulo" // Let = mutavel

const idade: Number = 19 // Const = Imutavel

console.log(nome)

console.log(idade)


function somar(a : number, b: number ){

    return a + b

}

function maiordeidade(num: number){

    if(num >= 18){

        return console.log("Maior de Idade")

    }

    else{

        return console.log("Menor de Idade")

    }

}

console.log(somar(2,2))
console.log(maiordeidade(19))