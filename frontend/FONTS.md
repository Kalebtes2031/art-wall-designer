# Beautiful Typography for Art Gallery

This project uses a carefully selected combination of fonts to create a professional and elegant typography system perfect for an art gallery.

## Font Families

### 1. Playfair Display (Serif)
- **Usage**: Main headings, titles, and artistic content
- **Characteristics**: Elegant serif with beautiful contrast and readability
- **Weights**: 400, 500, 600, 700, 800, 900
- **CSS Class**: `font-display`

### 2. Poppins (Sans-serif)
- **Usage**: Subheadings, navigation, and UI elements
- **Characteristics**: Modern geometric sans-serif with excellent readability
- **Weights**: 300, 400, 500, 600, 700, 800
- **CSS Class**: `font-heading`

### 3. Inter (Sans-serif)
- **Usage**: Body text, forms, and general content
- **Characteristics**: Highly readable sans-serif designed for user interfaces
- **Weights**: 300, 400, 500, 600, 700
- **CSS Class**: `font-body`

## Usage Examples

### Headings
```jsx
<h1 className="font-display text-4xl font-bold gradient-text">
  Art Gallery Exhibition
</h1>

<h2 className="font-heading text-2xl font-semibold">
  Featured Collection
</h2>
```

### Body Text
```jsx
<p className="font-body text-gray-700 leading-relaxed">
  Discover our carefully curated selection of contemporary artworks...
</p>
```

### Navigation
```jsx
<span className="font-heading font-medium">
  Gallery
</span>
```

## CSS Classes

- `font-display` - Playfair Display for elegant headings
- `font-heading` - Poppins for subheadings and UI
- `font-body` - Inter for body text and forms
- `gradient-text` - Beautiful gradient text effect
- `art-heading` - Art gallery specific heading style
- `art-subheading` - Art gallery specific subheading style

## Implementation

The fonts are loaded from Google Fonts and configured in:
- `tailwind.config.js` - Tailwind CSS configuration
- `src/index.css` - Global CSS with font imports and utilities

## Benefits

1. **Professional Appearance**: Elegant typography that enhances the artistic content
2. **Excellent Readability**: Carefully chosen fonts for optimal reading experience
3. **Brand Consistency**: Consistent typography across all components
4. **Performance**: Optimized font loading with proper fallbacks
5. **Accessibility**: High contrast and clear letterforms for better accessibility

## Customization

To modify the typography system:

1. Update font imports in `src/index.css`
2. Modify font families in `tailwind.config.js`
3. Adjust CSS classes in `src/index.css`
4. Update component usage throughout the application 