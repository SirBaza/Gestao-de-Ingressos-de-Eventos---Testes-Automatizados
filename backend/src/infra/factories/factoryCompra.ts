import { CompraController } from "../../controllers/CompraController";
import {
  CriarCompraUseCase,
  ListarComprasUseCase,
  CalcularTotalUseCase,
} from "../../domain/usecase/compra";
import { CompraRepository } from "../../repositories/CompraRepository";

export function factoryCompra() {
  const repository = new CompraRepository();
  const criarCompraUseCase = new CriarCompraUseCase(repository);
  const listarComprasUseCase = new ListarComprasUseCase(repository);
  const calcularTotalUseCase = new CalcularTotalUseCase(repository);
  const controller = new CompraController(
    criarCompraUseCase,
    listarComprasUseCase,
    calcularTotalUseCase
  );
  return controller;
}
