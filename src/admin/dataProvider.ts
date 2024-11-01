import { fetchUtils, Options } from 'react-admin'
import ourSimpleRestProvider from './ourSimpleDataProvider'


const httpClient = (url: string, options: Options = {}) => {
  if (!options.headers) {
      options.headers = new Headers({ Accept: 'application/json' })
  }
  options.headers.set('Authorization', 'KSuokwNliA3Lzo8J')
  return fetchUtils.fetchJson(url, options)
}


export const dataProvider = ourSimpleRestProvider(
  import.meta.env.VITE_SIMPLE_REST_URL,
  httpClient
)
