
import { describe, expect, it } from "vitest";
import { divisao, multiplicacao, soma, subtracao } from "../src/index.js";
;

describe("Calculadora", () => {

    it("deve realizar uma soma", () => {
        expect(soma(10, 5)).toBe(15);
    });

    it("deve realizar uma subtração", () => {
        expect(subtracao(10, 5)).toBe(5);
    });

    it("deve realizar uma multiplicação", () => {
        expect(multiplicacao(10, 5)).toBe(50);
    });

    it("deve realizar uma divisão", () => {
        expect(divisao(10, 5)).toBe(2);
    });

});

