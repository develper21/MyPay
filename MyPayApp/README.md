# MyPay - Personal Payment App

A Google Pay-style personal payment app built with React Native and TypeScript. Features secure authentication, calendar-based transaction history, and bank integration capabilities.

## Features

- 🔐 **Secure Authentication**: Biometric login + secure token storage
- 📱 **Modern UI**: Material Design inspired interface
- 📅 **Calendar History**: Visual transaction history with daily/monthly summaries
- 💳 **Payment Flows**: Send money with confirmation dialogs
- 🔒 **Security**: Local encryption, auto-lock, secure storage
- 📊 **Analytics**: Monthly summaries, category breakdowns
- 🏦 **Bank Integration**: Mock bank adapter ready for real integration

## Tech Stack

- **Frontend**: React Native (TypeScript)
- **State Management**: Redux Toolkit + Redux Persist
- **Navigation**: React Navigation
- **Database**: SQLite with custom service layer
- **Security**: React Native Keychain, Biometrics
- **Calendar**: React Native Calendars
- **Date Handling**: date-fns

## Quick Start

### Prerequisites

- Node.js 16+
- React Native development environment
- Android Studio / Xcode (for iOS)

### Installation

```bash
# Clone and install dependencies
cd MyPayApp
npm install

# iOS only (macOS)
cd ios && pod install && cd ..
```

### Running the App

```bash
# Start Metro
npm start

# Run on Android
npm run android

# Run on iOS (macOS)
npm run ios
```

## Demo Credentials

- **Email**: user@example.com
- **Password**: password

## Project Structure

```
src/
├── api/                     # Bank integration adapters
├── components/ui/           # Reusable UI components
├── features/               # Feature-based modules
│   ├── auth/              # Authentication screens & logic
│   ├── payments/          # Payment flows & bank accounts
│   ├── home/              # Home dashboard
│   └── more/              # Settings & more options
├── history/                # Calendar history & transactions
├── libs/                   # Core libraries
│   ├── db/                # Database service
│   └── encryption.ts      # Encryption utilities
├── navigation/             # App navigation
├── store/                  # Redux store & slices
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## Key Components

### Authentication
- Biometric login support
- Secure token storage via Keychain
- Session timeout handling
- Mock credentials for demo

### Calendar History
- Interactive monthly calendar view
- Daily transaction totals with color coding
- Tap to drill down to daily details
- Monthly summaries with spent/received totals

### Payment System
- Account selection interface
- Payment confirmation modals
- Transaction status tracking
- Mock bank integration ready for production

### Security Features
- Biometric authentication
- Secure keychain storage
- Local data encryption
- Auto-lock after inactivity

## Bank Integration

The app includes a mock bank adapter for development. To integrate with real banking APIs:

1. Replace `MockBankAdapter` with your production implementation
2. Update `BankAdapterFactory` to use production mode
3. Configure your banking API credentials
4. Follow PCI compliance guidelines

## Development

### Adding New Features

1. Create feature module in `src/features/`
2. Add Redux slice for state management
3. Create UI components in `src/components/ui/`
4. Update navigation as needed

### Database Schema

The app uses SQLite with the following main tables:
- `accounts` - User bank accounts
- `transactions` - Payment transactions
- `auth_tokens` - Authentication tokens

### Testing

```bash
# Run unit tests
npm test

# Run linting
npm run lint
```

## Security Considerations

- ✅ Tokens stored in secure keychain
- ✅ Biometric authentication
- ✅ Local data encryption
- ✅ HTTPS communication
- ✅ Session timeout
- ⚠️ Mock bank adapter (replace for production)
- ⚠️ Development encryption (upgrade for production)

## Production Deployment

### Android

```bash
# Generate release build
cd android && ./gradlew assembleRelease
```

### iOS

```bash
# Archive for App Store
xcodebuild -workspace ios/MyPayApp.xcworkspace -scheme MyPayApp -configuration Release archive
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is for personal use and demonstration purposes.

## Support

For issues and questions, please check the troubleshooting section or create an issue.
