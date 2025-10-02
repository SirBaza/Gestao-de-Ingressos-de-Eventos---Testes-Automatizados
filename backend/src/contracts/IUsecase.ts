export interface IUsecase<T, R> {
  execute(data: T): Promise<R>;
}
