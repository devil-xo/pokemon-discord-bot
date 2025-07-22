const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

// Type colors for embeds
const typeColors = {
  normal: 0xA8A878,
  fire: 0xF08030,
  water: 0x6890F0,
  electric: 0xF8D030,
  grass: 0x78C850,
  ice: 0x98D8D8,
  fighting: 0xC03028,
  poison: 0xA040A0,
  ground: 0xE0C068,
  flying: 0xA890F0,
  psychic: 0xF85888,
  bug: 0xA8B820,
  rock: 0xB8A038,
  ghost: 0x705898,
  dragon: 0x7038F8,
  dark: 0x705848,
  steel: 0xB8B8D0,
  fairy: 0xEE99AC,
};

// Type effectiveness multipliers
const typeChart = {
  normal: { weak: ['fighting'], resist: [], immune: ['ghost'] },
  fire: { weak: ['water', 'ground', 'rock'], resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immune: [] },
  water: { weak: ['electric', 'grass'], resist: ['fire', 'water', 'ice', 'steel'], immune: [] },
  electric: { weak: ['ground'], resist: ['electric', 'flying', 'steel'], immune: [] },
  grass: { weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resist: ['water', 'electric', 'grass', 'ground'], immune: [] },
  ice: { weak: ['fire', 'fighting', 'rock', 'steel'], resist: ['ice'], immune: [] },
  fighting: { weak: ['flying', 'psychic', 'fairy'], resist: ['bug', 'rock', 'dark'], immune: [] },
  poison: { weak: ['ground', 'psychic'], resist: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immune: [] },
  ground: { weak: ['water', 'grass', 'ice'], resist: ['poison', 'rock'], immune: ['electric'] },
  flying: { weak: ['electric', 'ice', 'rock'], resist: ['grass', 'fighting', 'bug'], immune: ['ground'] },
  psychic: { weak: ['bug', 'ghost', 'dark'], resist: ['fighting', 'psychic'], immune: [] },
  bug: { weak: ['fire', 'flying', 'rock'], resist: ['grass', 'fighting', 'ground'], immune: [] },
  rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resist: ['normal', 'fire', 'poison', 'flying'], immune: [] },
  ghost: { weak: ['ghost', 'dark'], resist: ['poison', 'bug'], immune: ['normal', 'fighting'] },
  dragon: { weak: ['ice', 'dragon', 'fairy'], resist: ['fire', 'water', 'electric', 'grass'], immune: [] },
  dark: { weak: ['fighting', 'bug', 'fairy'], resist: ['ghost', 'dark'], immune: ['psychic'] },
  steel: { weak: ['fire', 'fighting', 'ground'], resist: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immune: ['poison'] },
  fairy: { weak: ['poison', 'steel'], resist: ['fighting', 'bug', 'dark'], immune: ['dragon'] },
};

// Cache for Pokemon data
const pokemonCache = new Map();
const typeCache = new Map();

// Special form mappings for alternate forms
const specialForms = {
  'eternamax': 'eternatus-eternamax',
  'eternatus-eternamax': 'eternatus-eternamax',
  'mega-charizard-x': 'charizard-mega-x',
  'mega-charizard-y': 'charizard-mega-y',
  'primal-kyogre': 'kyogre-primal',
  'primal-groudon': 'groudon-primal',
  'origin-dialga': 'dialga-origin',
  'origin-palkia': 'palkia-origin',
  'origin-giratina': 'giratina-origin',
  'sky-shaymin': 'shaymin-sky',
  'gmax-charizard': 'charizard-gmax',
  'gmax-pikachu': 'pikachu-gmax',
  'alolan-raichu': 'raichu-alola',
  'galarian-rapidash': 'rapidash-galar',
  'hisuian-decidueye': 'decidueye-hisui',
  'paldean-tauros': 'tauros-paldea-combat',
};

// Utility functions
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatName(name) {
  return name.split('-').map(capitalizeFirst).join(' ');
}

function getTypeColor(types) {
  const primaryType = types[0].type.name;
  return typeColors[primaryType] || 0x000000;
}

function formatHeight(height) {
  const meters = height / 10;
  const feet = Math.floor(meters * 3.28084);
  const inches = Math.round((meters * 3.28084 - feet) * 12);
  return `${meters}m (${feet}'${inches}")`;
}

function formatWeight(weight) {
  const kg = weight / 10;
  const lbs = Math.round(kg * 2.20462);
  return `${kg}kg (${lbs} lbs)`;
}

