# EcoRoute AI Frontend

A modern, responsive web application for eco-friendly route planning with real-time traffic and environmental impact analysis.

## 🚀 Features

### Modern UI/UX
- **Clean, Professional Design**: Modern card-based layout with consistent spacing and typography
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive Elements**: Hover effects, smooth transitions, and loading states
- **Accessibility**: Proper focus states, keyboard navigation, and screen reader support

### Enhanced Route Planning
- **Multiple Transport Modes**: Car, bike, truck, and motorcycle options
- **Vehicle Type Selection**: Specific vehicle types for accurate emissions calculation
- **Traffic Conditions**: Normal, highway, urban, rural, and congested traffic options
- **Cargo Weight**: For truck routes, specify cargo weight for precise calculations

### Route Visualization
- **Interactive Map**: Click on routes to see detailed information
- **Route Comparison**: Side-by-side comparison of eco-friendly, fastest, and alternative routes
- **Environmental Impact**: Real-time CO₂ emissions calculation and eco-scoring
- **Turn-by-turn Directions**: Detailed navigation instructions

### Environmental Analysis
- **Eco Scoring**: A+ to E rating system for environmental impact
- **Emissions Tracking**: CO₂ emissions per kilometer and total trip
- **Impact Factors**: Traffic, weather, and cargo impact analysis
- **Fuel Consumption**: Estimated fuel usage for combustion vehicles

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6) for main actions and branding
- **Success**: Green (#10b981) for eco-friendly elements
- **Warning**: Orange (#f59e0b) for cautionary information
- **Danger**: Red (#ef4444) for errors and high emissions
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font**: Inter (Google Fonts) for modern, readable typography
- **Weights**: 300, 400, 500, 600, 700 for proper hierarchy
- **Sizes**: Responsive text sizing for different screen sizes

### Components
- **Cards**: Consistent card design with headers, bodies, and footers
- **Buttons**: Primary, secondary, and success button variants
- **Forms**: Styled inputs and selects with proper focus states
- **Badges**: Status indicators with appropriate colors
- **Loading States**: Spinner components for better UX

## 🛠️ Technical Stack

- **React**: Modern React with hooks and functional components
- **Leaflet**: Interactive mapping library
- **CSS**: Custom CSS with CSS variables for consistent theming
- **Error Handling**: Error boundaries for graceful error handling
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox

## 📱 Responsive Features

- **Desktop**: Full-featured interface with sidebar and detailed controls
- **Tablet**: Optimized layout with collapsible sections
- **Mobile**: Touch-friendly interface with simplified controls

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: WCAG AA compliant color combinations
- **Error Handling**: Clear error messages and recovery options

## 🎯 User Experience

### Loading States
- Spinner animations during route calculation
- Progress indicators for long operations
- Disabled states for buttons during processing

### Error Handling
- Graceful error boundaries for unexpected issues
- Clear error messages with recovery options
- Network error handling with retry mechanisms

### Visual Feedback
- Hover effects on interactive elements
- Smooth transitions between states
- Color-coded route types and eco scores
- Progress bars for emissions visualization

## 🔧 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 📦 Build

To create a production build:

```bash
npm run build
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📄 License

This project is part of the EcoRoute AI system for sustainable transportation planning.
