import React, { useState } from "react";
import CompraIntegrada from "./components/CompraIntegrada";
import ScannerIntegrado from "./components/ScannerIntegrado";

type Tela = "home" | "compra" | "validacao";

const App: React.FC = () => {
  const [telaAtual, setTelaAtual] = useState<Tela>("home");

  const renderTela = () => {
    switch (telaAtual) {
      case "compra":
        return <CompraIntegrada />;
      case "validacao":
        return <ScannerIntegrado />;
      default:
        return (
          <div className='home' data-testid='home'>
            <h1>🎫 Sistema de Gestão de Ingressos</h1>
            <p>Escolha uma das opções abaixo:</p>

            <div className='opcoes' data-testid='opcoes'>
              <button
                onClick={() => setTelaAtual("compra")}
                className='opcao-btn compra-btn'
                data-testid='ir-para-compra'
              >
                🛒 Comprar Ingressos
              </button>

              <button
                onClick={() => setTelaAtual("validacao")}
                className='opcao-btn validacao-btn'
                data-testid='ir-para-validacao'
              >
                🔍 Validar Ingressos
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className='app' data-testid='app'>
      {telaAtual !== "home" && (
        <nav className='navegacao' data-testid='navegacao'>
          <button
            onClick={() => setTelaAtual("home")}
            className='voltar-btn'
            data-testid='voltar-home'
          >
            ← Voltar ao Menu
          </button>

          <div className='nav-opcoes'>
            <button
              onClick={() => setTelaAtual("compra")}
              className={`nav-btn ${telaAtual === "compra" ? "ativo" : ""}`}
              data-testid='nav-compra'
            >
              Compra
            </button>

            <button
              onClick={() => setTelaAtual("validacao")}
              className={`nav-btn ${telaAtual === "validacao" ? "ativo" : ""}`}
              data-testid='nav-validacao'
            >
              Validação
            </button>
          </div>
        </nav>
      )}

      <main className='main-content' data-testid='main-content'>
        {renderTela()}
      </main>
    </div>
  );
};

export default App;
