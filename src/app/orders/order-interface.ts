export interface Order {
    created: string;
    price: number;
    discount: number;
    discountedPrice: number;
    shipping: number;
    currency: string;
    subtotal: number;
    isExport: boolean;
    customer: Customer;
  }

  export interface Customer {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    email: string;
    zipcode: string;
  }

  export interface Product {
      name: string;
      price: number;
      studio: number;
  }