// API functions
async function fetchPokemon(identifier) {
  const cacheKey = identifier.toLowerCase();
  if (pokemonCache.has(cacheKey)) {
    return pokemonCache.get(cacheKey);
  }

  try {
    let pokemonName = identifier.toLowerCase().replace(/\s+/g, '-');
    
    // Check for special forms
    if (specialForms[pokemonName]) {
      pokemonName = specialForms[pokemonName];
    }

    const response = await axios.get(`${POKEAPI_BASE}/pokemon/${pokemonName}`);
    const pokemon = response.data;
    
    // Get species data for additional info
    const speciesResponse = await axios.get(pokemon.species.url);
    const species = speciesResponse.data;
    
    const pokemonData = {
      ...pokemon,
      species: species
    };
    
    pokemonCache.set(cacheKey, pokemonData);
    return pokemonData;
  } catch (error) {
    console.error(`Error fetching Pokemon ${identifier}:`, error.message);
    return null;
  }
}

async function fetchTypeInfo(typeName) {
  const cacheKey = typeName.toLowerCase();
  if (typeCache.has(cacheKey)) {
    return typeCache.get(cacheKey);
  }

  try {
    const response = await axios.get(`${POKEAPI_BASE}/type/${typeName.toLowerCase()}`);
    const typeData = response.data;
    typeCache.set(cacheKey, typeData);
    return typeData;
  } catch (error) {
    console.error(`Error fetching type ${typeName}:`, error.message);
    return null;
  }
}

// Type effectiveness calculation
function calculateTypeEffectiveness(defendingTypes) {
  const effectiveness = {};
  const allTypes = Object.keys(typeChart);
  
  allTypes.forEach(attackingType => {
    let multiplier = 1;
    
    defendingTypes.forEach(defType => {
      const defTypeName = defType.type.name;
      const chart = typeChart[defTypeName];
      
      if (chart.immune.includes(attackingType)) {
        multiplier = 0;
      } else if (chart.weak.includes(attackingType)) {
        multiplier *= 2;
      } else if (chart.resist.includes(attackingType)) {
        multiplier *= 0.5;
      }
    });
    
    effectiveness[attackingType] = multiplier;
  });
  
  return effectiveness;
}

// Embed builders
function createPokemonEmbed(pokemon) {
  const types = pokemon.types.map(t => capitalizeFirst(t.type.name)).join(' / ');
  const abilities = pokemon.abilities.map(a => capitalizeFirst(a.ability.name.replace('-', ' '))).join(', ');
  
  const embed = new EmbedBuilder()
    .setTitle(`${formatName(pokemon.name)} #${pokemon.id}`)
    .setColor(getTypeColor(pokemon.types))
    .setThumbnail(pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default)
    .addFields(
      { name: 'Type', value: types, inline: true },
      { name: 'Height', value: formatHeight(pokemon.height), inline: true },
      { name: 'Weight', value: formatWeight(pokemon.weight), inline: true },
      { name: 'Abilities', value: abilities, inline: false }
    );

  if (pokemon.species && pokemon.species.flavor_text_entries) {
    const englishEntry = pokemon.species.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    if (englishEntry) {
      embed.setDescription(englishEntry.flavor_text.replace(/\f/g, ' '));
    }
  }

  return embed;
}

function createStatsEmbed(pokemon) {
  const stats = pokemon.stats.map(stat => {
    const statName = stat.stat.name.replace('-', ' ').replace('special', 'sp.');
    const value = stat.base_stat;
    const bar = '█'.repeat(Math.floor(value / 10)) + '░'.repeat(Math.max(0, 15 - Math.floor(value / 10)));
    return `**${capitalizeFirst(statName)}**: ${value}\n\`${bar}\``;
  }).join('\n\n');

  const total = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

  return new EmbedBuilder()
    .setTitle(`${formatName(pokemon.name)} - Base Stats`)
    .setColor(getTypeColor(pokemon.types))
    .setDescription(stats)
    .addFields({ name: 'Total', value: total.toString(), inline: true })
    .setThumbnail(pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default);
}

function createTypeEffectivenessEmbed(pokemon) {
  const effectiveness = calculateTypeEffectiveness(pokemon.types);
  
  const superEffective = [];
  const notVeryEffective = [];
  const noEffect = [];
  const quadruple = [];
  const quarter = [];
  
  Object.entries(effectiveness).forEach(([type, multiplier]) => {
    if (multiplier === 4) quadruple.push(capitalizeFirst(type));
    else if (multiplier === 2) superEffective.push(capitalizeFirst(type));
    else if (multiplier === 0.5) notVeryEffective.push(capitalizeFirst(type));
    else if (multiplier === 0.25) quarter.push(capitalizeFirst(type));
    else if (multiplier === 0) noEffect.push(capitalizeFirst(type));
  });

  const embed = new EmbedBuilder()
    .setTitle(`${formatName(pokemon.name)} - Type Effectiveness`)
    .setColor(getTypeColor(pokemon.types))
    .setThumbnail(pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default);

  if (quadruple.length > 0) {
    embed.addFields({ name: '4x Weak to', value: quadruple.join(', '), inline: false });
  }
  if (superEffective.length > 0) {
    embed.addFields({ name: '2x Weak to', value: superEffective.join(', '), inline: false });
  }
  if (notVeryEffective.length > 0) {
    embed.addFields({ name: '½x Resists', value: notVeryEffective.join(', '), inline: false });
  }
  if (quarter.length > 0) {
    embed.addFields({ name: '¼x Resists', value: quarter.join(', '), inline: false });
  }
  if (noEffect.length > 0) {
    embed.addFields({ name: 'Immune to', value: noEffect.join(', '), inline: false });
  }

  return embed;
}

