"use client";
import { useState } from "react";
import { Cart } from "../layout/layout";

export const Dashboard = () => {
  const [cart, setCart] = useState([]);
  return (
    <div className="flex h-screen w-screen items-center justify-center orange-500">
      $
      {cart.length > 0 ? (
        <Cart data={cart} />
      ) : (
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
      )}
    </div>
  );
};
