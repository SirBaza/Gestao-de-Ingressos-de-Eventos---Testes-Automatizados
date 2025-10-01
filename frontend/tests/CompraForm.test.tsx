import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CompraForm, { CompraFormData } from "../src/components/CompraForm";

describe("CompraForm", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    cleanup();
    mockOnSubmit.mockClear();
  });

  describe("Renderização inicial", () => {
    test("deve renderizar todos os campos obrigatórios", () => {
      render(<CompraForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/matrícula/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /finalizar compra/i })
      ).toBeInTheDocument();
    });

    test("deve ter valores iniciais corretos", () => {
      render(<CompraForm onSubmit={mockOnSubmit} />);

      // Verificar campos de texto vazios
      expect(screen.getByTestId("input-nome")).toHaveValue("");
      expect(screen.getByTestId("input-email")).toHaveValue("");
      expect(screen.getByTestId("input-matricula")).toHaveValue("");
      // Verificar quantidade com valor padrão 1
      expect(screen.getByTestId("input-quantidade")).toHaveValue(1);
    });

    test("deve marcar campos obrigatórios visualmente", () => {
      render(<CompraForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/nome \*/i)).toBeInTheDocument();
      expect(screen.getByText(/e-mail \*/i)).toBeInTheDocument();
      expect(screen.getByText(/matrícula \*/i)).toBeInTheDocument();
    });
  });

  describe("Validação de campos obrigatórios", () => {
    test("deve exibir erro quando nome está vazio", async () => {
      const user = userEvent.setup();
      render(<CompraForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", {
        name: /finalizar compra/i,
      });
      await user.click(submitButton);

      expect(screen.getByTestId("error-nome")).toHaveTextContent(
        "Nome é obrigatório"
      );
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("deve exibir erro quando e-mail está vazio", async () => {
      const user = userEvent.setup();
      render(<CompraForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", {
        name: /finalizar compra/i,
      });
      await user.click(submitButton);

      expect(screen.getByTestId("error-email")).toHaveTextContent(
        "E-mail é obrigatório"
      );
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("deve exibir erro quando matrícula está vazia", async () => {
      const user = userEvent.setup();
      render(<CompraForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", {
        name: /finalizar compra/i,
      });
      await user.click(submitButton);

      expect(screen.getByTestId("error-matricula")).toHaveTextContent(
        "Matrícula é obrigatória"
      );
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("deve exibir múltiplos erros simultaneamente", async () => {
      const user = userEvent.setup();
      render(<CompraForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", {
        name: /finalizar compra/i,
      });
      await user.click(submitButton);

      expect(screen.getByTestId("error-nome")).toBeInTheDocument();
      expect(screen.getByTestId("error-email")).toBeInTheDocument();
      expect(screen.getByTestId("error-matricula")).toBeInTheDocument();
    });
  });

  describe("Validação de e-mail", () => {
    test("deve exibir erro para e-mail com formato inválido", async () => {
      const user = userEvent.setup();
      render(<CompraForm onSubmit={mockOnSubmit} />);

      const nomeInput = screen.getByTestId("input-nome");
      const emailInput = screen.getByTestId("input-email");
      const matriculaInput = screen.getByTestId("input-matricula");
      const form = screen.getByTestId("compra-form");

      // Preencher todos os campos obrigatórios, mas com email inválido
      await user.type(nomeInput, "Nome Teste");
      await user.type(emailInput, "email-invalido");
      await user.type(matriculaInput, "123456");

      // Usar fireEvent.submit no form
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByTestId("error-email")).toHaveTextContent(
          "E-mail deve ter formato válido"
        );
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("deve aceitar e-mail com formato válido", async () => {
      const user = userEvent.setup();
      render(<CompraForm onSubmit={mockOnSubmit} />);

      const nomeInput = screen.getByTestId("input-nome");
      const emailInput = screen.getByTestId("input-email");
      const matriculaInput = screen.getByTestId("input-matricula");
      const submitButton = screen.getByRole("button", {
        name: /finalizar compra/i,
      });

      await user.type(nomeInput, "João Silva");
      await user.type(emailInput, "joao.silva@email.com");
      await user.type(matriculaInput, "2021001");
      await user.click(submitButton);

      expect(screen.queryByTestId("error-email")).not.toBeInTheDocument();
      expect(mockOnSubmit).toHaveBeenCalledWith({
        nome: "João Silva",
        email: "joao.silva@email.com",
        matricula: "2021001",
        quantidade: 1,
      });
    });

    test("deve validar diferentes formatos de e-mail válidos", async () => {
      const user = userEvent.setup();
      const emailsValidos = [
        "usuario@dominio.com",
        "usuario.sobrenome@dominio.com.br",
        "usuario+tag@dominio.org",
        "usuario123@dominio123.net",
      ];

      for (const email of emailsValidos) {
        cleanup(); // Limpar entre renderizações
        mockOnSubmit.mockClear();
        render(<CompraForm onSubmit={mockOnSubmit} />);

        const nomeInput = screen.getByTestId("input-nome");
        const emailInput = screen.getByTestId("input-email");
        const matriculaInput = screen.getByTestId("input-matricula");
        const submitButton = screen.getByRole("button", {
          name: /finalizar compra/i,
        });

        await user.type(nomeInput, "Teste User");
        await user.type(emailInput, email);
        await user.type(matriculaInput, "2021999");
        await user.click(submitButton);

        expect(screen.queryByTestId("error-email")).not.toBeInTheDocument();
        expect(mockOnSubmit).toHaveBeenCalled();
      }
    });
  });

  describe("Limpeza de erros durante digitação", () => {
    test("deve limpar erro do nome ao começar a digitar", async () => {
      const user = userEvent.setup();
      render(<CompraForm onSubmit={mockOnSubmit} />);

      const nomeInput = screen.getByTestId("input-nome");
      const submitButton = screen.getByRole("button", {
        name: /finalizar compra/i,
      });

      // Submeter para gerar erro
      await user.click(submitButton);
      expect(screen.getByTestId("error-nome")).toBeInTheDocument();

      // Começar a digitar deve limpar o erro
      await user.type(nomeInput, "J");
      expect(screen.queryByTestId("error-nome")).not.toBeInTheDocument();
    });

    test("deve limpar erro do e-mail ao começar a digitar", async () => {
      const user = userEvent.setup();
      render(<CompraForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId("input-email");
      const submitButton = screen.getByRole("button", {
        name: /finalizar compra/i,
      });

      // Submeter para gerar erro
      await user.click(submitButton);
      expect(screen.getByTestId("error-email")).toBeInTheDocument();

      // Começar a digitar deve limpar o erro
      await user.type(emailInput, "t");
      expect(screen.queryByTestId("error-email")).not.toBeInTheDocument();
    });

    test("deve limpar erro da matrícula ao começar a digitar", async () => {
      const user = userEvent.setup();
      render(<CompraForm onSubmit={mockOnSubmit} />);

      const matriculaInput = screen.getByTestId("input-matricula");
      const submitButton = screen.getByRole("button", {
        name: /finalizar compra/i,
      });

      // Submeter para gerar erro
      await user.click(submitButton);
      expect(screen.getByTestId("error-matricula")).toBeInTheDocument();

      // Começar a digitar deve limpar o erro
      await user.type(matriculaInput, "2");
      expect(screen.queryByTestId("error-matricula")).not.toBeInTheDocument();
    });
  });

  describe("Validação de quantidade", () => {
    test("deve aceitar quantidade padrão de 1", async () => {
      const user = userEvent.setup();
      render(<CompraForm onSubmit={mockOnSubmit} />);

      const quantidadeInput = screen.getByTestId("input-quantidade");
      expect(quantidadeInput).toHaveValue(1);
    });

    test("deve permitir alterar quantidade", async () => {
      const user = userEvent.setup();
      render(<CompraForm onSubmit={mockOnSubmit} />);

      const quantidadeInput = screen.getByTestId("input-quantidade");

      // Usar fireEvent para input numérico
      fireEvent.change(quantidadeInput, { target: { value: "3" } });

      expect(quantidadeInput).toHaveValue(3);
    });

    test("deve exibir erro para quantidade menor que 1", async () => {
      const user = userEvent.setup();
      render(<CompraForm onSubmit={mockOnSubmit} />);

      const nomeInput = screen.getByTestId("input-nome");
      const emailInput = screen.getByTestId("input-email");
      const matriculaInput = screen.getByTestId("input-matricula");
      const quantidadeInput = screen.getByTestId("input-quantidade");
      const form = screen.getByTestId("compra-form");

      // Preencher todos os campos obrigatórios, mas com quantidade inválida
      await user.type(nomeInput, "Nome Teste");
      await user.type(emailInput, "teste@email.com");
      await user.type(matriculaInput, "123456");
      // Usar fireEvent para definir quantidade 0
      fireEvent.change(quantidadeInput, { target: { value: "0" } });

      // Usar fireEvent.submit no form
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByTestId("error-quantidade")).toHaveTextContent(
          "Quantidade deve ser maior que zero"
        );
      });
    });
  });

  describe("Submissão do formulário", () => {
    test("deve chamar onSubmit com dados corretos quando formulário é válido", async () => {
      const user = userEvent.setup();
      render(<CompraForm onSubmit={mockOnSubmit} />);

      const nomeInput = screen.getByTestId("input-nome");
      const emailInput = screen.getByTestId("input-email");
      const matriculaInput = screen.getByTestId("input-matricula");
      const quantidadeInput = screen.getByTestId("input-quantidade");
      const submitButton = screen.getByRole("button", {
        name: /finalizar compra/i,
      });

      await user.type(nomeInput, "Maria Santos");
      await user.type(emailInput, "maria.santos@email.com");
      await user.type(matriculaInput, "2021002");
      fireEvent.change(quantidadeInput, { target: { value: "2" } });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        nome: "Maria Santos",
        email: "maria.santos@email.com",
        matricula: "2021002",
        quantidade: 2,
      });
    });

    test("deve não chamar onSubmit quando há erros de validação", async () => {
      const user = userEvent.setup();
      render(<CompraForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId("input-email");
      const submitButton = screen.getByRole("button", {
        name: /finalizar compra/i,
      });

      await user.type(emailInput, "email-invalido");
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Estado de loading", () => {
    test("deve desabilitar campos quando loading é true", () => {
      render(<CompraForm onSubmit={mockOnSubmit} loading={true} />);

      expect(screen.getByTestId("input-nome")).toBeDisabled();
      expect(screen.getByTestId("input-email")).toBeDisabled();
      expect(screen.getByTestId("input-matricula")).toBeDisabled();
      expect(screen.getByTestId("input-quantidade")).toBeDisabled();
      expect(screen.getByTestId("submit-button")).toBeDisabled();
    });

    test("deve alterar texto do botão quando loading é true", () => {
      render(<CompraForm onSubmit={mockOnSubmit} loading={true} />);

      expect(screen.getByTestId("submit-button")).toHaveTextContent(
        "Processando..."
      );
    });

    test("deve manter campos habilitados quando loading é false", () => {
      render(<CompraForm onSubmit={mockOnSubmit} loading={false} />);

      expect(screen.getByTestId("input-nome")).not.toBeDisabled();
      expect(screen.getByTestId("input-email")).not.toBeDisabled();
      expect(screen.getByTestId("input-matricula")).not.toBeDisabled();
      expect(screen.getByTestId("input-quantidade")).not.toBeDisabled();
      expect(screen.getByTestId("submit-button")).not.toBeDisabled();
    });
  });

  describe("Acessibilidade", () => {
    test("deve ter labels associados aos inputs", () => {
      render(<CompraForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/matrícula/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument();
    });

    test("deve ter placeholders informativos", () => {
      render(<CompraForm onSubmit={mockOnSubmit} />);

      expect(
        screen.getByPlaceholderText("Digite seu nome completo")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Digite seu e-mail")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Digite sua matrícula")
      ).toBeInTheDocument();
    });
  });
});
