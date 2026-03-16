"use client";

import { ChevronRight, ShoppingBagIcon } from "./Icons";

const merchandiseItems = [
  { name: "Event Long-Sleeve T-Shirt", price: "$24.99 CAD", image: "https://www.figma.com/api/mcp/asset/0fc175e7-aaf0-48d7-8292-7b54fc047b39" },
  { name: "Event Bag", price: "$59.99 CAD", image: "https://www.figma.com/api/mcp/asset/0fc175e7-aaf0-48d7-8292-7b54fc047b39" },
  { name: "Baseball Cap", price: "$14.99 CAD", image: "https://www.figma.com/api/mcp/asset/0fc175e7-aaf0-48d7-8292-7b54fc047b39" },
  { name: "Water Bottle", price: "$8.99 CAD", image: "https://www.figma.com/api/mcp/asset/0fc175e7-aaf0-48d7-8292-7b54fc047b39" },
];

export default function EventMerchandise() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-text-DEFAULT">Event Merchandise</h2>
        <button className="text-sm text-brand-primary hover:underline">Go to Event Store</button>
      </div>

      {/* Order Summary */}
      <div className="flex items-center gap-2 border border-border-DEFAULT rounded-lg px-3 py-2 mb-4 cursor-pointer hover:bg-gray-50">
        <ShoppingBagIcon className="w-6 h-6 text-text-DEFAULT flex-shrink-0" />
        <div className="flex-1">
          <p className="text-base font-medium text-text-DEFAULT">4 Items</p>
          <p className="text-sm text-text-DEFAULT">3 ordered, 1 redeemed</p>
        </div>
        <ChevronRight className="w-6 h-6 text-gray-400" />
      </div>

      {/* Merchandise Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
        {merchandiseItems.map((item, i) => (
          <div key={i} className="bg-white border border-border-subdued rounded-lg p-4">
            <div className="aspect-square rounded-md border border-border-subdued overflow-hidden mb-4 bg-gray-50">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-text-DEFAULT leading-tight">{item.name}</p>
              <p className="text-base text-text-DEFAULT mt-2">{item.price}</p>
              <button className="mt-2 border border-border-DEFAULT rounded px-3 py-1 text-sm font-medium text-text-DEFAULT hover:bg-gray-50 shadow-button">
                Order Item
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
