import { IUsecase } from "../IUsecase";

export interface IGerarHashUsecase extends IUsecase<{ payload: any }, string> {}

export interface IValidarHashUsecase
  extends IUsecase<{ payload: any; hashEsperado: string }, boolean> {}

export interface IGerarHashUnicoUsecase
  extends IUsecase<{ payload: any; timestamp?: number }, string> {}
