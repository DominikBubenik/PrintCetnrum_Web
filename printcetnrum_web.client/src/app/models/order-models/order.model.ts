import { UserFile } from "../user-file";
import { User } from "../user.model";


export interface Order {
  id: number;
  orderCreated: Date;
  orderName: string;
  isPreparedForCustomer: boolean;
  isTakenByCustomer: boolean;
  totalPrice: number;
  orderFinished?: Date;
  orderTakenTime?: Date;
  userId: number;
}

export interface OrderItem {
  orderId: number;
  userFileId: number;
  userFile: UserFile;
  count: number;
  color: string; //new
  paperType: string; //new
  size: string; //new
  price: number;
  description: string;
}
