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
  orderItems: OrderItem[];
  userId: number;
}

export interface OrderItem {
  id?: number;
  orderId: number;
  userFileId: number;
  userFile: UserFile;
  count: number;
  color: string; 
  paperType: string; 
  size: string; 
  price: number;
  description: string;
}
