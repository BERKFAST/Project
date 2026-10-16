import { useQuery } from '@tanstack/react-query';
import { listings } from '../../listings.js';

export const propertiesQueryKey = ['properties'];

async function fetchProperties() {
  return listings;
}

export function useProperties() {
  return useQuery({
    queryKey: propertiesQueryKey,
    queryFn: fetchProperties,
    retry: false,
  });
}
