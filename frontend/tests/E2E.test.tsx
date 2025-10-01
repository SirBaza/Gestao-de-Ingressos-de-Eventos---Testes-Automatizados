import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { apiService } from "../src/services/api";

// Mock da API
jest.mock("../src/services/api");
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock do QRComponent
jest.mock("../src/components/QRComponent", () => {
  return function QRComponent({ value }: { value: string }) {
    return (
      <div data-testid='qr-component'>
        <div data-testid='qr-value'>{value}</div>
        <canvas data-testid='qr-canvas' />
      </div>
    );
  };
});

// Mock do Scanner
jest.mock("../src/components/Scanner", () => {
  return function Scanner({ onScan, onError, disabled }: any) {
    return (
      <div data-testid='scanner-mock' className={disabled ? "disabled" : ""}>
        <input
          data-testid='scanner-input'
          placeholder='Digite o hash do QR code'
          disabled={disabled}
          onChange={(e) => {
            if (e.target.value) {
              onScan(e.target.value);
            }
          }}
        />
        <button
          data-testid='scanner-error'
          onClick={() => onError("Erro simulado do scanner")}
          disabled={disabled}
        >
          Simular Erro Scanner
        </button>
        <button
          data-testid='simulate-valid-qr'
          onClick={() => onScan("hash_valido_123")}
          disabled={disabled}
        >
          Simular QR Válido
        </button>
        <button
          data-testid='simulate-invalid-qr'
          onClick={() => onScan("hash_invalido_xyz")}
          disabled={disabled}
        >
          Simular QR Inválido
        </button>
        <button
          data-testid='simulate-used-qr'
          onClick={() => onScan("hash_ja_usado_456")}
          disabled={disabled}
        >
          Simular QR Já Usado
        </button>
      </div>
    );
  };
});

