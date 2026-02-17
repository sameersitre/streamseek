import { OTTPlatform, Watchmode } from '../types'

const removeDuplicates = (arr: object[], prop) => {
  return arr.filter(
    (obj, index, self) =>
      index === self.findIndex((t) => (prop ? t[prop] === obj[prop] : JSON.stringify(t) === JSON.stringify(obj))),
  )
}

export const restruct_ott = (data) => {
  return {
    id: parseInt(data.id),
    type: data.type,
    locations: data.collection.locations,
  }
}

export const restruct_watchmode_ott_streams = (data: Watchmode[]) => {
  const platforms = data.map((a) => {
    return {
      display_name: a.name,
      id: a.source_id,
      url: a.web_url,
      region: a.region,
    }
  })
  const uniqueData = removeDuplicates(platforms as unknown as OTTPlatform[], 'url')
  return uniqueData
}
