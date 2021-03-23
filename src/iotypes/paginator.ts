interface Paginator<T> {
  page: number;
  total: number;
  size: number;
  data: T;
}

export type {
  Paginator
}