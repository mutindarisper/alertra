export interface DisasterFeature {
  geometry: { coordinates: [number, number] }
  properties: {
    eventid?: string | number
    episodeid?: string | number
    eventtype?: string
    eventname?: string
    name?: string
    htmldescription?: string
    description?: string
    country?: string
    alertlevel?: string
    fromdate?: string
    todate?: string
    severitydata?: { severitytext?: string }
    [key: string]: any
  }
}

/**
 * GDACS event names are inconsistent — `country` is often empty and `eventname`
 * can come back as a dangling phrase like "Earthquake in ". Pick the first
 * usable label and tidy it up.
 */
export const eventTitle = (properties: Record<string, any> | undefined): string => {
  const candidates = [properties?.eventname, properties?.name, properties?.country]

  for (const candidate of candidates) {
    const cleaned =
      typeof candidate === "string"
        ? candidate.trim().replace(/\s+(in|of|near|at)$/i, "").trim()
        : ""
    if (cleaned) return cleaned
  }

  return "Unnamed event"
}

/**
 * Stable identity for a feature, used to pair an alert card with its map marker.
 * Falls back to the coordinates when GDACS omits the ids.
 */
export const eventKey = (feature: DisasterFeature): string => {
  const { eventid, episodeid } = feature.properties

  if (eventid !== undefined && eventid !== null && eventid !== "") {
    return `${eventid}-${episodeid ?? 0}`
  }

  const [lng, lat] = feature.geometry?.coordinates ?? []
  return `${lng},${lat}`
}
