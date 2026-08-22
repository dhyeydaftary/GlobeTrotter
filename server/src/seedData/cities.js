// Curated seed cities. Descriptions are hand-written to be distinct and
// keyword-rich — this text is what Tanish's AI service embeds, so quality
// here directly drives recommendation quality. costIndex is 1 (cheap) to
// 5 (expensive), relative and seeded, not a live metric (see
// 00_PDF_REQUIREMENT_ANALYSIS.md §4 for that assumption).

module.exports = [
  // India
  { name: 'Goa', country: 'India', region: 'West India', description: 'Beaches, nightlife, seafood shacks, Portuguese colonial heritage, water sports and beach parties.', costIndex: 2, popularityScore: 95 },
  { name: 'Jaipur', country: 'India', region: 'North India', description: 'The Pink City — forts, palaces, desert culture, bazaars, royal heritage and street food.', costIndex: 2, popularityScore: 88 },
  { name: 'Manali', country: 'India', region: 'North India', description: 'Himalayan mountains, hiking, adventure sports, cool climate, river rafting and snow trekking.', costIndex: 2, popularityScore: 84 },
  { name: 'Udaipur', country: 'India', region: 'North India', description: 'City of Lakes — romantic palaces, lake views, boat rides, royal architecture and sunset views.', costIndex: 3, popularityScore: 80 },
  { name: 'Mumbai', country: 'India', region: 'West India', description: 'Bustling metropolis, Bollywood, street food, colonial architecture, nightlife and coastal promenades.', costIndex: 4, popularityScore: 90 },
  { name: 'Rishikesh', country: 'India', region: 'North India', description: 'Yoga capital, river rafting on the Ganges, spiritual retreats, ashrams and mountain views.', costIndex: 1, popularityScore: 78 },
  { name: 'Kerala Backwaters (Alleppey)', country: 'India', region: 'South India', description: 'Houseboat cruises, tranquil backwaters, coconut groves, Ayurvedic spas and seafood.', costIndex: 3, popularityScore: 82 },
  { name: 'Varanasi', country: 'India', region: 'North India', description: 'Ancient spiritual city on the Ganges, temples, sunrise boat rides, ghats and cultural heritage.', costIndex: 1, popularityScore: 76 },
  { name: 'Ladakh (Leh)', country: 'India', region: 'North India', description: 'High-altitude desert, monasteries, biking trips, dramatic mountain landscapes and stargazing.', costIndex: 3, popularityScore: 85 },
  { name: 'Andaman Islands', country: 'India', region: 'Bay of Bengal', description: 'Tropical islands, scuba diving, coral reefs, white-sand beaches and snorkeling.', costIndex: 3, popularityScore: 79 },
  { name: 'Darjeeling', country: 'India', region: 'East India', description: 'Tea gardens, mountain toy train, Himalayan sunrise views and colonial hill-station charm.', costIndex: 2, popularityScore: 70 },
  { name: 'Amritsar', country: 'India', region: 'North India', description: 'The Golden Temple, Sikh heritage, langar community meals, Wagah border ceremony.', costIndex: 1, popularityScore: 74 },

  // Southeast Asia
  { name: 'Bali', country: 'Indonesia', region: 'Southeast Asia', description: 'Beaches, surfing, rice terraces, yoga retreats, temples and vibrant nightlife.', costIndex: 2, popularityScore: 93 },
  { name: 'Bangkok', country: 'Thailand', region: 'Southeast Asia', description: 'Street food, temples, floating markets, rooftop bars and bustling city energy.', costIndex: 2, popularityScore: 89 },
  { name: 'Phuket', country: 'Thailand', region: 'Southeast Asia', description: 'Tropical beaches, island-hopping, snorkeling, nightlife and seafood.', costIndex: 2, popularityScore: 83 },
  { name: 'Singapore', country: 'Singapore', region: 'Southeast Asia', description: 'Futuristic skyline, hawker food centers, gardens, shopping and family attractions.', costIndex: 5, popularityScore: 87 },
  { name: 'Hanoi', country: 'Vietnam', region: 'Southeast Asia', description: 'Old Quarter street food, lakes, French colonial architecture and motorbike culture.', costIndex: 1, popularityScore: 72 },

  // East Asia
  { name: 'Tokyo', country: 'Japan', region: 'East Asia', description: 'Neon-lit city, sushi, anime culture, temples, cherry blossoms and cutting-edge technology.', costIndex: 5, popularityScore: 92 },
  { name: 'Kyoto', country: 'Japan', region: 'East Asia', description: 'Ancient temples, geisha districts, bamboo groves, traditional tea ceremonies.', costIndex: 4, popularityScore: 81 },
  { name: 'Seoul', country: 'South Korea', region: 'East Asia', description: 'K-pop culture, street food markets, palaces, shopping and vibrant nightlife.', costIndex: 4, popularityScore: 78 },

  // Europe
  { name: 'Paris', country: 'France', region: 'Western Europe', description: 'Art, romance, cafes, iconic landmarks, fashion and world-class museums.', costIndex: 5, popularityScore: 96 },
  { name: 'Rome', country: 'Italy', region: 'Southern Europe', description: 'Ancient ruins, Vatican art, pasta, history and vibrant piazzas.', costIndex: 4, popularityScore: 91 },
  { name: 'Santorini', country: 'Greece', region: 'Southern Europe', description: 'Whitewashed cliffside villages, sunsets, volcanic beaches and Mediterranean cuisine.', costIndex: 4, popularityScore: 88 },
  { name: 'Barcelona', country: 'Spain', region: 'Southern Europe', description: 'Gaudi architecture, beaches, tapas, nightlife and Mediterranean culture.', costIndex: 3, popularityScore: 86 },
  { name: 'Amsterdam', country: 'Netherlands', region: 'Western Europe', description: 'Canals, cycling culture, museums, cafes and liberal nightlife.', costIndex: 4, popularityScore: 79 },
  { name: 'Interlaken', country: 'Switzerland', region: 'Central Europe', description: 'Alpine adventure sports, paragliding, hiking, mountain lakes and skiing.', costIndex: 5, popularityScore: 75 },

  // Middle East / Africa
  { name: 'Dubai', country: 'UAE', region: 'Middle East', description: 'Luxury shopping, desert safaris, skyscrapers, beaches and futuristic architecture.', costIndex: 5, popularityScore: 89 },
  { name: 'Marrakech', country: 'Morocco', region: 'North Africa', description: 'Souks, desert excursions, riads, spices and vibrant medina culture.', costIndex: 2, popularityScore: 77 },
  { name: 'Cape Town', country: 'South Africa', region: 'Southern Africa', description: 'Coastal cliffs, wine country, safaris nearby, mountain hikes and beaches.', costIndex: 3, popularityScore: 74 },

  // Americas / Oceania
  { name: 'New York City', country: 'USA', region: 'North America', description: 'Skyscrapers, Broadway shows, museums, diverse food scenes and nightlife.', costIndex: 5, popularityScore: 90 },
  { name: 'Bora Bora', country: 'French Polynesia', region: 'Oceania', description: 'Overwater bungalows, turquoise lagoons, snorkeling and honeymoon luxury.', costIndex: 5, popularityScore: 73 },

  // More India
  { name: 'Agra', country: 'India', region: 'North India', description: 'Taj Mahal, Mughal architecture, marble mausoleums, historic monuments and UNESCO heritage.', costIndex: 2, popularityScore: 87 },
  { name: 'Mysore', country: 'India', region: 'South India', description: 'Palaces, silk sarees, sandalwood, Dasara festival grandeur and royal Wodeyar heritage.', costIndex: 2, popularityScore: 71 },
  { name: 'Pondicherry', country: 'India', region: 'South India', description: 'French colonial quarter, seafront promenade, pastel villas, yoga ashrams and cafe culture.', costIndex: 2, popularityScore: 69 },
  { name: 'Munnar', country: 'India', region: 'South India', description: 'Rolling tea plantations, misty Western Ghats, spice gardens, waterfalls and cool hill-station air.', costIndex: 2, popularityScore: 73 },
  { name: 'Shimla', country: 'India', region: 'North India', description: 'Colonial hill-station capital, mall road promenades, cedar forests, toy train and mountain views.', costIndex: 2, popularityScore: 72 },
  { name: 'Hampi', country: 'India', region: 'South India', description: 'Ancient ruined temple city, boulder-strewn landscapes, UNESCO heritage and Vijayanagara Empire history.', costIndex: 1, popularityScore: 68 },

  // More Europe
  { name: 'London', country: 'UK', region: 'Western Europe', description: 'Royal palaces, world-class museums, West End theatre, multicultural food scenes and historic pubs.', costIndex: 5, popularityScore: 91 },
  { name: 'Prague', country: 'Czech Republic', region: 'Central Europe', description: 'Gothic spires, medieval old town, castle views, beer culture and cobblestone charm.', costIndex: 3, popularityScore: 82 },
  { name: 'Vienna', country: 'Austria', region: 'Central Europe', description: 'Imperial palaces, classical music heritage, coffeehouse culture, opera houses and elegant boulevards.', costIndex: 4, popularityScore: 80 },
  { name: 'Lisbon', country: 'Portugal', region: 'Southern Europe', description: 'Pastel hillside streets, fado music, tram rides, seafood and Atlantic coastal light.', costIndex: 3, popularityScore: 83 },
  { name: 'Reykjavik', country: 'Iceland', region: 'Northern Europe', description: 'Northern lights, geothermal hot springs, volcanic landscapes, glaciers and dramatic waterfalls.', costIndex: 5, popularityScore: 76 },
  { name: 'Chamonix', country: 'France', region: 'Western Europe', description: 'Alpine ski resort, Mont Blanc views, mountaineering, snowboarding and cable-car glacier access.', costIndex: 4, popularityScore: 74 },
  { name: 'Bordeaux', country: 'France', region: 'Western Europe', description: 'Wine-country vineyards, chateaux tastings, riverside architecture and gourmet French dining.', costIndex: 4, popularityScore: 71 },
  { name: 'Dubrovnik', country: 'Croatia', region: 'Balkans', description: 'Walled medieval old town, Adriatic sea views, UNESCO heritage and cinematic fortress ramparts.', costIndex: 4, popularityScore: 79 },

  // More Americas
  { name: 'Rio de Janeiro', country: 'Brazil', region: 'South America', description: 'Copacabana beaches, Christ the Redeemer, samba carnival energy and Sugarloaf Mountain views.', costIndex: 3, popularityScore: 85 },
  { name: 'Buenos Aires', country: 'Argentina', region: 'South America', description: 'Tango culture, steakhouse dining, European-style boulevards and vibrant nightlife.', costIndex: 2, popularityScore: 76 },
  { name: 'Cancun', country: 'Mexico', region: 'North America', description: 'Caribbean beaches, all-inclusive resorts, Mayan ruins nearby and turquoise reef snorkeling.', costIndex: 3, popularityScore: 81 },
  { name: 'Vancouver', country: 'Canada', region: 'North America', description: 'Mountain-meets-ocean skyline, rainforest hikes, seafood markets and outdoor adventure culture.', costIndex: 4, popularityScore: 75 },
  { name: 'Cusco', country: 'Peru', region: 'South America', description: 'Gateway to Machu Picchu, Incan ruins, Andean markets and high-altitude mountain trekking.', costIndex: 2, popularityScore: 78 },
  { name: 'San Francisco', country: 'USA', region: 'North America', description: 'Golden Gate views, cable cars, tech culture, foggy bay hikes and diverse food scenes.', costIndex: 5, popularityScore: 84 },

  // More Africa
  { name: 'Cairo', country: 'Egypt', region: 'North Africa', description: 'Pyramids of Giza, ancient tombs, Nile River cruises and bustling bazaar markets.', costIndex: 2, popularityScore: 83 },
  { name: 'Zanzibar', country: 'Tanzania', region: 'East Africa', description: 'Spice plantations, white-sand beaches, Stone Town history and turquoise Indian Ocean waters.', costIndex: 3, popularityScore: 77 },
  { name: 'Victoria Falls', country: 'Zambia', region: 'Southern Africa', description: 'Thundering waterfalls, bungee jumping, white-water rafting and safari game drives nearby.', costIndex: 3, popularityScore: 72 },
  { name: 'Merzouga', country: 'Morocco', region: 'North Africa', description: 'Sahara Desert dunes, camel trekking, desert camping under the stars and Berber nomad culture.', costIndex: 2, popularityScore: 70 },

  // More Southeast / East Asia
  { name: 'Kuala Lumpur', country: 'Malaysia', region: 'Southeast Asia', description: 'Twin Towers skyline, hawker food courts, rainforest day trips and multicultural heritage.', costIndex: 2, popularityScore: 75 },
  { name: 'Siem Reap', country: 'Cambodia', region: 'Southeast Asia', description: 'Angkor Wat temple complex, UNESCO heritage, jungle ruins and sunrise temple tours.', costIndex: 1, popularityScore: 78 },
  { name: 'Osaka', country: 'Japan', region: 'East Asia', description: 'Street food capital, castle grounds, neon nightlife and easy access to Kyoto and Nara.', costIndex: 4, popularityScore: 79 },
  { name: 'Hong Kong', country: 'China', region: 'East Asia', description: 'Skyscraper skyline, dim sum culture, harbor ferries, night markets and mountain hiking trails.', costIndex: 5, popularityScore: 82 },

  // More Oceania / Caribbean
  { name: 'Queenstown', country: 'New Zealand', region: 'Oceania', description: 'Bungee jumping birthplace, alpine lakes, ski slopes and adrenaline adventure sports capital.', costIndex: 4, popularityScore: 76 },
  { name: 'Havana', country: 'Cuba', region: 'Caribbean', description: 'Classic vintage cars, colonial architecture, live salsa music and cigar culture streets.', costIndex: 2, popularityScore: 71 },
];
