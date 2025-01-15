# Sell-App-Discord-Bot

## Setup Guide

> This is a very specific use case discord bot.

### Prerequisites
- Node.js (v16.9.0 or higher)
- npm (Node Package Manager)
- A Discord account
- A Sell.app account
- A Google Cloud account

### Sell-App Discord Bot Future Roadmap
 - [ ] Add commands to change specific row(s) data.
 - [ ] Add account email:pass into spreadsheet information request.
 - [ ] More Webhook capabilites.
 - [ ] Multi-Platform Account Linking.

### Environment Variables Setup
Create a `.env` file in the root directory of your project with the following variables:

```env
DISCORD_TOKEN=
SELLAPP_API_KEY=
CLIENT_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
SPREADSHEET_ID=
PURCHASE_WEBHOOK_URL= *Discord Channel Webhook*
```

### Getting the Required API Keys

#### Discord Bot Token
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section
4. Click "Add Bot"
5. Copy the token using "Reset Token" and "Copy"
6. Enable necessary Privileged Gateway Intents:
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT

#### Sell.app API Key
1. Log in to your [Sell.app Dashboard](https://sell.app/dashboard)
2. Go to Settings → API
3. Generate a new API key
4. Copy the API key and store it safely

#### Google Sheets API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Google Sheets API
4. Create a Service Account:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Fill in the details and create
   - Create a new key (JSON type)
   - Copy the `client_email` and `private_key` from the downloaded JSON
5. Share your Google Sheet with the service account email
6. Copy your spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

## Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Start the bot
node index.js
```

## Commands Documentation

### /accounts
Manages and searches account information stored in Google Sheets.

**Subcommands:**
- `search`: Search accounts with multiple criteria
  - Options: id, username, minhours, maxhours
- `lookup`: Look up specific account by ID
  - Required: id
- `hours`: Find accounts within hour range
  - Required: min, max hours

**Permission Level:** Staff

### /analytics
View detailed analytics from Sell.app.

**Options:**
- `period`: today, week, month, year
- `type`: revenue, orders, products, customers

**Permission Level:** Manager

### /customers
Manage customer information.

**Subcommands:**
- `search`: Search for customers by email
  - Required: email
- `top`: View top customers
  - Optional: limit (1-10)

**Permission Level:** Manager

### /orders
View and manage order information.

**Subcommands:**
- `check`: Check orders
  - Options:
    - type: recent/id
    - orderid (required for ID checks)

**Features:**
- Interactive select menu for recent orders
- Detailed order information display
- Custom fields support

**Permission Level:** Staff

## Permission System

The bot uses a role-based permission system with the following levels:
- ADMIN (Level 3): Server owner, 'owner' role
- MANAGER (Level 2): 'manager' role
- STAFF (Level 1): 'staff' role
- USER (Level 0): Default level

### Role Setup
Create the following roles in your Discord server:
- owner
- manager
- staff

## Error Handling

The bot includes built-in error handling with:
- Error embeds for user-facing errors
- Console logging for debugging
- Ephemeral messages for sensitive information

## API Integration

### Sell.app API
- Base URL: `https://api.sell.app/v1`
- Handles orders, customers, and analytics
- Rate limiting built-in

### Google Sheets Integration
- Uses google-spreadsheet library
- Automatic authentication handling

## Troubleshooting

Common issues and solutions:

1. **Bot doesn't start:**
   - Check if all environment variables are set correctly
   - Verify Discord token is valid
   - Ensure required dependencies are installed

2. **Google Sheets errors:**
   - Verify service account has access to the spreadsheet
   - Check if GOOGLE_PRIVATE_KEY is properly formatted
   - Ensure spreadsheet ID is correct

3. **Permission errors:**
   - Verify role names match exactly (case-sensitive)
   - Check if bot has necessary Discord permissions
   - Confirm command permission levels are set correctly

## Support and Contributing

For support:
1. Check the troubleshooting section
2. Review error logs
3. Open an issue on GitHub
4. Contact @goldb3rg on Discord.

Contributing:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request
