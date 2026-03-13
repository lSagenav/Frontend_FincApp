## Logic & Core Functionalities (Backend-Frontend Bridge)

The application's core logic is handled through a modular JavaScript architecture, ensuring scalability and clean code standards.

### Key Modules:
1. **Activity Logger (`activities.js`)**: 
   - Implements an "Offline First" strategy. 
   - Manages a daily log for livestock events (births, health issues, etc.).
   - Uses `LocalStorage` as a failover mechanism if the primary API is unreachable.

2. **Core Calculations (`calculations.js`)**:
   - **Average Daily Gain (ADG/GDP)**: Automated mathematical tracking of animal growth performance.
   - **Sanitary Traffic Light System**: Dynamic logic that categorizes health alerts into *Success, Warning, or Danger* based on vaccine expiration dates.

3. **Voice Command Assistant (`voice-logic.js`)**:
   - Integrated **Web Speech API** to allow hands-free data entry in field conditions.
   - Parses natural language to extract Animal IDs and weight values automatically.

4. **API Service (`api.js`)**:
   - Centralized handler for `Async/Await` fetch requests.
   - Standardizes communication between the UI and the SQL database.