import React from 'react'
import { useNavigate } from "react-router-dom";

const EmptyCart = () => {
    const navigate = useNavigate()
  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 pt-[65px] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <img 
                src="/emptycart.png"
                alt="Empty Cart"
                className="w-32 h-32 mx-auto mb-6"
              />
              {/* <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-6" /> */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-6">
                You haven't added any artwork to your cart yet. Browse our
                collection to find pieces that inspire you.
              </p>
              <button
                onClick={() => navigate("/designer")}
                className="px-6 py-3 cursor-pointer bg-gradient-to-tr from-[#001842] via-[#1c3c74] to-[#5E89B3] text-white rounded-lg font-medium hover:from-[#5E89B3] hover:via-[#1c3c74] hover:to-[#001842] transition-all shadow-md"
              >
                Browse Art Collection
              </button>
            </div>
          </div>
        </div>
    </div>
  )
}

export default EmptyCart