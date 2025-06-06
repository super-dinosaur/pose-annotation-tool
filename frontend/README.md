# Human Pose Annotation Tool - Refactored

A modern, well-organized React application for annotating human keypoints in videos.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (Header, Sidebar, Footer)
│   └── AnnotationWorkspace.js
├── features/            # Feature-specific modules
│   ├── video/           # Video management
│   │   ├── components/  # VideoUpload, VideoInfo, FrameSlider
│   │   ├── hooks/       # useVideoFrame
│   │   └── services/    # videoService
│   ├── annotation/      # Annotation logic
│   │   ├── components/  # AnnotationCanvas
│   │   └── services/    # annotationService
│   ├── person/          # Person management
│   │   ├── components/  # PersonList, AddPersonModal
│   │   └── services/    # personService
│   └── keypoint/        # Keypoint handling
│       ├── components/  # KeypointList
│       └── services/    # keypointService
├── store/               # State management (React Context)
├── utils/               # Pure utility functions
├── constants/           # Application constants
└── types/               # Type definitions (JSDoc)
```

## ✨ Features

- **Video Upload & Processing**: Support for multiple video formats
- **Multi-Person Annotation**: Add and manage multiple people in videos
- **17 Human Keypoints**: Full body pose annotation
- **Frame Navigation**: Precise frame-by-frame navigation
- **Real-time Visualization**: Live skeleton rendering
- **Data Export/Import**: JSON format for annotations
- **Keyboard Shortcuts**: Efficient workflow
- **Responsive Design**: Works on different screen sizes

## 🎯 Key Improvements

### Code Organization
- **Feature-based structure** instead of flat components
- **Single responsibility** components (< 150 lines each)
- **Separation of concerns** (UI, logic, data)
- **Reusable utilities** and services

### State Management
- **Centralized React Context** with typed actions
- **Predictable state updates** with reducer pattern
- **Clean data flow** throughout the application

### Performance
- **React.memo** for expensive components
- **useCallback/useMemo** for optimization
- **Proper dependency arrays** in effects

### Developer Experience
- **JSDoc types** for better IntelliSense
- **Clear interfaces** and documentation
- **Consistent naming** and patterns
- **Easy testing** with isolated functions

## 🛠️ Architecture

### State Management
The application uses React Context with a reducer pattern for state management:

```javascript
// Access state
const { state, actions } = useAppContext();

// Update state
actions.addAnnotation(frameIndex, personId, keypointId, position);
```

### Component Structure
- **Container Components**: Handle business logic and state
- **Presentational Components**: Pure UI components
- **Service Functions**: Reusable business logic
- **Custom Hooks**: Stateful logic abstraction

### Data Flow
1. User interactions → Actions
2. Actions → Reducer → State updates
3. State updates → Component re-renders
4. Services handle business logic

## 📋 Usage

### Basic Workflow
1. **Upload Video**: Click "Upload Video" and select a video file
2. **Add Person**: Click "Add Person" to create a new person
3. **Select Keypoint**: Choose a keypoint from the list
4. **Annotate**: Click on the canvas to place keypoints
5. **Navigate**: Use frame slider or arrow keys to move between frames
6. **Save**: Export annotations as JSON file

### Keyboard Shortcuts
- `Tab` - Switch between tabs
- `Ctrl+N` - Add new person
- `←/→` - Navigate frames
- `Ctrl+S` - Save annotations

## 🔧 Configuration

### Constants
Modify `src/constants/index.js` for:
- Keypoint definitions
- Visual styling
- Application settings

### Styling
- Component-specific CSS files
- Global styles in `App.css`
- Ant Design theme customization

## 🧪 Testing

The refactored structure makes testing much easier:

```javascript
// Test pure functions
import { generatePersonId } from './utils/annotation';

// Test components in isolation
import { PersonList } from './features/person';

// Test services independently
import { validatePersonName } from './features/person/services';
```

## 📦 Dependencies

### Core
- React 18.2.0
- Ant Design 4.24.14
- React Konva 18.2.10

### Development
- React Scripts 5.0.1
- Web Vitals 2.1.4

## 🚧 Migration from Original

The refactored version maintains the same functionality while improving:
- **Code organization** and maintainability
- **Performance** and user experience
- **Developer experience** and debugging
- **Scalability** for future features

## 🤝 Contributing

1. Follow the established patterns and structure
2. Add JSDoc types for new functions
3. Create unit tests for new features
4. Update documentation as needed

## 📄 License

MIT License - see the original project for details.
