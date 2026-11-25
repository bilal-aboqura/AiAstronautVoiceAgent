import { PLANETS_DATA, SUN_CONFIG } from './planets';
import { RobotAnimation } from '../types/solar-system';

export interface AiResponseResult {
  text: string;
  planetId?: string;
  animation?: RobotAnimation;
}

export function processAiQuery(rawInput: string): AiResponseResult {
  const query = rawInput.trim().toLowerCase();

  // 1. Direct planet matching
  const planetKeywords: Record<string, string[]> = {
    mercury: ['mercury', 'عطارد'],
    venus: ['venus', 'الزهرة'],
    earth: ['earth', 'الأرض', 'الارض', 'home planet', 'blue planet'],
    mars: ['mars', 'المريخ', 'red planet'],
    jupiter: ['jupiter', 'المشتري', 'giant planet', 'biggest planet', 'great red spot'],
    saturn: ['saturn', 'زحل', 'rings', 'ringed planet', 'titan'],
    uranus: ['uranus', 'أورانوس', 'اورانوس', 'tilted planet', 'ice giant'],
    neptune: ['neptune', 'نبتون', 'windy planet', 'furthest planet', 'blue giant'],
    sun: ['sun', 'الشمس', 'star', 'solar core'],
  };

  // 2. Specific questions & comparisons
  if (query.includes('compare') && (query.includes('earth') || query.includes('mars'))) {
    return {
      text: "Comparing Earth and Mars: Earth is nearly twice the diameter of Mars (12,742 km vs 6,779 km) with 10 times more mass. While Earth possesses a protective magnetic shield, liquid oceans, and a breathable 1-bar atmosphere, Mars has a thin CO₂ atmosphere (0.006 bar), dry iron-oxide deserts, and ancient riverbeds. Mars represents humanity's primary frontier for interplanetary settlement!",
      planetId: 'mars',
      animation: 'Wave',
    };
  }

  if (query.includes('biggest') || query.includes('largest')) {
    const jup = PLANETS_DATA.find((p) => p.id === 'jupiter')!;
    return {
      text: `Jupiter is by far the largest planet in our solar system! With a diameter of ${jup.diameter} and a mass of ${jup.mass}, it is more than twice as massive as all other planets combined. Let me take you for a close-up look at its swirling cloud bands.`,
      planetId: 'jupiter',
      animation: 'ThumbsUp',
    };
  }

  if (query.includes('smallest')) {
    const merc = PLANETS_DATA.find((p) => p.id === 'mercury')!;
    return {
      text: `Mercury is the smallest planet in the solar system, with a diameter of only ${merc.diameter} — barely larger than Earth's Moon! It orbits closest to the Sun and experiences dramatic temperature swings.`,
      planetId: 'mercury',
      animation: 'Wave',
    };
  }

  if (query.includes('hottest') || query.includes('hot')) {
    const ven = PLANETS_DATA.find((p) => p.id === 'venus')!;
    return {
      text: `Venus holds the title of the hottest planet! Even though Mercury is closer to the Sun, Venus's crushing carbon dioxide atmosphere traps heat in an extreme runaway greenhouse effect, heating the surface to a scorching ${ven.temperature}.`,
      planetId: 'venus',
      animation: 'Wave',
    };
  }

  if (query.includes('ring') || query.includes('rings')) {
    const sat = PLANETS_DATA.find((p) => p.id === 'saturn')!;
    return {
      text: `Saturn's rings are one of the greatest wonders of the cosmos! They span over 280,000 kilometers wide yet are astonishingly thin, often only 10 to 30 meters thick, composed of trillions of water ice fragments. Navigating us toward Saturn now!`,
      planetId: 'saturn',
      animation: 'ThumbsUp',
    };
  }

  if (query.includes('moon') || query.includes('moons')) {
    return {
      text: "Saturn boasts the highest number of confirmed moons in our solar system at 146, including the smog-shrouded supermoon Titan and icy Enceladus! Jupiter is second with 95 moons, including the ocean-bearing world Europa.",
      planetId: 'saturn',
      animation: 'Wave',
    };
  }

  if (query.includes('hello') || query.includes('hi') || query.includes('who are you') || query.includes('مرحبا')) {
    return {
      text: "Greetings, Explorer! I am your AI Space Guide. Ask me about any planet in the solar system, compare celestial bodies, or ask about cosmic phenomena, and I will guide our perspective across the cosmos.",
      animation: 'Wave',
    };
  }

  // 3. Match individual planet names
  for (const [planetId, keywords] of Object.entries(planetKeywords)) {
    if (keywords.some((kw) => query.includes(kw))) {
      const planet =
        planetId === 'sun'
          ? SUN_CONFIG
          : PLANETS_DATA.find((p) => p.id === planetId);

      if (planet) {
        return {
          text: `Focusing on ${planet.name} (${planet.arabicName}) — ${planet.tagline}. ${planet.description} Diameter: ${planet.diameter}. Orbital period: ${planet.orbitalPeriod}.`,
          planetId: planet.id,
          animation: 'Walking',
        };
      }
    }
  }

  // 4. Fallback intelligent response
  return {
    text: `Understood, Explorer! I am analyzing "${rawInput}". Try asking me to explore a specific planet like "Tell me about Earth", "Explore Mars", "What is the biggest planet?", or "Tell me about Saturn's rings".`,
    animation: 'Wave',
  };
}
