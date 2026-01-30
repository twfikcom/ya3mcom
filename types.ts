
export interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  description: string;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export interface CustomOrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface SpecialOrderState {
  quantities: Record<string, number>;
  hasSecretSauce?: boolean;
  breadChoices?: Record<string, 'baladi' | 'western'>;
  extraCheese?: Record<string, boolean>;
  spicyPeppers?: Record<string, boolean>;
}

export type Category = 'الكل' | 'بيتزا' | 'برجر' | 'مشويات' | 'حلويات' | 'سندوتشات';
