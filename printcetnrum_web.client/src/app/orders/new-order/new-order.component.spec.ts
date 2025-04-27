import { Order, OrderItem } from '../../models/order-models/order.model';
import { UserFile } from '../../models/user-models/user-file';

describe('Order and OrderItem', () => {
  let order: Order;
  let orderItem: OrderItem;
  let userFile: UserFile;

  beforeEach(() => {
    userFile = {
      id: 1,
      fileName: 'testFile.pdf',
      fileUinique: 'unique-file-id-1',
      filePath: 'path/to/testFile.pdf',
      extension: '.pdf',
      uploadDate: new Date(),
      shouldPrint: true,
      isStamp: false,
      isDiploma: false
    };

    orderItem = {
      orderId: 1,
      userFileId: userFile.id,
      userFile: userFile,
      isDesignFile: false,
      count: 2,
      color: 'black',
      paperType: 'regular',
      size: 'A4',
      price: 10,
      description: 'Test order item'
    };

    order = {
      id: 1,
      orderCreated: new Date(),
      orderName: 'Test Order',
      isPreparedForCustomer: false,
      isTakenByCustomer: false,
      totalPrice: 0,
      orderItems: [orderItem],
      userId: 1
    };
  });

  it('should create an order with correct initial values', () => {
    expect(order).toBeTruthy();
    expect(order.id).toBe(1);
    expect(order.orderCreated).toBeInstanceOf(Date);
    expect(order.orderItems.length).toBe(1);
    expect(order.orderItems[0].price).toBe(10);
  });

  it('should initialize an order item correctly', () => {
    expect(orderItem).toBeTruthy();
    expect(orderItem.orderId).toBe(1);
    expect(orderItem.userFileId).toBe(1);
    expect(orderItem.userFile.fileName).toBe('testFile.pdf');
    expect(orderItem.isDesignFile).toBe(false);
    expect(orderItem.count).toBe(2);
    expect(orderItem.color).toBe('black');
    expect(orderItem.paperType).toBe('regular');
    expect(orderItem.size).toBe('A4');
    expect(orderItem.price).toBe(10);
    expect(orderItem.description).toBe('Test order item');
  });

  it('should calculate total price for order correctly', () => {
    order.totalPrice = order.orderItems.reduce((sum: number, item: OrderItem) => sum + (item.price * item.count), 0);
    expect(order.totalPrice).toBe(20);
  });

  it('should update total price when adding more items', () => {
    const newUserFile: UserFile = {
      id: 2,
      fileName: 'anotherFile.pdf',
      fileUinique: 'unique-file-id-2',
      filePath: 'path/to/anotherFile.pdf',
      extension: '.pdf',
      uploadDate: new Date(),
      shouldPrint: true,
      isStamp: false,
      isDiploma: false
    };

    const newItem: OrderItem = {
      orderId: 1,
      userFileId: newUserFile.id,
      userFile: newUserFile,
      isDesignFile: false,
      count: 3,
      color: 'blue',
      paperType: 'premium',
      size: 'A3',
      price: 15,
      description: 'Another order item'
    };
    order.orderItems.push(newItem);

    order.totalPrice = order.orderItems.reduce((sum: number, item: OrderItem) => sum + (item.price * item.count), 0);

    expect(order.totalPrice).toBe(65);
  });

  it('should correctly determine if an order item is a design file', () => {
    const designUserFile: UserFile = {
      id: 3,
      fileName: 'stampFile.pdf',
      fileUinique: 'unique-file-id-3',
      filePath: 'path/to/stampFile.pdf',
      extension: '.pdf',
      uploadDate: new Date(),
      shouldPrint: true,
      isStamp: true,
      isDiploma: false
    };

    const designFileItem: OrderItem = {
      orderId: 2,
      userFileId: designUserFile.id,
      userFile: designUserFile,
      isDesignFile: true,
      count: 1,
      color: 'red',
      paperType: 'regular',
      size: 'A4',
      price: 20,
      description: 'Stamp file'
    };

    expect(designFileItem.isDesignFile).toBeTrue();
  });

  it('should handle empty order items gracefully', () => {
    order.orderItems = [];
    order.totalPrice = order.orderItems.reduce((sum: number, item: OrderItem) => sum + (item.price * item.count), 0);
    expect(order.totalPrice).toBe(0);
  });

  it('should correctly update the count of an order item', () => {
    orderItem.count = 5;
    order.totalPrice = order.orderItems.reduce((sum: number, item: OrderItem) => sum + (item.price * item.count), 0);
    expect(order.totalPrice).toBe(50);
  });
});
