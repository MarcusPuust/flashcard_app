export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Card {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  created_at: string;
}

export interface Attempt {
  id: string;
  card_id: string;
  is_correct: boolean;
  created_at: string;
}

export interface CardWithCategory extends Card {
  category_name: string;
}
