import React from 'react';

export default function FontShowcase() {
  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-5xl font-bold text-center mb-8 gradient-text">
          Beautiful Typography for Art
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Playfair Display - Elegant Serif */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="font-display text-2xl font-bold mb-4 text-gray-800">
              Playfair Display
            </h2>
            <p className="font-display text-lg text-gray-600 mb-4">
              Elegant serif font perfect for headings and artistic content
            </p>
            <div className="space-y-2 text-sm">
              <p className="font-display font-light">Light weight text</p>
              <p className="font-display font-normal">Regular weight text</p>
              <p className="font-display font-medium">Medium weight text</p>
              <p className="font-display font-semibold">Semibold weight text</p>
              <p className="font-display font-bold">Bold weight text</p>
            </div>
          </div>

          {/* Poppins - Modern Sans */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="font-heading text-2xl font-bold mb-4 text-gray-800">
              Poppins
            </h2>
            <p className="font-heading text-lg text-gray-600 mb-4">
              Modern geometric sans-serif for clean, professional look
            </p>
            <div className="space-y-2 text-sm">
              <p className="font-heading font-light">Light weight text</p>
              <p className="font-heading font-normal">Regular weight text</p>
              <p className="font-heading font-medium">Medium weight text</p>
              <p className="font-heading font-semibold">Semibold weight text</p>
              <p className="font-heading font-bold">Bold weight text</p>
            </div>
          </div>

          {/* Inter - Body Text */}
          <div className="bg-white p-6 rounded-xl shadow-lg md:col-span-2">
            <h2 className="font-body text-2xl font-bold mb-4 text-gray-800">
              Inter
            </h2>
            <p className="font-body text-lg text-gray-600 mb-4">
              Highly readable sans-serif designed for user interfaces and body text
            </p>
            <div className="space-y-2 text-sm">
              <p className="font-body font-light">Light weight text for subtle emphasis</p>
              <p className="font-body font-normal">Regular weight text for body content</p>
              <p className="font-body font-medium">Medium weight text for labels</p>
              <p className="font-body font-semibold">Semibold weight text for emphasis</p>
              <p className="font-body font-bold">Bold weight text for strong emphasis</p>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-12 bg-white p-8 rounded-xl shadow-lg">
          <h2 className="font-display text-3xl font-bold mb-6 text-center gradient-text">
            Typography in Action
          </h2>
          
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-4xl font-bold mb-2 gradient-text">
                Art Gallery Exhibition
              </h1>
              <p className="font-heading text-lg text-gray-600">
                Contemporary Masterpieces from Emerging Artists
              </p>
            </div>
            
            <div>
              <h2 className="font-heading text-2xl font-semibold mb-3 text-gray-800">
                Featured Collection
              </h2>
              <p className="font-body text-gray-700 leading-relaxed">
                Discover our carefully curated selection of contemporary artworks that showcase 
                the diversity and creativity of modern artists. Each piece tells a unique story 
                and invites viewers to explore new perspectives on art and culture.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h3 className="font-heading text-xl font-semibold mb-2 text-gray-800">
                Visit Our Gallery
              </h3>
              <p className="font-body text-gray-600">
                Experience the beauty of art in person. Our gallery provides the perfect 
                setting to appreciate the intricate details and emotional depth of each artwork.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 