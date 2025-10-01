import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Componente mínimo para testar eventos
const MinimalForm: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 SUBMIT EXECUTADO!");
  };

  const handleClick = () => {
    console.log("🖱️ BOTÃO CLICADO!");
  };

  return (
    <form onSubmit={handleSubmit} data-testid='minimal-form'>
      <button type='submit' onClick={handleClick} data-testid='submit-button'>
        Enviar
      </button>
    </form>
  );
};

describe("Teste de Eventos", () => {
  test("fireEvent.click deve disparar eventos", () => {
    render(<MinimalForm />);

    const button = screen.getByTestId("submit-button");
    console.log(
      "🎯 Botão encontrado:",
      button.tagName,
      (button as HTMLButtonElement).type
    );

    console.log("\n=== TESTE COM fireEvent.click ===");
    fireEvent.click(button);

    console.log("\n=== TESTE COM fireEvent.submit ===");
    const form = screen.getByTestId("minimal-form");
    fireEvent.submit(form);
  });

  test("userEvent.click deve disparar eventos", async () => {
    const user = userEvent.setup();
    render(<MinimalForm />);

    const button = screen.getByTestId("submit-button");

    console.log("\n=== TESTE COM userEvent.click ===");
    await user.click(button);
  });
});