function createAbilitiesEmbed(pokemon) {
  const abilitiesText = pokemon.abilities.map(abilityData => {
    const name = capitalizeFirst(abilityData.ability.name.replace('-', ' '));
    const isHidden = abilityData.is_hidden ? ' (Hidden)' : '';
    return `**${name}${isHidden}**`;
  }).join('\n');

  return new EmbedBuilder()
    .setTitle(`${formatName(pokemon.name)} - Abilities`)
    .setColor(getTypeColor(pokemon.types))
    .setDescription(abilitiesText)
    .setThumbnail(pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default);
}

function createComparisonEmbed(pokemon1, pokemon2) {
  const embed = new EmbedBuilder()
    .setTitle(`${formatName(pokemon1.name)} vs ${formatName(pokemon2.name)}`)
    .setColor(0x7289DA);

  const stats1 = pokemon1.stats.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {});

  const stats2 = pokemon2.stats.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {});

  const comparison = Object.keys(stats1).map(statName => {
    const stat1 = stats1[statName];
    const stat2 = stats2[statName];
    const winner = stat1 > stat2 ? '🥇' : stat1 < stat2 ? '🥈' : '🤝';
    const displayName = capitalizeFirst(statName.replace('-', ' ').replace('special', 'sp.'));
    return `${displayName}: ${stat1} ${winner} ${stat2}`;
  }).join('\n');

  embed.addFields(
    { name: formatName(pokemon1.name), value: `Type: ${pokemon1.types.map(t => capitalizeFirst(t.type.name)).join('/')}\nTotal: ${Object.values(stats1).reduce((a, b) => a + b, 0)}`, inline: true },
    { name: 'vs', value: comparison, inline: true },
    { name: formatName(pokemon2.name), value: `Type: ${pokemon2.types.map(t => capitalizeFirst(t.type.name)).join('/')}\nTotal: ${Object.values(stats2).reduce((a, b) => a + b, 0)}`, inline: true }
  );

  return embed;
}

function createActionRow() {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('stats')
        .setLabel('Stats')
        .setEmoji('📊')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('abilities')
        .setLabel('Abilities')
        .setEmoji('🧬')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('type-chart')
        .setLabel('Type Chart')
        .setEmoji('⚡')
        .setStyle(ButtonStyle.Secondary)
    );
}

