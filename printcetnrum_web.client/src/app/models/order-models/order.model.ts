import { UserFile } from "../user-file";
import { User } from "../user.model";


export interface Order {
  id: number;
  orderCreated: Date;
  isPreparedForCustomer: boolean;
  isTakenByCustomer: boolean;
  totalPrice: number;
  orderFinished?: Date;
  orderTakenTime?: Date;
  userId: number;
  orderItems?: OrderItem[]; 
}

export interface OrderItem {
  id: number;
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
