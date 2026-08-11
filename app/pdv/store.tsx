"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";

// Tipos
export interface PdvProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock?: number;
}

export interface PdvCartItem extends PdvProduct {
  quantity: number;
}

export interface PdvCustomer {
  name: string;
  cpf_cnpj: string;
  email: string;
  phone: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  number: string;
  complement: string;
}

export interface PdvState {
  cart: PdvCartItem[];
  customer: PdvCustomer;
  sellerId: string | null;
  step: "cart" | "customer" | "payment" | "success";
  paymentMethod: "pix" | "credit_card" | "debit_card" | "cash" | null;
}

type Action =
  | { type: "ADD_TO_CART"; payload: PdvProduct }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "SET_CUSTOMER"; payload: Partial<PdvCustomer> }
  | { type: "SET_SELLER"; payload: string | null }
  | { type: "SET_STEP"; payload: PdvState["step"] }
  | { type: "SET_PAYMENT_METHOD"; payload: PdvState["paymentMethod"] }
  | { type: "RESET" };

// Estado Inicial
const initialState: PdvState = {
  cart: [],
  customer: {
    name: "",
    cpf_cnpj: "",
    email: "",
    phone: "",
    address: "",
    cep: "",
    city: "",
    state: "",
    number: "",
    complement: ""
  },
  sellerId: null,
  step: "cart",
  paymentMethod: null,
};

// Reducer
function pdvReducer(state: PdvState, action: Action): PdvState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existing = state.cart.find((item) => item.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
      };
    }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      };
    case "SET_CUSTOMER":
      return {
        ...state,
        customer: { ...state.customer, ...action.payload },
      };
    case "SET_SELLER":
      return { ...state, sellerId: action.payload };
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// Contexto
const PdvContext = createContext<{
  state: PdvState;
  dispatch: React.Dispatch<Action>;
  total: number;
} | null>(null);

export function PdvProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(pdvReducer, initialState);

  const total = React.useMemo(() => {
    return state.cart.reduce((acc: number, item: PdvCartItem) => acc + item.price * item.quantity, 0);
  }, [state.cart]);

  return (
    <PdvContext.Provider value={{ state, dispatch, total }}>
      {children}
    </PdvContext.Provider>
  );
}

export function usePdv() {
  const context = useContext(PdvContext);
  if (!context) throw new Error("usePdv must be used within a PdvProvider");
  return context;
}
