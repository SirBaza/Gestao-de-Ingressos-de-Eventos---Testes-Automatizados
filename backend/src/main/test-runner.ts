export class TestRunner {
  private testes: Array<{ nome: string; teste: () => void | Promise<void> }> = [];
  private resultados: Array<{ nome: string; sucesso: boolean; erro?: string }> = [];

  adicionarTeste(nome: string, teste: () => void | Promise<void>) {
    this.testes.push({ nome, teste });
  }

  async executarTodos() {
    console.log('\n=== EXECUTANDO TESTES ===\n');

    for (const { nome, teste } of this.testes) {
      try {
        await teste();
        this.resultados.push({ nome, sucesso: true });
        console.log(`✅ ${nome}`);
      } catch (error) {
        this.resultados.push({ 
          nome, 
          sucesso: false, 
          erro: error instanceof Error ? error.message : 'Erro desconhecido' 
        });
        console.log(`❌ ${nome}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    this.mostrarResumo();
  }

  private mostrarResumo() {
    const total = this.resultados.length;
    const sucessos = this.resultados.filter(r => r.sucesso).length;
    const falhas = total - sucessos;

    console.log('\n=== RESUMO DOS TESTES ===');
    console.log(`Total: ${total}`);
    console.log(`Sucessos: ${sucessos}`);
    console.log(`Falhas: ${falhas}`);
    console.log(`Taxa de sucesso: ${((sucessos / total) * 100).toFixed(2)}%`);

    if (falhas > 0) {
      console.log('\n=== TESTES FALHARAM ===');
      this.resultados
        .filter(r => !r.sucesso)
        .forEach(r => console.log(`- ${r.nome}: ${r.erro}`));
    }
  }
}

// Função de assert simples
export function assert(condicao: boolean, mensagem: string = 'Asserção falhou') {
  if (!condicao) {
    throw new Error(mensagem);
  }
}

export function assertEqual<T>(atual: T, esperado: T, mensagem?: string) {
  if (atual !== esperado) {
    throw new Error(mensagem || `Esperado: ${esperado}, Atual: ${atual}`);
  }
}

export function assertThrows(fn: () => void, mensagem?: string) {
  try {
    fn();
    throw new Error(mensagem || 'Esperava que a função lançasse um erro');
  } catch (error) {
    // Erro esperado
  }
}
