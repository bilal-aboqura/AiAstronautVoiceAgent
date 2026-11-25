# Asset Attribution & License Documentation

This project uses planetary texture maps and space assets made available under public domain and Creative Commons licenses:

## 1. Solar System Scope
- **Source**: [Solar System Scope Textures](https://www.solarsystemscope.com/textures/)
- **License**: Creative Commons Attribution 4.0 International (CC-BY 4.0)
- **Attribution**: "Solar System Scope (solarsystemscope.com)"
- **Used Assets**: Textures for Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Saturn Rings, Uranus, Neptune.

## 2. NASA / Jet Propulsion Laboratory (JPL) / USGS Astrogeology
- **Source**: [NASA Solar System Exploration](https://solarsystem.nasa.gov/)
- **License**: Public Domain (NASA Material)
- **Attribution**: NASA / JPL-Caltech / USGS
- **Used Assets**: Scientific color references and planetary surface mapping data.

## Note on Fallback Rendering
In the event that texture assets are not yet downloaded or fail to load, the 3D rendering pipeline uses realistic procedural and physical materials (`meshStandardMaterial`) with NASA-calibrated hexadecimal color values to ensure seamless, zero-error rendering across all devices.
