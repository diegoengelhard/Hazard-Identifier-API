import React, { useState } from "react";
import Select, { MultiValue } from "react-select";
import { IBooking, IProduct } from "../ts/interfaces";
import { toast } from "react-toastify";

interface Props {
  products: IProduct[];
  onSubmit: (booking: IBooking) => void;
  isLoading: boolean;
}

interface ProductOption {
  value: string;
  label: string;
}

function SingleClassificationForm({ products, onSubmit, isLoading }: Props) {
  const [bookingId, setBookingId] = useState("");
  const [description, setDescription] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    MultiValue<ProductOption>
  >([]);

  const productOptions: ProductOption[] = products.map((p) => ({
    value: p.displayName,
    label: p.displayName,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // validate that description, internalNotes and at least one product is provided
    if (!description.trim()) {
      toast.error("Description is required.");
      return;
    }
    if (!internalNotes.trim()) {
      toast.error("Internal notes are required.");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("At least one product must be selected.");
      return;
    }

    onSubmit({
      id: bookingId || `BOOK-${Date.now()}`,
      customerName: "Demo User",
      bookingDate: new Date().toISOString(),
      description,
      products: selectedProducts.map((p) => p.value),
      internalNotes,
    });

    resetForm();
  };

  const resetForm = () => {
    setBookingId("");
    setDescription("");
    setInternalNotes("");
    setSelectedProducts([]);
  };

  const removeProduct = (productToRemove: ProductOption) => {
    setSelectedProducts(
      selectedProducts.filter((p) => p.value !== productToRemove.value)
    );
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col max-h-[calc(100vh-4rem)] overflow-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Single Classification
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label
              htmlFor="bookingId"
              className="block text-xs font-semibold text-gray-500 tracking-wide uppercase"
            >
              Booking ID
            </label>
            <input
              id="bookingId"
              type="text"
              className="mt-1 block w-full h-10 rounded-md border border-gray-300 bg-white/60 px-3 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Optional ID"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-xs font-semibold text-gray-500 tracking-wide uppercase"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white/60 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the booking..."
            />
          </div>

          <div>
            <label
              htmlFor="internalNotes"
              className="block text-xs font-semibold text-gray-500 tracking-wide uppercase"
            >
              Internal Notes
            </label>
            <textarea
              id="internalNotes"
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white/60 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 resize-y"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add interal details..."
            />
          </div>

          <div>
            <label
              htmlFor="products"
              className="block text-xs font-semibold text-gray-500 tracking-wide uppercase"
            >
              Products
            </label>
            <Select
              inputId="products"
              isMulti
              name="products"
              options={productOptions}
              className="mt-1"
              classNamePrefix="select"
              value={selectedProducts}
              onChange={(options) => setSelectedProducts(options)}
              placeholder="Select products..."
              closeMenuOnSelect={false}
              components={{
                MultiValue: () => null, // Oculta chips dentro del control
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "40px",
                  borderColor: "#d1d5db",
                  boxShadow: "none",
                  backgroundColor: "rgba(255,255,255,0.6)",
                  ":hover": { borderColor: "#c5c9ce" },
                }),
                valueContainer: (base) => ({
                  ...base,
                  paddingTop: 2,
                  paddingBottom: 2,
                }),
                placeholder: (base) => ({
                  ...base,
                  fontSize: "0.875rem",
                  color: "#9ca3af",
                }),
                input: (base) => ({
                  ...base,
                  fontSize: "0.875rem",
                }),
              }}
            />
          </div>

          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
              {selectedProducts.map((product) => (
                <div
                  key={product.value}
                  className="bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1 rounded-full flex items-center"
                >
                  <span>{product.label}</span>
                  <button
                    type="button"
                    onClick={() => removeProduct(product)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    aria-label={`Remove ${product.label}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full justify-center py-3 px-4 rounded-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition"
          >
            {isLoading ? "Classifying..." : "Classify Booking"}
          </button>
        </form>
      </div>
    </>
  );
}

export default SingleClassificationForm;
