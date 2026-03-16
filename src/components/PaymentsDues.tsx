"use client";

export default function PaymentsDues() {
  return (
    <div className="bg-white border border-border-DEFAULT rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="bg-surface-subdued border border-border-subdued rounded-lg p-2">
          <p className="text-xs font-medium text-text-DEFAULT">Due Mar 1, 2025</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[32px] font-medium text-text-DEFAULT leading-tight">$4,922.74</span>
            <span className="text-base font-medium text-text-DEFAULT">CAD</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border-DEFAULT">
        <button className="w-full py-4 text-sm font-medium text-brand-primary text-center hover:bg-gray-50">
          Make a Payment
        </button>
      </div>
    </div>
  );
}
