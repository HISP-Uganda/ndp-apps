import { useLoaderData, useParams, useSearch } from '@tanstack/react-router';
import Filter from './Filter';

export default function GroupSetBasedFilters() {
  const { dataElementGroupSets } = useLoaderData({ from: '__root__' });
  const { v, degs } = useSearch({ from: '/ndp/$item' });
  const { item } = useParams({ from: '/ndp/$item' });
  const filtered = dataElementGroupSets.filter(({ attributeValues }) => {
    const current = attributeValues.map((a) => a.value);
    return [v, item].every((a) => current.includes(a));
  });
  return (
    <Filter
      first={filtered.map(({ id, name }) => ({
        value: id,
        label: name,
      }))}
      second={filtered.flatMap(({ dataElementGroups, id }) => {
        if (id === degs) {
          return dataElementGroups.map(({ id, name }) => ({
            value: id,
            label: name,
          }));
        }
        return [];
      })}
    />
  );
}
