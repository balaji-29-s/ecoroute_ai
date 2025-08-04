# 🌱 EcoRoute AI - Smart Navigation System

A comprehensive smart navigation system that calculates eco-friendly routes while considering emissions, weather conditions, and traffic patterns. Built with React frontend and FastAPI backend.

## 🚀 Features

### Core Functionality
- **Multi-Modal Route Planning**: Support for car, bike, and truck routes
- **Eco-Score Calculation**: Real-time emissions calculation with environmental impact scoring
- **Weather Integration**: Route optimization based on current weather conditions
- **Traffic-Aware Routing**: Considers traffic conditions for optimal route selection
- **Interactive Map Interface**: Built with Leaflet.js for smooth user experience
- **Vehicle-Specific Calculations**: Different emission factors for various vehicle types

### Advanced Features
- **Alternative Routes**: Multiple route options with different eco-scores
- **Real-time Weather Data**: Integration with OpenWeatherMap API
- **Cargo Weight Consideration**: Emissions calculation includes cargo weight
- **Responsive Design**: Modern UI with Tailwind CSS
- **API Documentation**: Auto-generated FastAPI documentation

## 🏗️ Architecture

```
ecorouteAi/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Map.js       # Interactive map component
│   │   │   └── Sidebar.js   # Route controls and info
│   │   ├── App.js           # Main application
│   │   └── api.js           # API communication
│   └── public/              # Static assets
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── core/            # Core business logic
│   │   │   └── emissions.py # Emissions calculation
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── utils/           # Utility functions
│   │   │   └── external_apis.py # External API integration
│   │   ├── main.py          # FastAPI application
│   │   └── config.py        # Configuration
│   ├── run.py               # Application entry point
│   └── requirements.txt     # Python dependencies
└── database/                # Database files
    └── init.sql            # Database initialization
```

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** - Modern React with hooks
- **Leaflet.js** - Interactive maps
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Framer Motion** - Animation library

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy** - Database ORM
- **Pydantic** - Data validation
- **httpx** - Async HTTP client

### External APIs
- **OpenRouteService** - Route calculation
- **OpenWeatherMap** - Weather data

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ecorouteAi
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (optional)
# Create backend/app/.env file with:
# ORS_API_KEY=your_openrouteservice_api_key
# OWM_API_KEY=your_openweathermap_api_key

# Run the backend
python run.py
```

The backend will start on `http://localhost:8000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will start on `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in `backend/app/` directory:

```env
# API Keys (Optional - app works with mock data if not provided)
ORS_API_KEY=your_openrouteservice_api_key_here
OWM_API_KEY=your_openweathermap_api_key_here
```

### Getting API Keys

1. **OpenRouteService API Key**:
   - Visit [https://openrouteservice.org/](https://openrouteservice.org/)
   - Sign up for a free account
   - Get your API key from the dashboard

2. **OpenWeatherMap API Key**:
   - Visit [https://openweathermap.org/](https://openweathermap.org/)
   - Sign up for a free account
   - Get your API key from the dashboard

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### Health Check
```http
GET /
```
Returns server status.

#### Route Calculation
```http
POST /api/routes/calculate
```

**Request Body:**
```json
{
  "origin": [51.5, -0.1],
  "destination": [51.52, -0.12],
  "mode": "car",
  "vehicle_type": "petrol",
  "traffic_condition": "normal",
  "cargo_weight_kg": 0
}
```

**Response:**
```json
{
  "success": true,
  "routes": [
    {
      "distance_km": 2.5,
      "duration_hr": 0.1,
      "geometry": [[lng, lat], ...],
      "instructions": [...],
      "emissions": {
        "total_g": 450.2,
        "total_kg": 0.45,
        "co2_g": 420.1,
        "nox_g": 15.3,
        "pm_g": 14.8
      },
      "eco_score": "A",
      "weather": {
        "temperature": 22.5,
        "description": "clear sky"
      },
      "type": "eco"
    }
  ]
}
```

### Auto-Generated Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.

## 🎯 Usage

### Using the Web Interface

1. **Open the Application**: Navigate to `http://localhost:3000`
2. **Set Origin and Destination**: Use the sidebar to input coordinates
3. **Choose Vehicle Type**: Select from petrol, diesel, hybrid, electric, etc.
4. **Set Traffic Conditions**: Choose from normal, congested, highway, urban
5. **Add Cargo Weight**: Enter cargo weight in kg (for trucks)
6. **Calculate Routes**: Click "Calculate Route" to get eco-friendly options
7. **View Results**: Routes are displayed on the map with color coding:
   - 🟢 Green: Eco-friendly route
   - 🔵 Blue: Fastest route
   - ⚫ Gray: Alternative route

### Route Types

- **Eco Route**: Lowest emissions, may take longer
- **Fastest Route**: Shortest time, may have higher emissions
- **Alternative Route**: Balanced option

### Eco Score System

- **A**: Excellent (0-100g CO2/km)
- **B**: Good (100-200g CO2/km)
- **C**: Average (200-300g CO2/km)
- **D**: Poor (300-400g CO2/km)
- **E**: Very Poor (400g+ CO2/km)

## 🔍 Development

### Project Structure

#### Frontend Components
- `Map.js`: Interactive map with route visualization
- `Sidebar.js`: Route controls and information display
- `App.js`: Main application component

#### Backend Modules
- `emissions.py`: Emissions calculation algorithms
- `external_apis.py`: External API integration
- `main.py`: FastAPI application and endpoints

### Adding New Features

1. **New Vehicle Types**: Add to `backend/app/core/emissions.py`
2. **New Route Modes**: Update `backend/app/utils/external_apis.py`
3. **UI Components**: Create in `frontend/src/components/`
4. **API Endpoints**: Add to `backend/app/main.py`

### Testing

#### Backend Tests
```bash
cd backend
python -m pytest
```

#### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Build

#### Frontend
```bash
cd frontend
npm run build
```

#### Backend
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Docker Deployment

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ORS_API_KEY=${ORS_API_KEY}
      - OWM_API_KEY=${OWM_API_KEY}
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenRouteService](https://openrouteservice.org/) for route calculation
- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [Leaflet](https://leafletjs.com/) for interactive maps
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `http://localhost:8000/docs`

---

**Made with ❤️ for a greener future** 