// Event handlers
client.once('ready', () => {
  console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  
  // Set bot status
  client.user.setPresence({
    activities: [{ name: '!help for commands', type: 0 }],
    status: 'online',
  });
  
  // Keep bot alive
  setInterval(() => {
    console.log(`[${new Date().toISOString()}] Bot is alive - Serving ${client.guilds.cache.size} servers`);
  }, 300000); // Log every 5 minutes
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    switch (command) {
      case 'help':
        const helpEmbed = new EmbedBuilder()
          .setTitle('🤖 Pokemon Bot Commands')
          .setColor(0x3498DB)
          .setDescription('Here are all the available commands:')
          .addFields(
            { name: '!pokemon <name/id>', value: 'Get information about a Pokemon\nExample: `!pokemon pikachu` or `!pokemon eternamax`', inline: false },
            { name: '!compare <pokemon1> <pokemon2>', value: 'Compare two Pokemon stats\nExample: `!compare pikachu raichu`', inline: false },
            { name: '!random', value: 'Get a random Pokemon', inline: false },
            { name: '!type <type>', value: 'Get information about a Pokemon type\nExample: `!type fire`', inline: false },
            { name: '!help', value: 'Show this help message', inline: false }
          )
          .setFooter({ text: 'Special forms supported: eternamax, mega evolutions, regional variants, and more!' });
        
        await message.reply({ embeds: [helpEmbed] });
        break;

      case 'pokemon':
        if (!args[0]) {
          await message.reply('Please specify a Pokemon name or ID! Example: `!pokemon pikachu`');
          return;
        }

        const query = args.join(' ');
        const pokemon = await fetchPokemon(query);
        
        if (!pokemon) {
          await message.reply(`Pokemon "${query}" not found! Try checking the spelling or use a Pokemon ID.`);
          return;
        }

        const embed = createPokemonEmbed(pokemon);
        const row = createActionRow();

        const response = await message.reply({ embeds: [embed], components: [row] });
        
        // Store pokemon data for button interactions
        client.pokemonData = client.pokemonData || new Map();
        client.pokemonData.set(response.id, pokemon);
        break;

      case 'compare':
        if (args.length < 2) {
          await message.reply('Please specify two Pokemon to compare! Example: `!compare pikachu raichu`');
          return;
        }

        const pokemon1Name = args[0];
        const pokemon2Name = args.slice(1).join(' ');

        const [pokemon1, pokemon2] = await Promise.all([
          fetchPokemon(pokemon1Name),
          fetchPokemon(pokemon2Name)
        ]);

        if (!pokemon1) {
          await message.reply(`Pokemon "${pokemon1Name}" not found!`);
          return;
        }
        if (!pokemon2) {
          await message.reply(`Pokemon "${pokemon2Name}" not found!`);
          return;
        }

        const comparisonEmbed = createComparisonEmbed(pokemon1, pokemon2);
        await message.reply({ embeds: [comparisonEmbed] });
        break;

      case 'random':
        const randomId = Math.floor(Math.random() * 1010) + 1; // Pokemon IDs 1-1010
        const randomPokemon = await fetchPokemon(randomId.toString());
        
        if (randomPokemon) {
          const randomEmbed = createPokemonEmbed(randomPokemon);
          const randomRow = createActionRow();
          const randomResponse = await message.reply({ embeds: [randomEmbed], components: [randomRow] });
          
          client.pokemonData = client.pokemonData || new Map();
          client.pokemonData.set(randomResponse.id, randomPokemon);
        } else {
          await message.reply('Failed to fetch a random Pokemon. Please try again!');
        }
        break;

      case 'type':
        if (!args[0]) {
          await message.reply('Please specify a type! Example: `!type fire`');
          return;
        }

        const typeName = args[0].toLowerCase();
        const typeInfo = await fetchTypeInfo(typeName);
        
        if (!typeInfo) {
          await message.reply(`Type "${typeName}" not found!`);
          return;
        }

        const typeEmbed = new EmbedBuilder()
          .setTitle(`${capitalizeFirst(typeName)} Type`)
          .setColor(typeColors[typeName] || 0x000000)
          .addFields(
            {
              name: 'Super effective against',
              value: typeInfo.damage_relations.double_damage_to.map(t => capitalizeFirst(t.name)).join(', ') || 'None',
              inline: false
            },
            {
              name: 'Not very effective against',
              value: typeInfo.damage_relations.half_damage_to.map(t => capitalizeFirst(t.name)).join(', ') || 'None',
              inline: false
            },
            {
              name: 'No effect against',
              value: typeInfo.damage_relations.no_damage_to.map(t => capitalizeFirst(t.name)).join(', ') || 'None',
              inline: false
            }
          );

        await message.reply({ embeds: [typeEmbed] });
        break;

      default:
        await message.reply(`Unknown command! Use \`!help\` to see available commands.`);
    }
  } catch (error) {
    console.error('Error handling command:', error);
    await message.reply('An error occurred while processing your command. Please try again!');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  try {
    client.pokemonData = client.pokemonData || new Map();
    const pokemon = client.pokemonData.get(interaction.message.id);
    
    if (!pokemon) {
      await interaction.reply({ content: 'Pokemon data not found! Please use the command again.', ephemeral: true });
      return;
    }

    let embed;
    switch (interaction.customId) {
      case 'stats':
        embed = createStatsEmbed(pokemon);
        break;
      case 'abilities':
        embed = createAbilitiesEmbed(pokemon);
        break;
      case 'type-chart':
        embed = createTypeEffectivenessEmbed(pokemon);
        break;
      default:
        await interaction.reply({ content: 'Unknown button!', ephemeral: true });
        return;
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error('Error handling interaction:', error);
    await interaction.reply({ content: 'An error occurred while processing your request!', ephemeral: true });
  }
});

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

// Login to Discord
if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN environment variable is required!');
  console.error('Please create a .env file with your bot token.');
  process.exit(1);
}

client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
  console.error('❌ Failed to login to Discord:', error.message);
  if (error.message.includes('disallowed intents')) {
    console.error('\n🔧 Fix: Enable "Message Content Intent" in Discord Developer Portal');
    console.error('1. Go to https://discord.com/developers/applications');
    console.error('2. Select your bot application');
    console.error('3. Go to "Bot" section');
    console.error('4. Enable "Message Content Intent"');
  }
  process.exit(1);
});