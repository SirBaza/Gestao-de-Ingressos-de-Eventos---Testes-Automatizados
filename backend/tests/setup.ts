// Setup para testes de integração
process.env.NODE_ENV = "test";
process.env.PORT = "0"; // Usar porta aleatória para testes

// Configurar timeout para operações assíncronas
jest.setTimeout(10000);

// Configuração global de error handling para testes
beforeAll(() => {
  // Suprimir logs de erro durante os testes para manter output limpo
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    // Só mostrar erros que não são esperados nos testes
    if (!args[0]?.toString().includes("Expected")) {
      originalConsoleError.apply(console, args);
    }
  };
});
