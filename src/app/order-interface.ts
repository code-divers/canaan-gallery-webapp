
export interface IOrder {
    id: string;
    comaxDocNumber?: number;
    created: any;
    price: number;
    discount: number;
    discountedPrice: number;
    shipping: number;
    subtotal: number;
    customer: ICustomer;
    items: IOrderItem[];
    comments: any;
  }

  export interface ICustomer {
    id: string;
    name: string;
    address: string;
    street: string;
    house: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    email: string;
    zipcode: string;
    currency: string;
    isExport: boolean;
  }

  export interface IProduct {
      id: string;
      name: string;
      price: number;
      group: string;
  }

  export interface IProductGroup {
    id: string;
    count: number;
  }

  export interface IOrderItem {
    id: string;
    name: string;
    price: number;
    discount: number;
    isEditDiscount: boolean;
    discountedPrice: number;
    quantity: number;
    details?: any;
    group: string;
  }