describe("E2E - Fluxos Completos do Sistema", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Fluxo de Compra E2E", () => {
    test("deve completar fluxo: Acesso → Formulário → Pagamento → QR Code", async () => {
      const user = userEvent.setup();

      // Mock da resposta de compra bem-sucedida
      const mockCompraResponse = {
        sucesso: true,
        compra: {
          id: 1,
          nome: "João Silva",
          email: "joao@teste.com",
          matricula: "123456",
          quantidade: 2,
          eventoId: 1,
          tipoIngressoId: 1,
          dataCompra: "2025-09-30T10:00:00.000Z",
        },
        ingressos: [
          { id: 1, hash: "hash_valido_123", usado: false, compraId: 1 },
          { id: 2, hash: "hash_valido_456", usado: false, compraId: 1 },
        ],
        qrCodes: ["hash_valido_123", "hash_valido_456"],
      };

      mockApiService.criarCompra.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockCompraResponse), 200)
          )
      );

      render(<App />);

      // === ETAPA 1: Tela Inicial ===
      expect(screen.getByTestId("home")).toBeInTheDocument();
      expect(
        screen.getByText("🎫 Sistema de Gestão de Ingressos")
      ).toBeInTheDocument();

      // === ETAPA 2: Navegar para Compra ===
      const botaoCompra = screen.getByTestId("ir-para-compra");
      await user.click(botaoCompra);

      // Verificar navegação para tela de compra
      await waitFor(() => {
        expect(screen.getByTestId("compra-integrada")).toBeInTheDocument();
      });

      expect(screen.getByText("Compra de Ingressos")).toBeInTheDocument();

      // === ETAPA 3: Preencher Formulário ===
      await user.type(screen.getByTestId("input-nome"), "João Silva");
      await user.type(screen.getByTestId("input-email"), "joao@teste.com");
      await user.type(screen.getByTestId("input-matricula"), "123456");

      // Alterar quantidade
      fireEvent.change(screen.getByTestId("input-quantidade"), {
        target: { value: "2" },
      });

      // === ETAPA 4: Submeter Formulário ===
      const form = screen.getByTestId("compra-form");
      fireEvent.submit(form);

      // === ETAPA 5: Verificar Loading ===
      await waitFor(() => {
        expect(screen.getByTestId("carregando-compra")).toBeInTheDocument();
      });

      // === ETAPA 6: Verificar Sucesso e QR Codes ===
      await waitFor(
        () => {
          expect(screen.getByTestId("compra-sucesso")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verificar detalhes da compra
      expect(screen.getByTestId("compra-detalhes")).toBeInTheDocument();
      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("joao@teste.com")).toBeInTheDocument();
      expect(screen.getByText("123456")).toBeInTheDocument();

      // Verificar QR codes gerados
      expect(screen.getByTestId("qr-codes-container")).toBeInTheDocument();
      expect(screen.getByTestId("qr-code-0")).toBeInTheDocument();
      expect(screen.getByTestId("qr-code-1")).toBeInTheDocument();

      // Verificar hashes dos ingressos
      expect(screen.getByTestId("qr-hash-0")).toBeInTheDocument();
      expect(screen.getByTestId("qr-hash-1")).toBeInTheDocument();

      // === ETAPA 7: Verificar API Call ===
      expect(mockApiService.criarCompra).toHaveBeenCalledWith({
        nome: "João Silva",
        email: "joao@teste.com",
        matricula: "123456",
        quantidade: 2,
        eventoId: 1,
        tipoIngressoId: 1,
      });
    });

    test("deve tratar erro na compra corretamente", async () => {
      const user = userEvent.setup();

      // Mock de erro na API
      mockApiService.criarCompra.mockRejectedValueOnce(
        new Error("Evento esgotado")
      );

      render(<App />);

      // Navegar para compra
      await user.click(screen.getByTestId("ir-para-compra"));

      await waitFor(() => {
        expect(screen.getByTestId("compra-integrada")).toBeInTheDocument();
      });

      // Preencher e submeter formulário
      await user.type(screen.getByTestId("input-nome"), "Maria Santos");
      await user.type(screen.getByTestId("input-email"), "maria@teste.com");
      await user.type(screen.getByTestId("input-matricula"), "654321");

      fireEvent.submit(screen.getByTestId("compra-form"));

      // Verificar exibição do erro
      await waitFor(() => {
        expect(screen.getByTestId("erro-compra")).toBeInTheDocument();
      });

      expect(screen.getByText("❌ Evento esgotado")).toBeInTheDocument();

      // Verificar botão de tentar novamente
      const botaoTentarNovamente = screen.getByText("Tentar Novamente");
      expect(botaoTentarNovamente).toBeInTheDocument();

      // Clicar em tentar novamente deve limpar o erro
      await user.click(botaoTentarNovamente);

      await waitFor(() => {
        expect(screen.queryByTestId("erro-compra")).not.toBeInTheDocument();
      });
    });
  });

  describe("Fluxo de Validação E2E", () => {
    test("deve completar fluxo: Scanner → Validação → Resultado Válido", async () => {
      const user = userEvent.setup();

      // Mock da resposta de validação bem-sucedida
      const mockValidacaoResponse = {
        valido: true,
        ingresso: {
          id: 1,
          hash: "hash_valido_123",
          usado: false,
          compraId: 1,
        },
        comprador: {
          nome: "João Silva",
          email: "joao@teste.com",
          matricula: "123456",
        },
        evento: {
          nome: "Festival de Tecnologia 2025",
          data: "2025-12-01T20:00:00.000Z",
          local: "Centro de Convenções",
        },
        dataValidacao: "2025-09-30T10:00:00.000Z",
      };

      mockApiService.validarIngresso.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockValidacaoResponse), 150)
          )
      );

      render(<App />);

      // === ETAPA 1: Navegar para Validação ===
      const botaoValidacao = screen.getByTestId("ir-para-validacao");
      await user.click(botaoValidacao);

      await waitFor(() => {
        expect(screen.getByTestId("scanner-integrado")).toBeInTheDocument();
      });

      expect(screen.getByText("Validação de Ingressos")).toBeInTheDocument();

      // === ETAPA 2: Simular Scan de QR Code Válido ===
      const botaoQRValido = screen.getByTestId("simulate-valid-qr");
      await user.click(botaoQRValido);

      // === ETAPA 3: Verificar Loading ===
      await waitFor(() => {
        expect(screen.getByTestId("carregando-validacao")).toBeInTheDocument();
      });

      // === ETAPA 4: Verificar Resultado Válido ===
      await waitFor(
        () => {
          expect(screen.getByTestId("resultado-validacao")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(screen.getByTestId("ingresso-valido")).toBeInTheDocument();
      expect(screen.getByText("✅ Ingresso Válido!")).toBeInTheDocument();

      // Verificar dados do comprador
      expect(screen.getByTestId("dados-comprador")).toBeInTheDocument();
      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("joao@teste.com")).toBeInTheDocument();
      expect(screen.getByText("123456")).toBeInTheDocument();

      // Verificar dados do evento
      expect(screen.getByTestId("dados-evento")).toBeInTheDocument();
      expect(
        screen.getByText("Festival de Tecnologia 2025")
      ).toBeInTheDocument();
      expect(screen.getByText("Centro de Convenções")).toBeInTheDocument();

      // Verificar dados da validação
      expect(screen.getByTestId("dados-validacao")).toBeInTheDocument();

      // === ETAPA 5: Verificar API Call ===
      expect(mockApiService.validarIngresso).toHaveBeenCalledWith({
        hash: "hash_valido_123",
      });
    });

    test("deve tratar QR inválido corretamente", async () => {
      const user = userEvent.setup();

      // Mock de resposta para QR inválido
      const mockValidacaoResponse = {
        valido: false,
        error: "Ingresso não encontrado no sistema",
      };

      mockApiService.validarIngresso.mockResolvedValueOnce(
        mockValidacaoResponse
      );

      render(<App />);

      // Navegar para validação
      await user.click(screen.getByTestId("ir-para-validacao"));

      await waitFor(() => {
        expect(screen.getByTestId("scanner-integrado")).toBeInTheDocument();
      });

      // Simular QR inválido
      const botaoQRInvalido = screen.getByTestId("simulate-invalid-qr");
      await user.click(botaoQRInvalido);

      // Verificar resultado inválido
      await waitFor(() => {
        expect(screen.getByTestId("resultado-validacao")).toBeInTheDocument();
      });

      expect(screen.getByTestId("ingresso-invalido")).toBeInTheDocument();
      expect(screen.getByText("❌ Ingresso Inválido")).toBeInTheDocument();
      expect(screen.getByText("Entrada não autorizada")).toBeInTheDocument();

      // Verificar mensagem específica
      expect(screen.getByTestId("erro-detalhes")).toBeInTheDocument();
      expect(
        screen.getByText("Ingresso não encontrado no sistema")
      ).toBeInTheDocument();

      // Verificar alerta específico para não encontrado
      expect(
        screen.getByText("🔍 Ingresso não encontrado no sistema.")
      ).toBeInTheDocument();
    });

    test("deve tratar QR já usado corretamente", async () => {
      const user = userEvent.setup();

      // Mock de resposta para QR já usado
      const mockValidacaoResponse = {
        valido: false,
        error: "Ingresso já utilizado anteriormente",
      };

      mockApiService.validarIngresso.mockResolvedValueOnce(
        mockValidacaoResponse
      );

      render(<App />);

      // Navegar para validação
      await user.click(screen.getByTestId("ir-para-validacao"));

      await waitFor(() => {
        expect(screen.getByTestId("scanner-integrado")).toBeInTheDocument();
      });

      // Simular QR já usado
      const botaoQRUsado = screen.getByTestId("simulate-used-qr");
      await user.click(botaoQRUsado);

      // Verificar resultado inválido
      await waitFor(() => {
        expect(screen.getByTestId("resultado-validacao")).toBeInTheDocument();
      });

      expect(screen.getByTestId("ingresso-invalido")).toBeInTheDocument();

      // Verificar mensagem específica para já usado
      expect(
        screen.getByText("Ingresso já utilizado anteriormente")
      ).toBeInTheDocument();
      expect(
        screen.getByText("⚠️ Este ingresso já foi utilizado anteriormente.")
      ).toBeInTheDocument();
    });

    test("deve permitir validar outro ingresso após resultado", async () => {
      const user = userEvent.setup();

      // Mock de primeira validação
      const mockValidacaoResponse = {
        valido: true,
        ingresso: { id: 1, hash: "hash_valido_123", usado: false, compraId: 1 },
        comprador: {
          nome: "João Silva",
          email: "joao@teste.com",
          matricula: "123456",
        },
        evento: {
          nome: "Evento Teste",
          data: "2025-12-01T20:00:00.000Z",
          local: "Local Teste",
        },
        dataValidacao: "2025-09-30T10:00:00.000Z",
      };

      mockApiService.validarIngresso.mockResolvedValueOnce(
        mockValidacaoResponse
      );

      render(<App />);

      // Navegar e validar primeiro ingresso
      await user.click(screen.getByTestId("ir-para-validacao"));

      await waitFor(() => {
        expect(screen.getByTestId("scanner-integrado")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("simulate-valid-qr"));

      await waitFor(() => {
        expect(screen.getByTestId("resultado-validacao")).toBeInTheDocument();
      });

      // Clicar em "Validar Outro Ingresso"
      const botaoLimpar = screen.getByTestId("limpar-resultado-btn");
      await user.click(botaoLimpar);

      // Verificar que resultado foi limpo
      await waitFor(() => {
        expect(
          screen.queryByTestId("resultado-validacao")
        ).not.toBeInTheDocument();
      });

      // Verificar que scanner está disponível novamente
      expect(screen.getByTestId("scanner-mock")).toBeInTheDocument();
      expect(screen.getByTestId("simulate-valid-qr")).not.toHaveClass(
        "disabled"
      );
    });
  });

  describe("Fluxo de Navegação E2E", () => {
    test("deve navegar entre todas as telas corretamente", async () => {
      const user = userEvent.setup();

      render(<App />);

      // === Tela inicial ===
      expect(screen.getByTestId("home")).toBeInTheDocument();

      // === Ir para compra ===
      await user.click(screen.getByTestId("ir-para-compra"));

      await waitFor(() => {
        expect(screen.getByTestId("compra-integrada")).toBeInTheDocument();
      });

      // Verificar navegação aparece
      expect(screen.getByTestId("navegacao")).toBeInTheDocument();
      expect(screen.getByTestId("voltar-home")).toBeInTheDocument();
      expect(screen.getByTestId("nav-compra")).toBeInTheDocument();
      expect(screen.getByTestId("nav-validacao")).toBeInTheDocument();

      // === Ir para validação via navegação ===
      await user.click(screen.getByTestId("nav-validacao"));

      await waitFor(() => {
        expect(screen.getByTestId("scanner-integrado")).toBeInTheDocument();
      });

      // === Voltar para compra via navegação ===
      await user.click(screen.getByTestId("nav-compra"));

      await waitFor(() => {
        expect(screen.getByTestId("compra-integrada")).toBeInTheDocument();
      });

      // === Voltar ao home ===
      await user.click(screen.getByTestId("voltar-home"));

      await waitFor(() => {
        expect(screen.getByTestId("home")).toBeInTheDocument();
      });

      // Verificar que navegação desapareceu
      expect(screen.queryByTestId("navegacao")).not.toBeInTheDocument();
    });
  });

  describe("Fluxo de Erro de Scanner E2E", () => {
    test("deve tratar erro do scanner corretamente", async () => {
      const user = userEvent.setup();

      render(<App />);

      // Navegar para validação
      await user.click(screen.getByTestId("ir-para-validacao"));

      await waitFor(() => {
        expect(screen.getByTestId("scanner-integrado")).toBeInTheDocument();
      });

      // Simular erro do scanner
      const botaoErroScanner = screen.getByTestId("scanner-error");
      await user.click(botaoErroScanner);

      // Verificar exibição do erro do scanner
      await waitFor(() => {
        expect(screen.getByTestId("resultado-validacao")).toBeInTheDocument();
      });

      expect(screen.getByTestId("ingresso-invalido")).toBeInTheDocument();
      expect(screen.getByText("❌ Ingresso Inválido")).toBeInTheDocument();
      expect(screen.getByText("Erro simulado do scanner")).toBeInTheDocument();
    });
  });
});
