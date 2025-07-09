# Contributing to Data Analyzer AI

Thank you for your interest in contributing to Data Analyzer AI! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### 🐛 Reporting Bugs

1. **Search existing issues** to avoid duplicates
2. **Use the bug report template**
3. **Provide detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, versions)

### 💡 Suggesting Features

1. **Check if the feature already exists** or is planned
2. **Use the feature request template**
3. **Provide clear use cases** and benefits
4. **Consider the scope** and complexity

### 🛠️ Development Setup

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/Data-Analyzer-AI.git
   cd Data-Analyzer-AI
   ```

3. **Set up the backend**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Set up the frontend**:
   ```bash
   cd ..  # Back to root
   npm install
   ```

5. **Start development servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   uvicorn main:app --reload

   # Terminal 2 - Frontend
   npm run dev
   ```

### 📝 Code Style

#### Frontend (React/JavaScript)
- Use **functional components** with hooks
- Follow **React best practices**
- Use **Tailwind CSS** for styling
- Write **meaningful component names**
- Add **PropTypes** or TypeScript types

#### Backend (Python)
- Follow **PEP 8** style guide
- Use **type hints** for function parameters and returns
- Write **descriptive docstrings**
- Use **meaningful variable names**
- Follow **FastAPI conventions**

#### General Guidelines
- Write **clear, self-documenting code**
- Add **comments for complex logic**
- Use **consistent naming conventions**
- Keep **functions small and focused**

### 🧪 Testing

#### Frontend Tests
```bash
npm run test
```

#### Backend Tests
```bash
cd backend
pytest
```

#### E2E Tests
```bash
npm run test:e2e
```

### 📦 Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**:
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test thoroughly**:
   - Run all existing tests
   - Test your changes manually
   - Ensure no regressions

4. **Commit with descriptive messages**:
   ```bash
   git commit -m "feat: add amazing new feature

   - Add component for feature X
   - Implement API endpoint for Y
   - Update documentation
   
   Closes #123"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**:
   - Use the PR template
   - Link related issues
   - Provide clear description
   - Add screenshots if UI changes

### 📋 Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added for new functionality
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] PR description is clear

## 🎯 Development Guidelines

### 🏗️ Architecture Principles

- **Separation of Concerns**: Keep frontend and backend separate
- **Component Reusability**: Create reusable React components
- **API Design**: Follow RESTful principles
- **Error Handling**: Implement comprehensive error handling
- **Performance**: Optimize for speed and efficiency

### 📂 File Organization

```
src/
├── components/          # Reusable UI components
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── pages/              # Page components
└── styles/             # Global styles

backend/
├── models/             # Data models and business logic
├── utils/              # Utility functions
├── tests/              # Test files
└── main.py             # Application entry point
```

### 🔧 Adding New Features

1. **Plan the feature**:
   - Define requirements
   - Design the API (if needed)
   - Plan the UI/UX

2. **Backend first** (if applicable):
   - Add new endpoints
   - Implement business logic
   - Write tests

3. **Frontend implementation**:
   - Create components
   - Integrate with API
   - Add styling

4. **Testing and refinement**:
   - Test thoroughly
   - Refine based on feedback
   - Update documentation

## 🐛 Debugging

### Common Issues

#### Backend
- **Import errors**: Check virtual environment activation
- **Port conflicts**: Ensure port 8000 is available
- **API key issues**: Verify OpenRouter API key setup

#### Frontend
- **Module not found**: Run `npm install`
- **Port conflicts**: Change port in vite.config.js
- **Build errors**: Check for syntax errors and missing dependencies

### Debug Tools

- **Browser DevTools**: For frontend debugging
- **FastAPI docs**: Visit `/docs` for API testing
- **Python debugger**: Use `pdb` or IDE debugger
- **Network tab**: Check API requests/responses

## 📖 Documentation

### README Updates
- Keep installation instructions current
- Update feature lists
- Add new examples

### Code Documentation
- Document complex functions
- Update API documentation
- Add inline comments for clarity

### User Documentation
- Update user guides
- Add new feature explanations
- Create video tutorials (if applicable)

## 🌟 Best Practices

### Code Quality
- **DRY (Don't Repeat Yourself)**: Avoid code duplication
- **SOLID principles**: Follow object-oriented design principles
- **Clean code**: Write readable, maintainable code
- **Error handling**: Handle edge cases gracefully

### Git Workflow
- **Atomic commits**: One logical change per commit
- **Descriptive messages**: Clear commit messages
- **Feature branches**: Use branches for features
- **Regular pushes**: Push work frequently

### Collaboration
- **Communicate early**: Discuss major changes
- **Ask questions**: Don't hesitate to ask for help
- **Review thoroughly**: Provide constructive feedback
- **Be respectful**: Maintain a positive environment

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Email**: Contact the maintainer directly
- **Documentation**: Check existing documentation first

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributor section
- Release notes
- Annual contributor highlights

Thank you for contributing to Data Analyzer AI! 🚀
