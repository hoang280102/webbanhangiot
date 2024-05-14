import { ResultSetHeader } from "mysql2/promise";

export interface CustomResultSetHeader extends ResultSetHeader {
  id: string;
  email: string;
  password: string;
}
