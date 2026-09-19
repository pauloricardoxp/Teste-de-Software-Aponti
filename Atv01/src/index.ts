
//1. Declare uma variável para cada tipo primitivo básico do TypeScript (string, number, boolean), atribuindo valores de sua escolha. //
let nome: String = "Paulo"
console.log(nome)

//2.Tente declarar uma variável do tipo number e atribuir a ela um valor do tipo string (ex: "vinte"). O que o TypeScript acusa? Anote o erro em comentário. //
let numero: number = "Vinte" //Erro: O tipo 'string' não pode ser atribuído ao tipo 'Number'//

//3.Crie uma variável idade: number e escreva uma estrutura condicional (if/else) que exiba "Maior de idade" se for maior ou igual a 18, e "Menor de idade" caso contrário. 
let numero2: number = 19

if(numero2 >=18){
    console.log("Maior de idade")
}else{
    console.log("Menor de idade")
}

//4.Crie uma variável nota: number e utilize if / else if / else para classificar a nota em "Aprovado" (nota >= 7), "Recuperação" (nota >= 5 e < 7) ou "Reprovado" (nota < 5). 
let nota: number = 7;

if (nota >= 7) {
    console.log("Aprovado");
} else if (nota >= 5) {
    console.log("Recuperação");
} else {
    console.log("Reprovado");
}

//5.Crie uma variável diaDaSemana: number (1 a 7) e utilize um switch para exibir o nome do dia correspondente. 

let diaDaSemana: number = 7

switch (diaDaSemana) {
    case diaDaSemana = 1:
        console.log("Domingo")
        break;
    case diaDaSemana = 2:
        console.log("Segunda")
        break;
    case diaDaSemana = 3:
        console.log("Terça")
        break;
    case diaDaSemana = 4:
        console.log("Quarta")
        break;
    case diaDaSemana = 5:
        console.log("Quinta")
        break;
    case diaDaSemana = 6:
        console.log("Sexta")
        break;
    case diaDaSemana = 7:
        console.log("Sabado")
        break;
    default:
        break;
}

//6.Utilize um loop for para exibir no console os números de 1 a 10. 
for(let i = 1; i<=10; i++){
    console.log(i)
}

//7.Utilize um loop while para exibir apenas os números pares entre 1 e 20. 

let num = 1; 

while (num <= 20) {
    if (num % 2 === 0) {
        console.log(num);
    }
    num++;
}

//8.Crie um array numeros: number[] com pelo menos 5 valores e utilize um loop for...of para somar todos os elementos, exibindo o total ao final. 

const numeros: number[] = [2,4,6,7,8]
let total = 0;
for (const numero of numeros) {
  total += numero;
}
console.log(`O total da soma é: ${total}`);

//9. Utilize um loop for combinado com uma condicional para exibir apenas os números ímpares entre 1 e 15. 

for(let i = 1; i<=15; i++){
    if(i % 2 === 1){
        console.log(i)
    }
}

//10. Desafio: combine tudo o que foi visto — crie um array de números, percorra com um loop e, para cada número, utilize uma condicional para classificá-lo como "par" ou "ímpar", exibindo o resultado no console.

const pares: number[] = [3,5,7,9,11]

for(const numero2 of pares){
    if(numero2 % 2 === 0){
        console.log("Pár")
    }
    else{
        console.log("Impar")
    }
}