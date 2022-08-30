export interface IConfirm {
  title: string;
  dismiss: string;
  accept: string;
  action: string;
  target?: string | number | any;
  data?: string | number | boolean | any;
}

export interface Error {
  code: string;
  message: string;
}
