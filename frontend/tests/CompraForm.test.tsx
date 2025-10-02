import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CompraForm from "../src/components/CompraForm";

// Mock manual simples
class MockFunction {
  calls: any[][] = [];

  call(...args: any[]) {
    this.calls.push(args);
  }

  clear() {
    this.calls = [];
  }

  wasCalled() {
    return this.calls.length > 0;
  }

  wasCalledWith(...expectedArgs: any[]) {
    return this.calls.some(callArgs =>
      JSON.stringify(callArgs) === JSON.stringify(expectedArgs)
    );
  }
}

describe("CompraForm - Testes Essenciais", () => {
  let mockOnSubmit: MockFunction;

  beforeEach(() => {
    mockOnSubmit = new MockFunction();
  });

  test("deve renderizar campos obrigatórios", () => {
    render(<CompraForm onSubmit={(...args) => mockOnSubmit.call(...args)} />);

    expect(screen.getByTestId("input-nome")).toBeInTheDocument();
    expect(screen.getByTestId("input-email")).toBeInTheDocument();
    expect(screen.getByTestId("input-matricula")).toBeInTheDocument();
    expect(screen.getByTestId("input-quantidade")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  test("deve validar campos obrigatórios", async () => {
    const user = userEvent.setup();
    render(<CompraForm onSubmit={(...args) => mockOnSubmit.call(...args)} />);

    await user.click(screen.getByTestId("submit-button"));

    expect(screen.getByTestId("error-nome")).toBeInTheDocument();
    expect(screen.getByTestId("error-email")).toBeInTheDocument();
    expect(screen.getByTestId("error-matricula")).toBeInTheDocument();
    expect(mockOnSubmit.wasCalled()).toBe(false);
  });

  test("deve validar formato do e-mail", async () => {
    const user = userEvent.setup();
    render(<CompraForm onSubmit={(...args) => mockOnSubmit.call(...args)} />);

    await user.type(screen.getByTestId("input-nome"), "João Silva");
    await user.type(screen.getByTestId("input-email"), "email-invalido");
    await user.type(screen.getByTestId("input-matricula"), "123456");

    fireEvent.submit(screen.getByTestId("compra-form"));

    expect(screen.getByTestId("error-email")).toHaveTextContent(
      "E-mail deve ter formato válido"
    );
    expect(mockOnSubmit.wasCalled()).toBe(false);
  });

  test("deve submeter dados válidos", async () => {
    const user = userEvent.setup();
    render(<CompraForm onSubmit={(...args) => mockOnSubmit.call(...args)} />);

    await user.type(screen.getByTestId("input-nome"), "João Silva");
    await user.type(screen.getByTestId("input-email"), "joao@email.com");
    await user.type(screen.getByTestId("input-matricula"), "123456");
    await user.click(screen.getByTestId("submit-button"));

    expect(mockOnSubmit.wasCalledWith({
      nome: "João Silva",
      email: "joao@email.com",
      matricula: "123456",
      quantidade: 1,
    })).toBe(true);
  });

  test("deve desabilitar campos quando loading", () => {
    render(<CompraForm onSubmit={(...args) => mockOnSubmit.call(...args)} loading={true} />);

    expect(screen.getByTestId("input-nome")).toBeDisabled();
    expect(screen.getByTestId("submit-button")).toBeDisabled();
    expect(screen.getByTestId("submit-button")).toHaveTextContent(
      "Processando..."
    );
  });
});
