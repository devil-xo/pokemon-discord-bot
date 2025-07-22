# 🤖 Pokemon Discord Bot - Hosting Ready

A comprehensive Pokemon Discord bot with special forms support, ready for deployment on any hosting platform.

## 🚀 Quick Start

### 1. Download & Setup
1. Download all files from the `pokemon-discord-bot-hosting` folder
2. Upload them to your hosting service (Heroku, Railway, Render, etc.)

### 2. Environment Setup
1. Copy `.env.example` to `.env`
2. Add your Discord bot token:
   ```
   DISCORD_BOT_TOKEN=your_actual_bot_token_here
   ```

### 3. Deploy
- **Heroku**: Connect GitHub and deploy
- **Railway**: Import from GitHub
- **Render**: Connect repository and auto-deploy
- **VPS**: Run `npm install && npm start`

## 🔧 Discord Bot Setup

### Create Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Go to "Bot" section
4. Click "Reset Token" and copy the token
5. **IMPORTANT**: Enable "Message Content Intent"

### Bot Permissions
When inviting the bot, ensure these permissions:
- Send Messages
- Read Messages/View Channels
- Embed Links
- Attach Files
- Read Message History
- Use External Emojis
- Add Reactions

### Invite URL Template
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=274878286912&scope=bot
```

## 📱 Bot Features

### Commands
- `!pokemon <name/id>` - Pokemon information with interactive buttons
- `!pokemon eternamax` - Special forms support (Eternamax Eternatus)
- `!compare <pokemon1> <pokemon2>` - Side-by-side Pokemon comparison
- `!random` - Random Pokemon generator
- `!type <type>` - Type information and effectiveness
- `!help` - Command list

### Interactive Features
- **📊 Stats Button**: Base stats with visual bars
- **🧬 Abilities Button**: Pokemon abilities and hidden abilities
- **⚡ Type Chart Button**: Type effectiveness calculator with 4x damage detection

### Special Forms Supported
- Eternamax Eternatus (`!pokemon eternamax`)
- Mega Evolutions (`!pokemon mega charizard x`)
- Primal Forms (`!pokemon primal kyogre`)
- Regional Variants (`!pokemon alolan raichu`)
- Origin Forms (`!pokemon origin giratina`)
- Gigantamax Forms (`!pokemon gmax charizard`)

## 🏗️ Hosting Platforms

### Heroku
1. Create new app
2. Connect GitHub repository
3. Add `DISCORD_BOT_TOKEN` in Config Vars
4. Deploy

### Railway
1. Import GitHub repository
2. Add `DISCORD_BOT_TOKEN` environment variable
3. Deploy automatically

### Render
1. Connect GitHub repository
2. Set environment variables
3. Auto-deploy on push

### VPS/Cloud Server
```bash
# Install dependencies
npm install

# Start bot
npm start

# Or with PM2 for process management
npm install -g pm2
pm2 start bot.js --name pokemon-bot
```

## 🔍 Troubleshooting

### Bot Not Responding
1. Check bot is online in Discord server member list
2. Verify "Message Content Intent" is enabled
3. Ensure bot has permissions in the channel
4. Check hosting logs for errors

### "Pokemon not found" Errors
- Bot is working correctly, try different Pokemon names
- Use Pokemon ID numbers for guaranteed results
- Check spelling (use lowercase, hyphens for forms)

### Environment Variables
- Ensure `.env` file exists and contains correct token
- For hosting platforms, set environment variables in dashboard
- Never commit `.env` file to GitHub

## 📊 Performance

- **Caching**: Pokemon data cached to reduce API calls
- **Rate Limiting**: Built-in protection for PokeAPI
- **Error Handling**: Comprehensive error recovery
- **Uptime**: Automatic keep-alive system
- **Memory**: Efficient data storage and cleanup

## 🛠️ Technical Details

- **Node.js**: v16+ required
- **Dependencies**: discord.js, axios, dotenv
- **API**: PokeAPI integration
- **Database**: None required (uses memory caching)
- **Uptime**: Built-in keep-alive logging

## 📄 License

MIT License - Free to use and modify.

---

## 🎯 Ready to Deploy!

Your bot is production-ready with:
- ✅ Proper error handling
- ✅ Memory management
- ✅ Rate limiting protection
- ✅ Comprehensive logging
- ✅ Graceful shutdown handling
- ✅ Keep-alive system for 24/7 operation

Upload these files to your hosting service and your Pokemon bot will be live!