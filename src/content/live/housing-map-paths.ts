/** Capital-region municipality outlines for Housing Pulse choropleth.
 * Projected from Statistics Finland kunta4500k (ETRS-TM35FIN → SVG).
 * License: CC BY 4.0 — Statistics Finland.
 */

export type HousingMapShapeId = "091" | "049" | "092";

export type HousingMapShape = {
  id: HousingMapShapeId;
  label: string;
  d: string;
};

export const HOUSING_MAP_VIEWBOX = "0 0 640 520";

export const HOUSING_MAP_ATTRIBUTION = "Municipality borders \u00a9 Statistics Finland (CC BY 4.0), simplified kunta4500k";

export const HOUSING_MAP_SHAPES: HousingMapShape[] = [
  { id: "091" as const, label: "Helsinki", d: "M603.0 289.9 L593.4 292.3 L568.4 324.4 L560.9 370.7 L548.4 381.2 L526.7 381.3 L498.5 372.8 L489.9 381.4 L498.8 433.2 L490.2 452.8 L466.5 476.6 L449.2 478.9 L436.1 470.3 L436.0 438.0 L436.0 422.9 L429.5 418.5 L388.5 455.5 L369.0 462.1 L338.8 464.4 L308.3 436.5 L299.5 427.9 L292.0 426.5 L288.9 425.7 L273.4 425.8 L275.7 275.8 L428.2 224.1 L482.6 265.9 L475.4 300.1 L517.3 310.2 L536.9 292.2 L524.1 258.2 L562.7 233.8 L628.0 215.7 L610.5 254.6 L603.0 289.9 Z" },
  { id: "049" as const, label: "Espoo\u2013Kauniainen", d: "M215.1 133.2 L237.9 294.7 L275.7 275.8 L273.4 425.8 L262.7 425.9 L226.0 437.0 L169.8 465.3 L148.1 467.6 L135.2 450.3 L122.1 437.5 L106.8 438.0 L12.0 332.6 L26.0 223.4 L34.8 172.2 L65.4 172.2 L119.6 101.8 L215.1 133.2 Z M242.4 327.4 L212.9 380.3 L162.2 375.8 L142.6 345.5 L138.8 309.2 L191.0 288.0 L242.4 327.4 Z" },
  { id: "092" as const, label: "Vantaa", d: "M460.3 86.2 L552.0 119.8 L506.3 163.8 L547.5 192.0 L562.7 233.8 L524.1 258.2 L536.9 292.2 L517.3 310.2 L475.4 300.1 L482.6 265.9 L428.2 224.1 L275.7 275.8 L237.9 294.7 L215.1 133.2 L313.2 41.1 L377.7 153.4 L444.1 139.6 L460.3 86.2 Z" },
];

